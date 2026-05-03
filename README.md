# Hotel Santa María — Plataforma de Gestión Hotelera

Aplicación web para la gestión integral de un hotel de lujo: página pública con reservas en línea, gestión de clientes, reservas, check-in digital, pagos, PQRS, solicitudes de servicio, inscripciones, paquetes promocionales, tours y asistente virtual IA. Desarrollada como proyecto del curso ISIS 3710 - Programación con Tecnologías Web, Universidad de los Andes.

---

## Ejecución con Docker

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

### 1. Construir la imagen

```bash
docker build -t hotel-santa-maria .
```

El build usa tres etapas (`deps → builder → runner`) para producir una imagen de producción optimizada. El proceso tarda ~2 minutos en el primer build; los siguientes son más rápidos gracias al caché de capas de Docker.

### 2. Ejecutar el contenedor

```bash
docker run -p 3000:3000 hotel-santa-maria
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).
El sistema redirige automáticamente a `/es` (español por defecto).

### 3. Detener el contenedor

```bash
# Listar contenedores activos y obtener el ID
docker ps

# Detener por ID
docker stop <container-id>
```

### Opciones adicionales

```bash
# Ejecutar en segundo plano (modo daemon)
docker run -d -p 3000:3000 --name hotel hotel-santa-maria

# Ver logs
docker logs hotel

# Detener por nombre
docker stop hotel && docker rm hotel

# Cambiar puerto (si 3000 está ocupado)
docker run -p 8080:3000 hotel-santa-maria
# → Acceder en http://localhost:8080
```

---

## Desarrollo local (sin Docker)

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con hot reload
npm run dev
# → http://localhost:3000

# Build de producción
npm run build && npm run start

# Linting
npm run lint

# Tests unitarios
npm run test          # ejecutar todos los tests
npm run test:watch    # modo observador
npm run test:coverage # reporte de cobertura

# Tests E2E (Playwright)
npx playwright install chromium # una vez por máquina
npm run test:e2e # levanta Next en el puerto 3456 (PLAYWRIGHT_PORT) y ejecuta ./e2e
```

---

## Justificaciones técnicas

### Next.js 16 con App Router

Se utiliza Next.js como framework principal por tres razones:

1. **Requisito del curso:** La rúbrica especifica React con Next.js.
2. **App Router:** Permite la separación natural entre Server Components (sin JavaScript en el cliente) y Client Components (interactivos). Los módulos de gestión usan Server Components para metadata y Client Components para la interactividad.
3. **`output: 'standalone'`:** Genera un bundle de producción autocontenido que solo incluye las dependencias de producción necesarias, reduciendo el tamaño de la imagen Docker de ~500 MB a ~150 MB.

### Tailwind CSS v4

Tailwind v4 reemplaza `tailwind.config.js` con variables CSS nativas en `@theme {}` dentro de `globals.css`. Esto permite definir la paleta de colores del Hotel Santa María (`gold-*`, `brown-*`, `cream`) directamente en CSS sin archivos de configuración adicionales, y genera clases de utilidad automáticamente.

### next-intl v4 para internacionalización (i18n)

La aplicación soporta español (`/es`) e inglés (`/en`) desde el primer ciclo porque:

- La rúbrica exige i18n como requisito de la infraestructura.
- next-intl v4 está diseñada específicamente para Next.js App Router, con soporte nativo de Server Components.
- El segmento `[locale]` en la ruta garantiza que el atributo `lang` del `<html>` sea siempre correcto, cumpliendo el requisito de accesibilidad (WCAG 3.1.1).

Todos los textos visibles al usuario pasan por `useTranslations()` — no hay strings hardcodeadas en el código.

### Jest 30 con el transformador `next/jest` (SWC)

Se usa `next/jest` en lugar de `ts-jest` por incompatibilidad de versiones: `ts-jest` v29 no es compatible con Jest v30. El transformador SWC de Next.js es además significativamente más rápido y lee el `tsconfig.json` automáticamente, incluyendo los path aliases (`@/*`).

**Resultado:** 113 tests en 22 suites, todos pasando, sin configuración adicional de TypeScript.

### Hooks personalizados como capa de lógica

Todo el estado y la lógica de negocio está encapsulada en hooks (`useClientes`, `useReservas`, `useCheckin`, `usePagos`, `usePqrs`, `useSolicitudes`, `useInscripciones`, `usePaquetes`, `useTours`, `useHome`, `useChat`, `useReservar`). Los componentes solo reciben props y renderizan — no contienen lógica de negocio. Esta separación:

- Permite testear la lógica con `renderHook()` sin necesidad de renderizar componentes.
- Facilita la migración a una API real en Ciclo 2: solo se modifican los hooks, no los componentes.

Los hooks aceptan datos iniciales como parámetros opcionales (`initialClientes?`, `reservas?`) para que los tests unitarios sean determinísticos sin usar mocks globales.

### Accesibilidad (a11y)

Todos los componentes interactivos incluyen:

