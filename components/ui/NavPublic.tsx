"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

// Gold Accent exacto del design system
const GOLD = "#C6A75E";
const DEEP_BROWN = "#4A2E2A";

/**
 * Configuración de links del nav.
 * isPage: true  → usa <Link> (ruta Next.js, prefixado con locale)
 * isPage: false → usa <a href="#id"> (anchor en la misma página)
 */
const NAV_LINKS = [
  { key: "habitaciones", href: "/reservar", isPage: true },
  { key: "eventos", href: "#servicios", isPage: false },
  { key: "tours", href: "/tours", isPage: true },
  { key: "servicios", href: "#servicios", isPage: false },
  { key: "contacto", href: "#contacto", isPage: false },
] as const;

const LINK_STYLE = {
  color: DEEP_BROWN,
  fontFamily: "var(--font-sans)",
  fontSize: "14px",
  fontWeight: 500,
  letterSpacing: "1.4px",
  textTransform: "uppercase" as const,
};

/**
 * NavPublic — barra de navegación pública.
 * Fondo blanco/90 + blur, logo Playfair Display, links Inter.
 * Ref. Figma: node 42:172 – "Header - Top Navigation Bar"
 */
export function NavPublic() {
  const t = useTranslations("home.nav");
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        borderBottom: "1px solid rgba(198, 167, 94, 0.1)",
        height: "80px",
      }}
    >
      {/* ── Desktop row ── */}
      <div
        className="max-w-[1280px] mx-auto w-full flex items-center justify-between px-6 lg:px-12"
        style={{ height: "80px" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/images/icons/star-logo.svg"
            alt=""
            width={29}
            height={24}
            aria-hidden="true"
          />
          <span
            className="hotel-title text-2xl tracking-[-0.6px] whitespace-nowrap leading-8"
            style={{ color: DEEP_BROWN }}
          >
            Hotel Santa María
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav
          aria-label={t("ariaLabel")}
          className="hidden lg:flex items-center gap-8"
        >
          {NAV_LINKS.map(({ key, href, isPage }) =>
            isPage ? (
              <Link
                key={key}
                href={href as "/reservar" | "/tours"}
                className="transition-opacity hover:opacity-60"
                style={LINK_STYLE}
              >
                {t(key)}
              </Link>
            ) : (
              <a
                key={key}
                href={href}
                className="transition-opacity hover:opacity-60"
                style={LINK_STYLE}
              >
                {t(key)}
              </a>
            ),
          )}
        </nav>

        {/* Desktop CTA + mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/reservar"
            className="hidden lg:flex items-center justify-center rounded-[8px] text-[14px] font-bold tracking-[0.7px] uppercase text-white transition-opacity hover:opacity-90 shrink-0"
            style={{
              backgroundColor: GOLD,
              padding: "10px 24px",
              fontFamily: "var(--font-sans)",
              boxShadow: `0px 10px 15px -3px rgba(198,167,94,0.2), 0px 4px 6px -4px rgba(198,167,94,0.2)`,
            }}
          >
            {t("reservar")}
          </Link>

          <Link
            href="/login"
            className="hidden lg:flex items-center justify-center rounded-[8px] text-[14px] font-bold tracking-[0.7px] uppercase transition-opacity hover:opacity-90 shrink-0"
            style={{
              backgroundColor: "transparent",
              border: `2px solid ${GOLD}`,
              color: GOLD,
              padding: "8px 24px",
              fontFamily: "var(--font-sans)",
            }}
          >
            {t("adminLogin")}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="lg:hidden p-2 rounded transition-opacity hover:opacity-60"
            style={{ color: DEEP_BROWN }}
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-expanded={menuAbierto}
            aria-controls="mobile-menu"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          >
            {menuAbierto ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuAbierto && (
        <div
          id="mobile-menu"
          style={{
            backgroundColor: "rgba(255,255,255,0.97)",
            borderTop: "1px solid rgba(198,167,94,0.15)",
          }}
        >
          <nav aria-label={t("ariaLabel")}>
            <ul className="list-none px-6 pb-5 flex flex-col">
              {NAV_LINKS.map(({ key, href, isPage }) => (
                <li key={key}>
                  {isPage ? (
                    <Link
                      href={href as "/reservar" | "/tours"}
                      className="block py-3.5 text-[13px] font-medium tracking-[1.4px] uppercase transition-opacity hover:opacity-60"
                      style={{
                        color: DEEP_BROWN,
                        fontFamily: "var(--font-sans)",
                        borderBottom: "1px solid rgba(198,167,94,0.15)",
                      }}
                      onClick={() => setMenuAbierto(false)}
                    >
                      {t(key)}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="block py-3.5 text-[13px] font-medium tracking-[1.4px] uppercase transition-opacity hover:opacity-60"
                      style={{
                        color: DEEP_BROWN,
                        fontFamily: "var(--font-sans)",
                        borderBottom: "1px solid rgba(198,167,94,0.15)",
                      }}
                      onClick={() => setMenuAbierto(false)}
                    >
                      {t(key)}
                    </a>
                  )}
                </li>
              ))}
              <li className="pt-4">
                <Link
                  href="/reservar"
                  className="block w-full text-center rounded-[8px] text-[14px] font-bold tracking-[0.7px] uppercase text-white py-3 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: GOLD,
                    fontFamily: "var(--font-sans)",
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  {t("reservar")}
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/login"
                  className="block w-full text-center rounded-[8px] text-[14px] font-bold tracking-[0.7px] uppercase py-3 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "transparent",
                    border: `2px solid ${GOLD}`,
                    color: GOLD,
                    fontFamily: "var(--font-sans)",
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  {t("adminLogin")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
