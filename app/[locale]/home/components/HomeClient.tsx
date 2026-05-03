'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { NavPublic } from '@/components/ui/NavPublic';
import { useHome } from '../hooks/useHome';
import { useChat } from '../hooks/useChat';
import ChatModal from './ChatModal';

// ── Assets (descargados de Figma) ────────────────────────────────────────────
const HERO_IMG    = '/images/hero/lobby.jpg';
const POOL_IMG    = '/images/legacy/pool.jpg';
const FACE_AGENT  = '/images/chat/face-agent.png';
const STAR_LOGO   = '/images/icons/star-logo.svg';
const SEND_ICON   = '/images/icons/send.svg';

const CARD_ICONS = {
  habitaciones: '/images/icons/bed.svg',
  eventos:      '/images/icons/fork.svg',
  tours:        '/images/icons/compass.svg',
  paquetes:     '/images/icons/gift.svg',
} as const;

const FOOTER_ICONS = {
  social1: '/images/footer/social1.svg',
  social2: '/images/footer/social2.svg',
  social3: '/images/footer/social3.svg',
  pin:     '/images/footer/pin.svg',
  phone:   '/images/footer/phone.svg',
  email:   '/images/footer/email.svg',
} as const;

// ── Datos estáticos ───────────────────────────────────────────────────────────
const EXPLORAR_CARDS = [
  { id: 'habitaciones' as const, href: '/reservar' },
  { id: 'eventos'      as const, href: '/inscripciones' },
  { id: 'tours'        as const, href: '/tours' },
  { id: 'paquetes'     as const, href: '/paquetes' },
];

const FOOTER_INFO_LINKS = ['faq', 'politicas', 'privacidad', 'terminos'] as const;

// ── Componente ────────────────────────────────────────────────────────────────