- Atributos `aria-*` (aria-label, aria-required, aria-invalid, aria-describedby, aria-live).
- HTML semántico (`<header>`, `<main>`, `<table>`, `<thead>`, `<tbody>`, role="dialog").
- Navegación completa con teclado (tecla Escape para cerrar modales, foco gestionado).
- IDs únicos generados con `useId()` de React para asociar labels con inputs.

### Docker multi-etapa

El `Dockerfile` usa tres etapas para optimizar el tamaño y la seguridad:

| Etapa | Base | Propósito |
|---|---|---|
| `deps` | `node:24-alpine` | Instala dependencias con `npm ci` |
| `builder` | `node:24-alpine` | Compila con `npm run build` |
| `runner` | `node:24-alpine` | Imagen final mínima (solo `.next/standalone`) |

Se usa `node:24-alpine` (en lugar de 20 o 22) para coincidir con la versión de desarrollo local (Node v24), garantizando que `npm ci` resuelva el `package-lock.json` de forma idéntica en ambos entornos.

El usuario de producción es `nextjs` (sin privilegios de root), siguiendo las buenas prácticas de seguridad para contenedores.

---

## Módulos implementados

### Páginas públicas

| Módulo | Ruta | Descripción |
|---|---|---|
| Landing Page | `/es/home` | Hero, explorar, legado, footer, asistente virtual IA (chat mock) |
| Flujo de Reserva | `/es/reservar` | Selección de habitación en 3 pasos con resumen de precio en tiempo real |
| Login de Personal | `/es/login` | Acceso al panel de administración |

### Módulos de administración

| Módulo | Ruta | HUs |
|---|---|---|
| Gestión de Clientes | `/es/clientes` | HU-C1, HU-C2, HU-C3, HU-C4 |
| Gestión de Reservas | `/es/reservas` | HU-R1, HU-R2, HU-R3, HU-R4 |
| Check-in Digital | `/es/checkin` | HU-K1, HU-K2, HU-K3, HU-K4 |
| Gestión de Pagos | `/es/pagos` | HU-P1, HU-P2, HU-P3, HU-P4, HU-P5 |
| Gestión de PQRS | `/es/pqrs` | HU-Q1, HU-Q2, HU-Q3, HU-Q4, HU-Q5, HU-Q6 |
| Gestión de Solicitudes | `/es/solicitudes` | HU-S1, HU-S2, HU-S3, HU-S4, HU-S5, HU-S6 |
| Inscripciones (eventos y restaurante) | `/es/inscripciones` | HU-I1, HU-I2, HU-I3, HU-I4 |
| Paquetes Promocionales | `/es/paquetes` | HU-PA1, HU-PA2, HU-PA3, HU-PA4 |
| Agendamiento de Tours | `/es/tours` | HU-T1, HU-T2, HU-T3, HU-T4 |

Todas las rutas están disponibles en español (`/es/`) e inglés (`/en/`).

**Tests:** 113 tests unitarios en 22 suites — todos pasando.

### Bono IA

Asistente virtual mock integrado en la landing page: el botón flotante abre un panel de chat que responde preguntas sobre habitaciones, precios, servicios, check-in/out, spa, restaurante y tours usando respuestas predeterminadas con detección de palabras clave. Incluye skeleton animado durante la respuesta simulada.

---

## Estructura del proyecto

```
app/[locale]/
  home/                # Landing page pública (hero, explorar, legado, chat IA)
  login/               # Login del personal
  reservar/            # Flujo de reserva cliente (3 pasos)
  clientes/            # Gestión de clientes (CRUD)
  reservas/            # Gestión de reservas
  checkin/             # Check-in digital
  pagos/               # Gestión de pagos
  pqrs/                # Quejas, reclamos y sugerencias
  solicitudes/         # Solicitudes de servicio (limpieza, mantenimiento, etc.)
  inscripciones/       # Inscripciones a eventos y restaurante
  paquetes/            # Paquetes promocionales
  tours/               # Agendamiento de tours
    components/        # Componentes de presentación (solo props)
    hooks/             # Lógica de negocio y estado
    __tests__/         # Tests unitarios colocados junto al módulo

components/ui/         # Componentes compartidos: Badge, Modal, EmptyState,
                       # FormField, NavAdmin, NavPublic, AdminShell, buttonClasses
messages/              # Traducciones: es.json y en.json (todos los namespaces sincronizados)
types/                 # Tipos TypeScript compartidos (re-exportados desde types/index.ts)
lib/                   # Mock data para todos los módulos
public/images/         # Imágenes y SVGs del hotel (hero, habitaciones, iconos, footer)
docs/                  # Decisiones técnicas e historias de usuario
```

---

# Decisiones Técnicas — Hotel Santa María

Este documento registra cada decisión de arquitectura e implementación tomada en el proyecto, con su justificación. El objetivo es que cualquier integrante del equipo entienda el *porqué* detrás de cada elección.

---

