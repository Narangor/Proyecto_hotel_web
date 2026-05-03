/**
 * Root Layout — mínimo e independiente del locale.
 *
 * En la arquitectura next-intl con App Router, este layout es el "contenedor"
 * obligatorio de Next.js, pero todo lo visual (html lang, fuentes, metadata,
 * providers) se delega al layout de [locale].
 *
 * Esto permite que el atributo lang del <html> refleje el locale real
 * del usuario en lugar de un valor hardcodeado.
 */

import { HotelProvider } from "../lib/HotelContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
