import { defineRouting } from 'next-intl/routing';

/**
 * Configuración central de locales.
 * - 'es' es el idioma principal (español Colombia).
 * - 'en' es el idioma secundario (inglés).
 * - defaultLocale: si el navegador no indica preferencia, se usa 'es'.
 *
 * Esta configuración es importada por el middleware y por el layout
 * para garantizar consistencia entre routing y renderizado.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
});

export type Locale = (typeof routing.locales)[number];
