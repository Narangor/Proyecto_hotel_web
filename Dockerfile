# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile — Hotel Santa María
# Build multi-etapa para minimizar el tamaño de la imagen de producción.
#
# Etapas:
#   1. deps    — instala dependencias de producción y desarrollo
#   2. builder — compila la aplicación Next.js (genera .next/standalone)
#   3. runner  — imagen final mínima que solo incluye los archivos necesarios
#
# Uso:
#   docker build -t hotel-santa-maria .
#   docker run -p 3000:3000 hotel-santa-maria
# ─────────────────────────────────────────────────────────────────────────────

# ── Etapa 1: Dependencias ─────────────────────────────────────────────────────
# node:24-alpine coincide con el entorno de desarrollo local (Node v24).
# Usar la misma versión mayor garantiza que npm resuelva las dependencias
# de forma idéntica en local y en el contenedor.
FROM node:24-alpine AS deps

# libc6-compat es necesario para algunos binarios nativos en Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar solo los manifiestos de dependencias para aprovechar la caché de capas.
# Si package.json no cambia, esta capa se reutiliza en builds posteriores.
COPY package.json package-lock.json ./

# npm ci garantiza una instalación reproducible usando exactamente el
# package-lock.json (equivalente a una instalación limpia).
RUN npm ci


# ── Etapa 2: Build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente completo
COPY . .

# Deshabilitar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED=1

# Compilar la aplicación Next.js.
# Con output: 'standalone' en next.config.ts, Next.js genera
# .next/standalone — un bundle mínimo con todo lo necesario para producción.
RUN npm run build


# ── Etapa 3: Runner (imagen final) ────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario y grupo sin privilegios para ejecutar la app.
# No ejecutar como root es una buena práctica de seguridad en contenedores.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar los archivos estáticos públicos
COPY --from=builder /app/public ./public

# Permite escritura en .next (p. ej. caché de next/image)
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copiar el bundle standalone (incluye server.js y las dependencias de producción)
# y .next/static (CSS, JS, fuentes next/font). Requerido para tipografía y estilos.
# --chown asigna el propietario al usuario nextjs sin necesidad de RUN chown.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ejecutar como usuario sin privilegios
USER nextjs

# Puerto en el que escucha Next.js
EXPOSE 3000

ENV PORT=3000
# HOSTNAME=0.0.0.0 es necesario para que el servidor escuche en todas las
# interfaces de red del contenedor, no solo en localhost.
ENV HOSTNAME="0.0.0.0"

# server.js es el entrypoint generado por Next.js con output: 'standalone'
CMD ["node", "server.js"]