export default function HomeClient() {
  const t = useTranslations('home');
  const {
    entrada, setEntrada,
    salida,  setSalida,
    adultos, setAdultos,
    ninos,   setNinos,
    huespedAbierto, setHuespedAbierto,
    resumenHuespedes,
    buscarDisponibilidad,
  } = useHome();

  const {
    abierto: chatAbierto,
    abrirChat,
    cerrarChat,
    messages,
    isLoading,
    inputValue,
    setInputValue,
    enviarMensaje,
  } = useChat();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F4EFEA' }}>

      {/* Navbar */}
      <NavPublic />

      {/* ── Chat flotante ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-0">
        {/* Burbuja de texto */}
        <div
          className="flex items-center justify-center px-4 h-[49px] rounded-[12px] mr-[-4px]"
          style={{
            backgroundColor: 'rgba(244,239,234,0.73)',
            backdropFilter: 'blur(3.85px)',
            WebkitBackdropFilter: 'blur(3.85px)',
          }}
        >
          <span
            className="text-[16px] font-semibold whitespace-nowrap"
            style={{ color: 'rgba(74,46,42,0.7)', fontFamily: 'var(--font-sans)' }}
          >
            {t('hero.chat.label')}
          </span>
        </div>
        {/* Botón dorado con cara IA */}
        <button
          type="button"
          onClick={abrirChat}
          className="relative flex items-center justify-center rounded-[12px] shrink-0"
          style={{
            backgroundColor: '#C6A75E',
            width: 64, height: 64,
            boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
          }}
          aria-label={t('hero.chat.ariaLabel')}
          aria-expanded={chatAbierto}
          aria-haspopup="dialog"
        >
          <Image src={FACE_AGENT} alt="" width={44} height={44} />
        </button>
      </div>

      {/* Modal del chat */}
      <ChatModal
        abierto={chatAbierto}
        onCerrar={cerrarChat}
        messages={messages}
        isLoading={isLoading}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onEnviar={enviarMensaje}
      />

      <main id="main-content">

        {/* ════════════════════════════════════════════════════════════════
            HERO  — Figma node 42:61
        ════════════════════════════════════════════════════════════════ */}
        <section
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{ minHeight: '100svh', paddingTop: '80px' }}
          aria-labelledby="hero-titulo"
        >
          {/* Imagen de fondo */}
          <div className="absolute inset-0">
            <Image
              src={HERO_IMG}
              alt="Lobby del Hotel Santa María"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay gradiente — Figma: from-[rgba(43,27,24,0.4)] to-[rgba(43,27,24,0.6)] */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(43,27,24,0.4) 0%, rgba(43,27,24,0.6) 100%)',
              }}
              aria-hidden="true"
            />
          </div>

          {/* Contenido */}
          <div className="relative z-10 flex flex-col items-center text-center gap-8 px-4 w-full max-w-[1060px] mx-auto py-16">

            {/* Título — Playfair Display Regular 72px (font-weight: 400) */}
            <h1
              id="hero-titulo"
              style={{
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '0px 3px 6.8px rgba(0,0,0,0.80)',
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(2.25rem, 8vw, 72px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'clamp(2.5rem, 8vw, 72px)',
              }}
            >
              {t('hero.titulo')}
            </h1>

            {/* Subtítulo — Inter Medium 20px */}
            <p
              className="text-[20px] font-medium tracking-[0.5px] leading-7 max-w-[672px]"
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'var(--font-sans)',
                textShadow: '0px 3px 6.8px rgba(0,0,0,0.8)',
              }}
            >
              {t('hero.subtitulo')}
            </p>

            {/* ── Barra de búsqueda ─────────────────────────────────── */}
            <div
              className="flex flex-col sm:flex-row items-stretch gap-2 w-full max-w-[896px] rounded-[12px] p-2"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
              }}
              role="search"
              aria-label={t('hero.form.ariaLabel')}
            >
              {/* Llegada - Salida */}
              <div
                className="flex flex-1 items-center gap-3 px-4 py-3 sm:border-r sm:border-[#f3f4f6]"
              >
                <Image src="/images/icons/calendar.svg" alt="" width={18} height={20} aria-hidden="true" />
                <div className="flex flex-col items-start min-w-0">
                  <span
                    className="text-[10px] font-bold tracking-[-0.5px] uppercase text-[#9ca3af] leading-[10px] whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {t('hero.form.llegada')} – {t('hero.form.salida')}
                  </span>
                  <div className="flex gap-2 mt-1">
                    <label htmlFor="fecha-entrada" className="sr-only">{t('hero.form.llegada')}</label>
                    <input
                      id="fecha-entrada"
                      type="date"
                      value={entrada}
                      onChange={(e) => setEntrada(e.target.value)}
                      className="bg-transparent border-0 p-0 text-[14px] font-medium text-[#bdc1c8] focus:outline-none focus:text-[#4a2e2a] w-[110px]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    />
                    <span className="text-[#bdc1c8] text-[14px]">–</span>
                    <label htmlFor="fecha-salida" className="sr-only">{t('hero.form.salida')}</label>
                    <input
                      id="fecha-salida"
                      type="date"
                      value={salida}
                      onChange={(e) => setSalida(e.target.value)}
                      className="bg-transparent border-0 p-0 text-[14px] font-medium text-[#bdc1c8] focus:outline-none focus:text-[#4a2e2a] w-[110px]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Huéspedes */}
              <div className="relative flex flex-1 items-center gap-3 px-4 py-3">
                <Image src="/images/icons/guests.svg" alt="" width={22} height={16} aria-hidden="true" />
                <div className="flex flex-col items-start min-w-0">
                  <span
                    className="text-[10px] font-bold tracking-[-0.5px] uppercase text-[#9ca3af] leading-[10px]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {t('hero.form.huespedes')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHuespedAbierto(!huespedAbierto)}
                    className="mt-1 text-[14px] font-medium text-[#bdc1c8] hover:text-[#4a2e2a] transition-colors text-left focus:outline-none"
                    style={{ fontFamily: 'var(--font-sans)' }}
                    aria-expanded={huespedAbierto}
                    aria-haspopup="true"
                  >
                    {resumenHuespedes}
                  </button>
                </div>

                {/* Popover huéspedes */}
                {huespedAbierto && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-30 flex flex-col gap-3 min-w-[200px] border border-[#f3f4f6]"
                  >
                    {[
                      { label: t('hero.form.adultos'), val: adultos, min: 1, set: setAdultos, labelMenos: t('hero.form.menosAdultos'), labelMas: t('hero.form.masAdultos') },
                      { label: t('hero.form.ninos'),   val: ninos,   min: 0, set: setNinos,   labelMenos: t('hero.form.menosNinos'),  labelMas: t('hero.form.masNinos') },
                    ].map(({ label, val, min, set, labelMenos, labelMas }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-[#4a2e2a]" style={{ fontFamily: 'var(--font-sans)' }}>{label}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => set(Math.max(min, val - 1))} className="w-7 h-7 rounded-full border border-[#d4b49a] text-sm text-[#4a2e2a] flex items-center justify-center hover:bg-[#f4efea]" aria-label={labelMenos}>−</button>
                          <span className="text-sm font-medium w-4 text-center text-[#4a2e2a]">{val}</span>
                          <button type="button" onClick={() => set(val + 1)} className="w-7 h-7 rounded-full border border-[#d4b49a] text-sm text-[#4a2e2a] flex items-center justify-center hover:bg-[#f4efea]" aria-label={labelMas}>+</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setHuespedAbierto(false)} className="text-xs text-[#C6A75E] underline text-right">
                      {t('hero.form.aplicar')}
                    </button>
                  </div>
                )}
              </div>

              {/* Botón buscar */}
              <button
                type="button"
                onClick={buscarDisponibilidad}
                className="flex items-center justify-center rounded-[8px] text-[14px] font-bold uppercase text-white transition-opacity hover:opacity-90 shrink-0"
                style={{
                  backgroundColor: '#C6A75E',
                  padding: '16px 40px',
                  letterSpacing: '1.4px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {t('hero.form.buscar')}
              </button>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SERVICIOS DE CLASE MUNDIAL  — Figma node 42:3
        ════════════════════════════════════════════════════════════════ */}
        <section
          id="servicios"
          className="flex flex-col gap-16 items-start w-full px-6 lg:px-12 py-24"
          style={{ maxWidth: '1280px', margin: '0 auto' }}
          aria-labelledby="explorar-titulo"
        >
          {/* Anchors para navegación — habitaciones, eventos, tours apuntan a esta sección */}
          <span id="habitaciones" className="sr-only" aria-hidden="true" />
          <span id="eventos" className="sr-only" aria-hidden="true" />
          <span id="tours" className="sr-only" aria-hidden="true" />
          {/* Cabecera */}
          <div className="flex flex-col gap-2 items-center w-full">
            <p
              className="text-[14px] font-bold text-center uppercase tracking-[4.2px] text-[#C6A75E] leading-5"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {t('servicios.titulo')}
            </p>
            <h2
              id="explorar-titulo"
              className="hotel-title text-[36px] text-[#4a2e2a] text-center leading-10"
            >
              {t('explorar.titulo')}
            </h2>
          </div>

          {/* Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {EXPLORAR_CARDS.map(({ id, href }) => (
              <article
                key={id}
                className="flex flex-col items-center p-8 rounded-[12px]"
                style={{
                  backgroundColor: '#f4efea',
                  boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                }}
              >
                {/* Ícono en círculo blanco */}
                <div
                  className="flex items-center justify-center rounded-full mb-6 shrink-0"
                  style={{
                    backgroundColor: '#ffffff',
                    width: 64, height: 64,
                    boxShadow: 'inset 0px 2px 4px 0px rgba(0,0,0,0.05)',
                  }}
                >
                  <Image
                    src={CARD_ICONS[id]}
                    alt=""
                    width={25}
                    height={25}
                    aria-hidden="true"
                  />
                </div>

                {/* Título — Playfair Display Bold 20px */}
                <h3
                  className="hotel-title text-[20px] text-[#4a2e2a] text-center leading-7 mb-3"
                >
                  {t(`explorar.cards.${id}.titulo`)}
                </h3>

                {/* Descripción — Inter Regular 14px */}
                <p
                  className="text-[14px] text-center leading-[22.75px] flex-1 mb-4"
                  style={{
                    color: 'rgba(74,46,42,0.7)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {t(`explorar.cards.${id}.descripcion`)}
                </p>

                {/* CTA link — Inter Bold 12px uppercase */}
                <Link
                  href={href}
                  className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#C6A75E] leading-4 pb-1 transition-opacity hover:opacity-70"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    borderBottom: '1px solid rgba(198,166,93,0.2)',
                  }}
                >
                  {t(`explorar.cards.${id}.cta`)}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            NUESTRO LEGADO  — Figma node 42:92
        ════════════════════════════════════════════════════════════════ */}
        <section
          className="flex w-full"
          style={{ backgroundColor: '#2b1b18', minHeight: '645px' }}
          aria-labelledby="legado-titulo"
        >
          {/* Texto izquierda */}
          <div className="flex flex-1 flex-col justify-center items-start p-16 lg:p-24">
            <p
              className="text-[14px] font-bold uppercase tracking-[4.2px] text-[#C6A75E] leading-5 mb-6"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {t('legado.eyebrow')}
            </p>
            <h2
              id="legado-titulo"
              className="hotel-title text-[48px] text-white leading-[48px] mb-8"
            >
              {t('legado.titulo')}
            </h2>
            <p
              className="text-[18px] leading-[29.25px] mb-10"
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {t('legado.descripcion')}
            </p>
            <Link
              href="/reservar"
              className="flex items-center justify-center rounded-[8px] text-[14px] font-bold uppercase tracking-[1.4px] text-[#C6A75E] transition-opacity hover:opacity-80"
              style={{
                border: '1px solid #C6A75E',
                padding: '13px 33px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {t('legado.cta')}
            </Link>
          </div>

          {/* Imagen derecha */}
          <div className="hidden lg:block flex-1 relative">
            <Image
              src={POOL_IMG}
              alt="Piscina exterior al atardecer en Hotel Santa María"
              fill
              className="object-cover"
            />
          </div>
        </section>
      </main>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER  — Figma node 42:107
      ════════════════════════════════════════════════════════════════ */}
      <footer
        id="contacto"
        className="flex flex-col gap-20 items-start pt-20 pb-10 px-6 lg:px-12 w-full"
        style={{
          backgroundColor: '#2b1b18',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
        aria-label={t('footer.ariaLabel')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-[1280px]">

          {/* Brand */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Image src={STAR_LOGO} alt="" width={29} height={24} aria-hidden="true" />
              <span
                className="hotel-title text-[24px] text-white tracking-[-0.6px] leading-8"
              >
                Hotel Santa María
              </span>
            </div>
            <p
              className="text-[14px] leading-[22.75px]"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)' }}
            >
              {t('footer.tagline')}
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              {(['social1', 'social2', 'social3'] as const).map((key) => (
                <a
                  key={key}
                  href="#"
                  className="flex items-center justify-center rounded-full transition-opacity hover:opacity-70 shrink-0"
                  style={{
                    width: 40, height: 40,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  aria-label="Red social"
                >
                  <Image src={FOOTER_ICONS[key]} alt="" width={12} height={12} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-6">
            <h3 className="hotel-title text-[18px] text-[#C6A75E] leading-7">
              {t('footer.contacto')}
            </h3>
            <ul className="list-none flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Image src={FOOTER_ICONS.pin} alt="" width={10} height={14} className="mt-1 shrink-0" aria-hidden="true" />
                <span className="text-[14px] leading-5" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-sans)' }}>{t('footer.direccion')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Image src={FOOTER_ICONS.phone} alt="" width={9} height={13} className="shrink-0" aria-hidden="true" />
                <a href="tel:+525512345678" className="text-[14px] leading-5 transition-opacity hover:opacity-70" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-sans)' }}>{t('footer.telefono')}</a>
              </li>
              <li className="flex items-center gap-3">
                <Image src={FOOTER_ICONS.email} alt="" width={12} height={10} className="shrink-0" aria-hidden="true" />
                <a href="mailto:reservas@santamariahotel.com" className="text-[14px] leading-5 transition-opacity hover:opacity-70" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-sans)' }}>{t('footer.email')}</a>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div className="flex flex-col gap-6">
            <h3 className="hotel-title text-[18px] text-[#C6A75E] leading-7">
              {t('footer.informacion')}
            </h3>
            <ul className="list-none flex flex-col gap-4">
              {FOOTER_INFO_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[14px] leading-5 transition-opacity hover:opacity-70" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-sans)' }}>
                    {t(`footer.links.${link}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-6">
            <h3 className="hotel-title text-[18px] text-[#C6A75E] leading-7">
              {t('footer.newsletter')}
            </h3>
            <p className="text-[14px] leading-5" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-sans)' }}>
              {t('footer.newsletterTexto')}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex" aria-label={t('footer.newsletterAriaLabel')}>
              <label htmlFor="newsletter-email" className="sr-only">{t('footer.emailLabel')}</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 text-[14px] px-3 py-2.5 rounded-l-[8px] focus:outline-none min-w-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-r-[8px] shrink-0 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C6A75E', padding: '7px 16px' }}
                aria-label={t('footer.suscribirse')}
              >
                <Image src={SEND_ICON} alt="" width={19} height={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="w-full max-w-[1280px] pt-10 text-center text-[12px] tracking-[1.2px] uppercase"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {t('footer.copyright')}
        </div>
      </footer>
    </div>
  );
}
