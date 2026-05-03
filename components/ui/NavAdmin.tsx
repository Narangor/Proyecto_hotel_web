"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";

const ADMIN_LINKS = [
  { href: "/clientes", key: "clientes" },
  { href: "/reservas", key: "reservas" },
  { href: "/checkin", key: "checkin" },
  { href: "/pagos", key: "pagos" },
  { href: "/pqrs", key: "pqrs" },
  { href: "/solicitudes", key: "solicitudes" },
  { href: "/inscripciones", key: "inscripciones" },
  { href: "/paquetes", key: "paquetes" },
  { href: "/tours", key: "tours" },
] as const;

/**
 * NavAdmin — barra de navegación para el personal del hotel.
 * Fija en la parte superior, incluye todos los módulos de gestión.
 */
export function NavAdmin() {
  const t = useTranslations("navAdmin");
  const pathname = usePathname();
  const router = useRouter();

  function cerrarSesion() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hotel_staff_auth");
    }
    router.push("/login");
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b shadow-lg"
      style={{
        backgroundColor: "#2B1B18",
        borderColor: "rgba(198,167,94,0.15)",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 hotel-title text-gold-400 text-base shrink-0 mr-2"
        >
          <span aria-hidden="true">★</span>
          <span className="hidden lg:inline">Hotel Santa María</span>
          <span className="lg:hidden">HSM</span>
        </Link>

        {/* Módulos */}
        <nav
          aria-label={t("ariaLabel")}
          className="flex-1 overflow-x-auto overflow-y-visible scrollbar-none"
        >
          <ul className="flex items-center gap-0.5 min-w-max h-16">
            {ADMIN_LINKS.map(({ href, key }) => {
              const isActive = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      px-3 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-colors
                      ${
                        isActive
                          ? "bg-gold-500/20 text-gold-400"
                          : "text-cream/60 hover:text-cream hover:bg-brown-800"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {t(key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuario + Cerrar sesión */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-cream/50 text-xs">
            {t("usuario")}
          </span>
          <button
            type="button"
            onClick={cerrarSesion}
            className="text-xs font-semibold tracking-wider uppercase border border-brown-600 text-cream/70 hover:text-cream hover:border-brown-400 px-3 py-2 rounded transition-colors"
          >
            {t("cerrarSesion")}
          </button>
        </div>
      </div>
    </header>
  );
}
