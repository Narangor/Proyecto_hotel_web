import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * El plugin de next-intl envuelve la configuración de Next.js para:
 * 1. Registrar i18n/request.ts como el handler de configuración de solicitudes.
 * 2. Habilitar el modo de compilación para Server Components con traducciones.
 *
 * El argumento './i18n/request.ts' indica dónde está el getRequestConfig.
 */
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * output: 'standalone' genera un directorio .next/standalone que incluye
 * solo las dependencias de producción necesarias. Esto reduce drásticamente
 * el tamaño de la imagen Docker: en lugar de copiar node_modules completo
 * (~400MB+), el standalone bundle (~50MB) solo incluye lo necesario para
 * ejecutar el servidor Next.js en producción.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
};

export default withNextIntl(nextConfig);