## Índice

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Configuración de Jest](#2-configuración-de-jest)
3. [Internacionalización (i18n) con next-intl](#3-internacionalización-i18n-con-next-intl)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Tipos TypeScript](#5-tipos-typescript)
6. [Mock data](#6-mock-data)
7. [Gestión de estado con hooks personalizados](#7-gestión-de-estado-con-hooks-personalizados)
8. [Sistema de diseño](#8-sistema-de-diseño--hotel-santa-maría)
9. [Arquitectura del módulo Clientes](#9-arquitectura-del-módulo-gestión-de-clientes)
10. [Arquitectura del módulo Reservas](#10-arquitectura-del-módulo-gestión-de-reservas)
11. [Arquitectura del módulo Check-in](#11-arquitectura-del-módulo-check-in-digital)
12. [Módulos adicionales](#12-módulos-adicionales-pagos-pqrs-solicitudes-inscripciones-paquetes-tours)
13. [Páginas públicas y bono IA](#13-páginas-públicas-y-bono-ia)

---

## 1. Stack tecnológico

| Tecnología | Versión | Razón |
|---|---|---|
| Next.js | 16.2.1 | Requerido |
| React | 19.2.3 | Incluido con Next.js |
| TypeScript | 5.x | Requerido |
| Tailwind CSS | 4.x | Styling utility-first, `@theme` nativo en globals.css sin config adicional |
| next-intl | 4.8.x | i18n mejor integración con App Router |
| lucide-react | 0.577.x | Iconos SVG (Menu, X, Send, etc.) sin dependencia pesada |
| Jest | 30.x | Testing requerido |
| React Testing Library | 16.x | Estándar para testing de componentes React |

---

## 2. Configuración de Jest

### 2.1 Por qué `next/jest` en lugar de `ts-jest`

**Decisión:** Usar el transformador `next/jest` (basado en SWC) para compilar TypeScript en los tests, en lugar de `ts-jest`.

**Razón:**
- `next/jest` usa el mismo compilador SWC que usa Next.js en producción, garantizando consistencia entre el entorno de test y el de build.
- `ts-jest` v29 no es compatible con Jest v30 (que es la versión más reciente). Usar `next/jest` evita este conflicto de versiones.
- `next/jest` lee automáticamente `tsconfig.json` y `next.config.ts`, incluyendo los path aliases (`@/*`) sin configuración adicional.
- Es significativamente más rápido que `ts-jest` gracias a SWC (compilador en Rust).

> `ts-jest` quedó instalado en `devDependencies` pero no se usa en la configuración. Puede removerse en el futuro si genera confusión.

### 2.2 `testEnvironment: 'jsdom'`

**Decisión:** Usar `jsdom` como entorno de test.

**Razón:** Los componentes React necesitan un DOM simulado para renderizarse y recibir eventos. `jsdom` provee esto sin necesidad de un navegador real. Es el estándar para testing de componentes con React Testing Library.

### 2.3 `setupFilesAfterEnv`

**Decisión:** Ejecutar `jest.setup.ts` después del framework de test.

**Razón:** `@testing-library/jest-dom` añade matchers como `toBeInTheDocument()` y `toHaveValue()` al objeto `expect` de Jest. Estos matchers deben estar disponibles cuando los tests corran, por eso se importan en `setupFilesAfterEnv` (que corre *después* de que Jest está inicializado) y no en `setupFiles`.

### 2.4 Estructura de tests junto al código

**Decisión:** Los tests viven en carpetas `__tests__/` dentro de cada módulo (ej. `app/clientes/__tests__/`).

**Razón:** Mantener los tests cerca del código que prueban facilita la navegación y garantiza que si se mueve o elimina un módulo, los tests se mueven/eliminan también. Evita una carpeta `tests/` global desconectada del código.

---

## 3. Internacionalización (i18n) con next-intl

### 3.1 Por qué next-intl

**Decisión:** Usar `next-intl` como librería de i18n.

**Razón:**
- Diseñada específicamente para Next.js App Router con soporte nativo de Server Components (no requiere `'use client'` para cargar traducciones en el servidor).
- API simple: `useTranslations('namespace')` en Client Components, `getTranslations()` en Server Components.
- El Plugin de Next.js (`createNextIntlPlugin`) integra la carga de mensajes al pipeline de compilación de forma transparente.
- Soporte de TypeScript con autocompletado de claves de traducción si se configura el tipo global (opcional para Ciclo 1).

### 3.2 Estructura de segmento `[locale]`

**Decisión:** Mover todas las rutas bajo `app/[locale]/` en lugar de usar una solución sin segmento.

**Razón:**
- Permite que el atributo `lang` del `<html>` refleje el locale real del usuario (`<html lang="es">` vs `<html lang="en">`), lo cual es un **requisito de accesibilidad (a11y)** — los lectores de pantalla usan este atributo para pronunciar el contenido correctamente.
- Las URLs incluyen el locale explícitamente (`/es/clientes`, `/en/clientes`), lo que facilita el compartir enlaces y el SEO.
- Es el patrón recomendado por la documentación oficial de next-intl.

### 3.3 Dos layouts (`app/layout.tsx` y `app/[locale]/layout.tsx`)

**Decisión:** `app/layout.tsx` es un pass-through mínimo; `app/[locale]/layout.tsx` tiene el contenido real.

**Razón:** Next.js requiere un layout en la raíz del `app/`. Sin embargo, si ponemos el `<html lang="es">` en `app/layout.tsx`, el locale quedaría hardcodeado. Al delegarlo a `app/[locale]/layout.tsx`, el `lang` puede ser dinámico según el locale activo.

### 3.4 Locales soportados

**Decisión:** `es` (español) como locale por defecto, `en` (inglés) como secundario.

**Razón:** El mercado objetivo principal es Colombia (turismo local e internacional). El español es el idioma de operación del hotel. El inglés es obligatorio para atender turistas internacionales y cumple con el requisito de i18n de la rúbrica.

### 3.5 `i18n/navigation.ts`

**Decisión:** Usar `createNavigation` para crear versiones tipadas de `Link`, `useRouter`, etc.

**Razón:** Las versiones de next-intl de estos componentes añaden el prefijo de locale automáticamente. Si se usa `<Link href="/clientes">` de `@/i18n/navigation`, genera `/es/clientes` o `/en/clientes` según el locale activo, sin que el desarrollador tenga que pensar en eso. Usar `next/link` directamente requeriría construir el path manualmente.

### 3.6 Estructura de mensajes

**Decisión:** Organizar los mensajes en namespaces por funcionalidad (`home`, `login`, `navAdmin`, `reservar`, `clientes`, `reservas`, `checkin`, `pagos`, `pqrs`, `solicitudes`, `inscripciones`, `paquetes`, `tours`, `chat`, `common`). Los dos archivos (`es.json` y `en.json`) están sincronizados con las mismas claves.

**Razón:** Cada módulo importa solo su namespace (`useTranslations('clientes')`), lo que:
- Reduce el acoplamiento entre módulos.
- Facilita saber qué traducciones pertenecen a qué funcionalidad.
- Permite que `common` centralice textos reutilizables (Guardar, Cancelar, etc.) sin duplicación.

---

## 4. Estructura de carpetas

### 4.1 Colocation por funcionalidad

**Decisión:** Agrupar componentes, hooks y tests por funcionalidad dentro de `app/[locale]/[feature]/`.

```
app/[locale]/clientes/
  page.tsx
  components/
  hooks/
  __tests__/
```

**Razón:**
- Evita una estructura plana donde todos los componentes conviven sin contexto.
- Cada funcionalidad es un "módulo" independiente: puede desarrollarse, testearse y entenderse sin necesidad de conocer el resto del proyecto.
- Si una funcionalidad se elimina, se elimina toda su carpeta sin dejar huérfanos.

### 4.2 `types/` en la raíz

**Decisión:** Los tipos compartidos viven en `types/` a nivel de raíz, con `index.ts` re-exportando todo.

**Razón:** Los tipos (`Cliente`, `Reserva`, `Checkin`) son compartidos entre módulos (ej. el módulo de check-in necesita el tipo `Reserva`). Ponerlos en la raíz evita imports circulares y centraliza la fuente de verdad del modelo de datos.

### 4.3 `lib/` para utilidades y datos

**Decisión:** `lib/mock-data.ts` y futuras utilidades compartidas viven en `lib/`.

**Razón:** Separación clara entre "datos/utilidades" (`lib/`) y "lógica de presentación" (`components/`, `hooks/`). Es una convención común en proyectos Next.js.

---

## 5. Tipos TypeScript

### 5.1 Tipos de estado como union types

**Decisión:** Usar union types en lugar de enums para los estados.

```ts
// ✅ Elegido
type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'en_curso' | 'completada';

// ❌ Descartado
enum EstadoReserva { Pendiente, Confirmada, ... }
```

**Razón:**
- Los string union types son más legibles en el código y en el debugger (el valor en runtime es el string literal, no un número).
- Los enums de TypeScript generan código JavaScript adicional en el bundle.
- Los union types son más idiomáticos en el ecosistema React/TypeScript moderno.

### 5.2 `ClienteFormData` como `Omit<Cliente, ...>`

**Decisión:** Los tipos de formulario se derivan de la interfaz principal con `Omit`.

**Razón:** Evita duplicar la definición de campos. Si se agrega un campo a `Cliente`, `ClienteFormData` lo hereda automáticamente (a menos que se excluya explícitamente). Mantiene una única fuente de verdad.

### 5.3 Constantes de estados válidos

**Decisión:** Exportar constantes como `RESERVA_ESTADOS_EDITABLES` junto a los tipos.

```ts
export const RESERVA_ESTADOS_EDITABLES: EstadoReserva[] = ['pendiente', 'confirmada'];
```

**Razón:** La lógica de "¿se puede editar esta reserva?" se basa en el estado. Al centralizar los estados válidos en una constante, tanto el hook como los tests usan la misma lista, evitando que se desincronicen si un estado cambia.

### 5.4 `fechaHoraCheckin: string | null`

**Decisión:** El campo es `null` cuando el check-in no se ha realizado (estado pendiente).

**Razón:** Refleja la semántica real del dominio: un check-in "pendiente" no tiene fecha de ingreso todavía. Usar `null` en lugar de una string vacía `''` o `undefined` hace que la comprobación sea explícita y el tipo comunica la intención.

---

## 6. Mock data

### 6.1 Por qué mock data en lugar de una API real en Ciclo 1

**Decisión:** Usar datos hardcodeados en `lib/mock-data.ts` para Ciclo 1.

**Razón:**
- La rúbrica de Ciclo 1 evalúa la **interfaz de usuario** y la **lógica de hooks**, no la integración con backend.
- Permite desarrollar y testear el frontend de forma independiente.
- Los hooks están diseñados para que en Ciclo 2 se reemplace el mock data por llamadas a `fetch()` sin cambiar la API del hook (misma firma de funciones).

### 6.2 Datos de ejemplo realistas

**Decisión:** El mock data usa fechas reales (alrededor de la fecha del proyecto), nombres colombianos y tipos de documento del contexto colombiano.

**Razón:** Facilita la demo del proyecto ante el profesor. Datos realistas también revelan bugs de lógica que datos genéricos podrían ocultar (ej. validación de fechas de reserva que se solapan).

### 6.3 Precios en COP (pesos colombianos)

**Decisión:** Los precios de habitaciones se expresan en COP sin decimales.

**Razón:** El proyecto está orientado al mercado colombiano. COP no usa decimales en la práctica cotidiana.

---

## 7. Gestión de estado con hooks personalizados

### 7.1 Por qué hooks y no Context/Redux

**Decisión:** La lógica de estado de cada módulo vive en un hook personalizado —`useClientes`, `useReservas`, `useCheckin`, `usePagos`, `usePqrs`, `useSolicitudes`, `useInscripciones`, `usePaquetes`, `useTours`, `useHome`, `useReservar`, `useChat`—, no en un Context global ni en Redux.

**Razón:**
- La rúbrica exige explícitamente **hooks personalizados** para manejar navegación y estados complejos.
- Para Ciclo 1 (frontend sin backend), el estado local por módulo es suficiente — no hay necesidad de estado global compartido entre módulos.
- Los hooks son más fáciles de testear que un Context: se llama al hook con `renderHook()` y se verifican sus valores.
- Si en Ciclo 2 se necesita estado global (ej. sesión del usuario), se puede añadir un Context específico sin refactorizar los hooks de módulo.

### 7.2 Separación de responsabilidades hook/componente

**Regla:** Los componentes (`*.tsx`) **no tienen lógica de negocio**. Solo llaman funciones del hook y renderizan el resultado.

```tsx
// ✅ Correcto
function ClientesList() {
  const { clientes, eliminarCliente } = useClientes();
  return <ul>{clientes.map(c => <ClienteCard key={c.id} onDelete={eliminarCliente} />)}</ul>;
}

// ❌ Incorrecto — lógica mezclada con presentación
function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const handleDelete = (id) => { /* lógica */ setClientes(...) };
  return ...;
}
```

**Razón:** Cumple el criterio de calificación de "Lógica y Hooks" (20 pts). También facilita el testing: se puede testear el hook con `renderHook()` y los componentes con mocks simples del hook.

---

---

## 8. Sistema de diseño — Hotel Santa María

### 8.1 Paleta de colores

**Decisión:** Usar la paleta oficial del brief de diseño, definida con CSS variables de Tailwind v4 en `app/globals.css`.

| Token | Hex | Uso |
|---|---|---|
| `gold-500` | `#C6A75E` | Botones principales, highlights, nav activo |
| `gold-400` | `#E3C27A` | Hover state (Soft Gold) |
| `gold-600` | `#A8862E` | Hover en botones del panel admin |
| `brown-900` | `#2B1B18` | Header/footer (Dark Brown) |
| `cream` / fondo | `#F4EFEA` | Fondo de páginas (Warm Beige) |
| `foreground` | `#1E1E1E` | Texto principal (Dark Text) |

**Razón:** En Tailwind v4 las variables en `@theme` generan clases de utilidad automáticamente (`bg-gold-500`, `text-brown-900`, etc.) sin `tailwind.config.js`. Cuando se necesita el hex exacto en `style={}`, siempre se usa el valor del token (ej. `'#C6A75E'`, nunca la variante antigua `'#c6a65d'`).

### 8.2 Tipografía

**Decisión:** Playfair Display (serif) para títulos, Inter (sans-serif) para cuerpo de texto.

**Razón:** El brief especifica explícitamente estas fuentes. Se cargan con `next/font/google` que optimiza automáticamente: preload, subset, `display: swap` (evita FOIT). Las fuentes se inyectan como variables CSS (`--font-playfair`, `--font-inter`) y se referencizan en el `@theme` de globals.css.

### 8.3 Componentes UI compartidos

**Decisión:** Crear `components/ui/` con componentes reutilizables antes de implementar los módulos.

| Componente | Propósito |
|---|---|
| `Badge` | Mapa variante → clase CSS. Un solo lugar para actualizar si cambia la paleta. |
| `Modal` | Accesibilidad completa (`role="dialog"`, `aria-modal`, Escape, foco). Implementada una vez. |
| `EmptyState` | Placeholder uniforme para listas vacías. |
| `FormField` | IDs únicos con `useId()` de React para asociar labels con inputs. |
| `DropdownMenu` | Menú de acciones por fila de tabla, accesible con teclado. |
| `NavAdmin` | Barra fija del panel de administración (`bg: #2B1B18`, 56px). |
| `NavPublic` | Barra pública con blur (`rgba(255,255,255,0.9)`, 80px), links con routing mixto (anchor/Link). |
| `AdminShell` | Wrapper de layout: `NavAdmin` + `<main className="pt-14">`. |
| `buttonClasses.ts` | Strings de Tailwind para variantes de botón (`btnHeaderPrimary`, `btnFormPrimary`, `btnSecondary`, `btnDanger`, `btnPagination`). |

**Razón:** La rúbrica penaliza código duplicado explícitamente. Los 9 módulos admin comparten estos patrones. Centralizar garantiza consistencia visual y reduce el esfuerzo de mantenimiento.

---

## 9. Arquitectura del módulo Gestión de Clientes

### 9.1 Separación Server / Client Component

**Decisión:** `page.tsx` es Server Component; `ClientesClient.tsx` es el único Client Component del módulo.

```
clientes/
  page.tsx            ← Server Component (metadata estática)
  components/
    ClientesClient.tsx  ← 'use client' (usa el hook)
    ClientesList.tsx    ← recibe props, no necesita 'use client'
    ClienteRow.tsx      ← recibe props, sí usa useTranslations ('use client')
    ClienteForm.tsx     ← 'use client' (useState para formulario)
    DeleteClienteModal  ← 'use client' implícito (usa Modal)
```

**Razón:** `page.tsx` como Server Component permite que Next.js genere el `<head>` con metadata en el servidor. `ClientesClient.tsx` es el "boundary" de interactividad — centraliza el hook y distribuye datos hacia abajo. Los componentes hijos reciben props y solo tienen `'use client'` si usan hooks de React propios.

### 9.2 Hook con parámetros inyectables para testing

**Decisión:** `useClientes(initialClientes?, reservas?)` acepta datos de entrada opcionales.

```ts
export function useClientes(
  initialClientes: Cliente[] = MOCK_CLIENTES,
  reservas: Reserva[] = MOCK_RESERVAS,
)
```

**Razón:** En los tests unitarios del hook, necesitamos controlar qué datos hay sin usar `jest.mock()` sobre el módulo completo. Pasar los datos como parámetros hace el hook determinístico en tests (`renderHook(() => useClientes([], []))`) y mantiene los defaults del mock data para producción. Es el patrón de **inyección de dependencias** adaptado a hooks de React.

### 9.3 Estrategia de testing por capas

**Decisión:** Tests separados por responsabilidad:
- `useClientes.test.ts` — lógica pura del hook (12 tests, 3 por HU)
- `ClientesList.test.tsx` — renderizado y accesibilidad de la lista
- `ClienteForm.test.tsx` — comportamiento del formulario

**Razón:** Cada capa tiene preocupaciones distintas. El hook se testea con `renderHook` sin DOM. Los componentes se testean con `render` de RTL, mockeando el hook y next-intl para aislar la unidad. Esta separación facilita diagnosticar en qué capa está un bug.

### 9.4 Mock de next-intl en tests

**Decisión:** Cada test file mockea `next-intl` localmente con `jest.mock()`.

```ts
jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));
```

**Razón:** Los componentes usan `useTranslations` que requiere un `NextIntlClientProvider`. En lugar de envolver cada test con el provider (frágil y verbose), mockeamos el módulo. La función devuelve `namespace.key` en lugar del texto traducido, lo que permite hacer assertions como `screen.getByText('clientes.campos.nombre')` sin hardcodear strings en español.

### 9.5 Tests del módulo Clientes

| Suite | Tests | HUs cubiertas |
|---|---|---|
| useClientes.test.ts | 12 | HU-C1, HU-C2, HU-C3, HU-C4 |
| ClientesList.test.tsx | 3 | HU-C1 (renderizado) |
| ClienteForm.test.tsx | 4 | HU-C2, HU-C3 (formulario) |

---

---

## 10. Arquitectura del módulo Gestión de Reservas

### 10.1 Tipo derivado `ReservaConCliente`

**Decisión:** El hook retorna `ReservaConCliente[]` (reserva + cliente resuelto) en lugar de solo `Reserva[]`.

```ts
export interface ReservaConCliente {
  reserva: Reserva;
  cliente: Cliente | undefined;
}
```

**Razón:** La tabla de reservas necesita mostrar el nombre del cliente, pero `Reserva` solo almacena `clienteId`. Resolver la relación en el hook (con un `Map` para O(1) lookup) evita que cada componente hijo tenga que buscar el cliente por su cuenta, eliminando lógica duplicada y búsquedas ineficientes.

### 10.2 Algoritmo de disponibilidad de habitación

**Decisión:** Usar solapamiento de intervalos de fechas para validar disponibilidad.

```ts
// Dos reservas se solapan si: entrada1 < salida2 AND salida1 > entrada2
function fechasSeSolapan(e1, s1, e2, s2): boolean {
  return e1 < s2 && s1 > e2;
}
```

**Razón:** Este algoritmo cubre todos los casos de solapamiento (parcial, total, contenido) con una sola comparación de strings ISO. Funciona porque las fechas ISO ('YYYY-MM-DD') se ordenan lexicográficamente igual que cronológicamente. Las reservas canceladas y completadas se excluyen del check porque liberan la habitación.

### 10.3 `excludeId` en `habitacionDisponible`

**Decisión:** La función de disponibilidad acepta un `excludeId` opcional.

**Razón:** Al **editar** una reserva existente, la reserva actual no debe bloquearse a sí misma. Sin `excludeId`, el sistema reportaría "habitación no disponible" para la misma reserva que se está editando, haciendo imposible cambiar solo las fechas.

### 10.4 `calcularTotal` exportada como función pura

**Decisión:** `calcularTotal` se exporta como función independiente del hook.

**Razón:** `ReservaForm` necesita calcular el total en tiempo real (mientras el usuario selecciona fechas/tipo), sin llamar al hook completo. Al ser una función pura, también es trivial de testear directamente (`calcularTotal('DOBLE', '2026-04-10', '2026-04-13') === 450000`).

### 10.5 Consistencia de UI con módulo Clientes

Todos los patrones de diseño son idénticos al módulo Clientes:
- Mismo header (título serif + contador + botón `gold-500` `+ Nueva reserva`)
- Misma estructura de tabla con columnas semánticas
- Mismos componentes compartidos (`Badge`, `Modal`, `EmptyState`, `FormField`)
- Misma paleta (`gold-500` para CTAs, `brown-*` para estructura, fondo beige `#F4EFEA`)
- Mismo patrón Server Component → Client Component (`page.tsx` → `ReservasClient.tsx`)

### 10.6 Tests del módulo Reservas

| Suite | Tests | HUs cubiertas |
|---|---|---|
| useReservas.test.ts | 14 | HU-R1, HU-R2, HU-R3, HU-R4 + calcularTotal |
| ReservasList.test.tsx | 3 | HU-R1 (renderizado) |
| ReservaForm.test.tsx | 3 | HU-R2, HU-R3 (formulario) |

---

---

## 11. Arquitectura del módulo Check-in Digital

### 11.1 Tipo derivado `CheckinConDatos`

**Decisión:** El hook retorna `CheckinConDatos[]` (checkin + cliente + reserva resueltos) en lugar de solo `Checkin[]`.

```ts
export interface CheckinConDatos {
  checkin: Checkin;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
}
```

**Razón:** La tabla de check-ins necesita mostrar el nombre del cliente y el número de reserva, pero `Checkin` solo almacena IDs. Siguiendo el mismo patrón que `ReservaConCliente`, se precalculan dos Maps (`clienteMap`, `reservaMap`) en el hook con `useMemo` para resolución O(1). El `clienteMap` también se expone en el return del hook para que `CheckinClient` lo pase a `AnularCheckinModal` sin hacer búsquedas adicionales.

### 11.2 Parámetro inyectable `hoy` en `registrarCheckin`

**Decisión:** La función acepta `hoy: string` como segundo parámetro con default `new Date().toISOString().split('T')[0]`.

```ts
function registrarCheckin(
  reservaId: string,
  hoy: string = new Date().toISOString().split('T')[0],
): { ok: boolean; error?: string; hora?: string }
```

**Razón:** La validación de elegibilidad compara `fechaEntrada` de la reserva con la fecha actual (±1 día). Sin el parámetro inyectable, el test tendría que manipular `Date` globalmente (con `jest.useFakeTimers`), lo que es frágil y puede afectar otros tests. Al pasar `hoy` directamente, el test es determinístico y legible.

### 11.3 `reservasElegibles` como memo derivado

**Decisión:** Las reservas disponibles para un nuevo check-in se calculan con `useMemo` a partir del estado actual.

```ts
const reservasElegibles = useMemo(() => {
  const hoy = new Date().toISOString().split('T')[0];
  const reservaIdsCompletadas = new Set(...);
  return reservas.filter(
    r => r.estado === 'confirmada' && !reservaIdsCompletadas.has(r.id) && diffDias(r.fechaEntrada, hoy) <= 1
  );
}, [checkins, reservas]);
```

**Razón:** Después de registrar un check-in, la lista de elegibles debe excluir automáticamente la reserva recién procesada. Al derivarla del estado reactivo, se actualiza sin necesidad de ninguna llamada adicional.

### 11.4 `fechaHoraCheckin` como campo inmutable

**Decisión:** `CheckinUpdateData` excluye `fechaHoraCheckin` por diseño del tipo.

```ts
// types/checkin.ts
export type CheckinUpdateData = Omit<Checkin, 'id' | 'reservaId' | 'clienteId' | 'fechaHoraCheckin' | 'estado' | 'motivoAnulacion' | 'fechaAnulacion'>;
```

**Razón:** El timestamp de ingreso es un registro histórico legal — no puede modificarse después del registro. Al excluirlo del tipo de actualización, el compilador impide que se pase accidentalmente. `ActualizarCheckinForm` lo muestra en un bloque de solo lectura con una nota explicativa para que el recepcionista lo entienda.

### 11.5 Anulación con historial de motivo

**Decisión:** `anularCheckin(id, motivo)` requiere un motivo no vacío y registra `fechaAnulacion`.

```ts
setCheckins(prev =>
  prev.map(c => c.id === id
    ? { ...c, estado: 'anulado', motivoAnulacion: motivo.trim(), fechaAnulacion: new Date().toISOString() }
    : c
  )
);
```

**Razón:** La rúbrica especifica que el check-in anulado debe tener historial de motivo y timestamp. El motivo obligatorio previene anulaciones accidentales y da contexto para auditorías. En Ciclo 2, `fechaAnulacion` permitirá que el backend revierta la reserva asociada al estado 'confirmada'.

### 11.6 Consistencia de UI con módulos anteriores

Todos los patrones son idénticos a Clientes y Reservas:
- Header con contador de registros + badge de pendientes destacado en dorado
- Filas en estado 'pendiente' con fondo `gold-50` para visibilidad inmediata
- Mismo patrón Server Component → Client Component (`page.tsx` → `CheckinClient.tsx`)
- Mismos componentes compartidos (`Badge`, `Modal`, `EmptyState`, `FormField`)

### 11.7 Tests del módulo Check-in

| Suite | Tests | HUs cubiertas |
|---|---|---|
| useCheckin.test.ts | 12 | HU-K1, HU-K2, HU-K3, HU-K4 |
| CheckinList.test.tsx | 3 | HU-K1 (renderizado y filtros) |
| AnularCheckinModal.test.tsx | 3 | HU-K4 (validación de motivo) |

---

## 12. Módulos adicionales (Pagos, PQRS, Solicitudes, Inscripciones, Paquetes, Tours)

Los seis módulos restantes siguen exactamente el mismo patrón arquitectónico descrito en las secciones 9–11:

- Server Component `page.tsx` → Client Component `*Client.tsx` → hook `use*.ts`
- Componentes compartidos de `components/ui/` (sin duplicación)
- Tests colocados en `__tests__/` junto al módulo

### 12.1 Decisiones específicas

**Pagos — `calcularTotal` como función externa:** Al igual que en Reservas, el cálculo del total se exporta como función pura para usarla en el formulario en tiempo real y en tests directos.

**PQRS — estados con flujo unidireccional:** `abierta → en_proceso → resuelta/cerrada`. El hook impide transiciones inválidas (no se puede reabrir un PQRS cerrado), igual que el patrón de `EstadoReserva`.

**Solicitudes — prioridad inyectable:** La ordenación por prioridad (`urgente > alta > media > baja`) se calcula con `useMemo` derivado de los filtros activos, sin reordenar el array original.

**Inscripciones / Paquetes / Tours — validaciones de cupos y fechas:** Siguiendo el patrón de `habitacionDisponible` en Reservas, cada módulo valida su dominio en el hook antes de confirmar la operación.

### 12.2 Tests total del proyecto

**Total actual: 113 tests en 22 suites — todos pasando.**

---

## 13. Páginas públicas y bono IA

### 13.1 Landing page (`home/`)

**Decisión:** `HomeClient.tsx` es un único Client Component que integra todos los bloques de la página (hero, explorar, legado, footer, chat flotante).

**Razón:** La landing page es altamente visual y todos sus bloques comparten estado del formulario de búsqueda. Dividirla en Server Components no aportaría beneficio de rendimiento significativo dado el tamaño del proyecto. El hook `useHome` separa el estado del formulario de búsqueda de la presentación.

**Tipografía del hero:** `font-weight: 400` (Playfair Display Regular), `font-size: clamp(2.25rem, 8vw, 72px)`, `line-height: 72px`. Se aplica con `style={}` explícito porque `.hotel-title` define `font-weight: 700` y debe ser sobreescrito.

**Elementos fijos y padding:** La navbar pública es `fixed` de 80px. La sección hero tiene `paddingTop: 80px` para no quedar oculta. Todo elemento `fixed` en el proyecto requiere `padding-top` equivalente en su contenido.

### 13.2 Flujo de reserva (`reservar/`)

**Decisión:** `NavReservar` reemplaza a `NavPublic` en el flujo de reserva. `<main>` tiene `pt-[80px]`. El resumen lateral usa `sticky top-[96px]` (80px navbar + 16px margen).

**Razón:** El flujo de reserva tiene su propia navegación simplificada (INICIO | RESERVA activa | AYUDA) que comunica el contexto al usuario. La posición `sticky top-[96px]` evita que el resumen quede oculto bajo la navbar fija.

### 13.3 Asistente virtual IA (bono +0.3 pts)

**Decisión:** Implementación mock sin API externa. `useChat` gestiona mensajes, delay simulado de 1.2s y selección de respuesta por palabras clave.

**Razón:**
- No requiere API key ni configuración de entorno en el servidor de evaluación.
- El skeleton animado (`animate-pulse`) durante el delay satisface el "spinner/skeleton".
- El `timer` es inyectable en el hook, lo que permite tests determinísticos sin `jest.useFakeTimers`.
- 16 grupos de palabras clave cubren los temas principales: precios, habitaciones, check-in/out, spa, restaurante, tours, cancelaciones, Wi-Fi, contacto.

---


*Curso: ISIS 3710 — Universidad de los Andes*
