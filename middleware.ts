import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Middleware de internacionalización.
 *
 * Responsabilidades:
 * 1. Detectar el locale preferido del usuario (Accept-Language header o cookie).
 * 2. Redirigir a la URL con el prefijo de locale correcto (ej. /es/clientes).
 * 3. Servir el locale por defecto ('es') si no hay preferencia detectada.
 *
 * El matcher excluye rutas de Next.js internos (_next), archivos estáticos
 * (imágenes, fuentes, etc.) y la ruta de API para no interceptarlas.
 */
export default createMiddleware(routing);

export const config = {
  matcher: [
    // Aplica el middleware a todas las rutas excepto:
    // - _next (internos de Next.js)
    // - archivos con extensión (ej. .png, .svg, .ico)
    '/((?!_next|_vercel|api|.*\\..*).*)',
  ],
};
