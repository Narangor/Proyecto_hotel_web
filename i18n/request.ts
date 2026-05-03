import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Carga los mensajes de traducción según el locale activo de la solicitud.
 * next-intl llama a esta función en cada Server Component que use traducciones.
 *
 * Si el locale solicitado no existe en la lista de locales válidos,
 * se hace fallback al defaultLocale ('es') en lugar de lanzar un error.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
