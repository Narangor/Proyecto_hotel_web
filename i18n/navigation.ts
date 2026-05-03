import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Helpers de navegación tipados para next-intl.
 *
 * Exporta versiones de Link, redirect, useRouter y usePathname
 * que conocen los locales del proyecto. Al usar estos en lugar de
 * los de 'next/navigation', los paths generados incluyen el prefijo
 * de locale automáticamente (/es/clientes, /en/clientes).
 *
 * Importar desde '@/i18n/navigation' en toda la aplicación.
 */
export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing);
