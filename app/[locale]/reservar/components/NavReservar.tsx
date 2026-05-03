'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const GOLD       = '#C6A75E';
const DEEP_BROWN = '#4A2E2A';

/**
 * NavReservar — barra de navegación del flujo de reserva.
 * Mismo estilo visual que NavPublic (fondo blanco + blur)
 * pero con links: INICIO | RESERVA (activo) | AYUDA
 */
export default function NavReservar() {
  const t = useTranslations('reservar.nav');

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(198, 167, 94, 0.1)',
        height: '80px',
      }}
    >
      <div
        className="max-w-[1280px] mx-auto w-full flex items-center justify-between px-6 lg:px-12"
        style={{ height: '80px' }}
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

        {/* Nav links */}
        <nav aria-label={t('ariaLabel')}>
          <ul className="flex items-center gap-8">
            <li>
              <Link
                href="/"
                className="text-[14px] font-medium tracking-[1.4px] uppercase transition-opacity hover:opacity-60"
                style={{ color: DEEP_BROWN, fontFamily: 'var(--font-sans)' }}
              >
                {t('inicio')}
              </Link>
            </li>
            <li>
              <Link
                href="/reservar"
                className="text-[14px] font-medium tracking-[1.4px] uppercase"
                style={{
                  color: GOLD,
                  fontFamily: 'var(--font-sans)',
                  borderBottom: `2px solid ${GOLD}`,
                  paddingBottom: '2px',
                }}
                aria-current="page"
              >
                {t('reserva')}
              </Link>
            </li>
            <li>
              <a
                href="#ayuda"
                className="text-[14px] font-medium tracking-[1.4px] uppercase transition-opacity hover:opacity-60"
                style={{ color: DEEP_BROWN, fontFamily: 'var(--font-sans)' }}
              >
                {t('ayuda')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
