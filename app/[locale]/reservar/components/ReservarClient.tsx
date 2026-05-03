'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import NavReservar from './NavReservar';
import HabitacionCard from './HabitacionCard';
import ResumenEstancia from './ResumenEstancia';
import PasoHuesped from './PasoHuesped';
import { useReservar, formatPrecio, formatFechaCorta } from '../hooks/useReservar';

const PASOS = ['habitacion', 'servicios', 'pago'] as const;

interface ReservarClientProps {
  initialEntrada?: string;
  initialSalida?: string;
  initialAdultos?: number;
}

export default function ReservarClient({
  initialEntrada = '',
  initialSalida = '',
  initialAdultos = 2,
}: ReservarClientProps) {
  const t = useTranslations('reservar');
  const tPasos = useTranslations('reservar.pasos');

  const {
    paso,
    porcentajePaso,
    puedeSeguir,
    siguientePaso,
    volverPaso,
    habitaciones,
    habitacionId,
    habitacionSeleccionada,
    seleccionarHabitacion,
    entrada,
    salida,
    adultos,
    noches,
    subtotal,
    impuestos,
    total,
    editandoFechas,
    editandoHuespedes,
    faqAbierto,
    setEntrada,
    setSalida,
    setAdultos,
    setEditandoFechas,
    setEditandoHuespedes,
    setFaqAbierto,
    // Paso 3
    huespedData,
    huespedErrors,
    huespedValido,
    actualizarHuesped,
    confirmarReserva,
    reservaConfirmadaId,
  } = useReservar(initialEntrada, initialSalida, initialAdultos);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <NavReservar />

      <main className="flex-1 pt-[80px]" id="main-content">
        {/* ── Barra de acciones ── */}
        {!reservaConfirmadaId && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid rgba(198,166,93,0.15)',
            }}
          >
            <div className="max-w-[1280px] mx-auto px-6 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={volverPaso}
                style={{
                  border: '1px solid #C6A75E',
                  backgroundColor: 'rgba(198,166,93,0.12)',
                  color: '#C6A75E',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: paso === 1 ? 'not-allowed' : 'pointer',
                  opacity: paso === 1 ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                }}
                disabled={paso === 1}
              >
                {paso === 1 ? t('abandonar') : `← ${t('anterior')}`}
              </button>

              {/* En paso 3 el botón confirmar está dentro del formulario */}
              {paso < 3 && (
                <button
                  type="button"
                  onClick={siguientePaso}
                  disabled={!puedeSeguir}
                  style={{
                    backgroundColor: '#C6A75E',
                    color: '#ffffff',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    cursor: puedeSeguir ? 'pointer' : 'not-allowed',
                    opacity: puedeSeguir ? 1 : 0.4,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {t('siguientePaso')} →
                </button>
              )}
            </div>
          </div>
        )}

        <div className="max-w-[1280px] mx-auto px-6 py-8">
          {/* ── Confirmación exitosa ── */}
          {reservaConfirmadaId ? (
            <ConfirmacionExitosa
              reservaId={reservaConfirmadaId}
              habitacion={habitacionSeleccionada?.nombre ?? ''}
              entrada={entrada}
              salida={salida}
              noches={noches}
              total={total}
            />
          ) : (
            <>
              {/* ── Encabezado del paso ── */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[11px] font-bold tracking-widest uppercase text-gold-600 mb-1">
                    {t('pasoIndicador', { paso, total: 3 })}
                  </p>
                  <h1 className="hotel-title text-brown-900 text-3xl">
                    {tPasos(`${PASOS[paso - 1]}.titulo`)}
                  </h1>
                </div>
                <p className="text-brown-500 text-sm mt-2">
                  {porcentajePaso}% {t('completado')}
                </p>
              </div>

              {/* ── Barra de progreso ── */}
              <div className="mb-8">
                <div
                  className="h-1.5 bg-brown-100 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={porcentajePaso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('progreso')}
                >
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${porcentajePaso}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {PASOS.map((p, i) => (
                    <span
                      key={p}
                      className={`text-xs font-medium ${
                        i + 1 === paso
                          ? 'text-gold-600'
                          : i + 1 < paso
                          ? 'text-brown-400'
                          : 'text-brown-300'
                      }`}
                    >
                      {tPasos(`${p}.label`)}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Paso 1: Habitación ── */}
              {paso === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                  <section aria-labelledby="habitaciones-titulo">
                    <h2
                      id="habitaciones-titulo"
                      className="text-lg font-semibold text-brown-900 mb-4 pl-3 border-l-4 border-gold-500"
                    >
                      {t('habitacionesDisponibles')}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {habitaciones.map((h) => (
                        <HabitacionCard
                          key={h.id}
                          habitacion={h}
                          seleccionada={h.id === habitacionId}
                          onSeleccionar={seleccionarHabitacion}
                          formatPrecio={formatPrecio}
                        />
                      ))}
                    </div>
                  </section>

                  <ResumenEstancia
                    habitacionSeleccionada={habitacionSeleccionada}
                    entrada={entrada}
                    salida={salida}
                    adultos={adultos}
                    noches={noches}
                    subtotal={subtotal}
                    impuestos={impuestos}
                    total={total}
                    editandoFechas={editandoFechas}
                    editandoHuespedes={editandoHuespedes}
                    faqAbierto={faqAbierto}
                    setEntrada={setEntrada}
                    setSalida={setSalida}
                    setAdultos={setAdultos}
                    setEditandoFechas={setEditandoFechas}
                    setEditandoHuespedes={setEditandoHuespedes}
                    setFaqAbierto={setFaqAbierto}
                    formatPrecio={formatPrecio}
                    formatFechaCorta={formatFechaCorta}
                  />
                </div>
              )}

              {/* ── Paso 2: Servicios ── */}
              {paso === 2 && (
                <div className="text-center py-20 text-brown-400">
                  <p className="hotel-title text-2xl mb-2">{tPasos('servicios.titulo')}</p>
                  <p className="text-sm">{t('proximamente')}</p>
                </div>
              )}

              {/* ── Paso 3: Datos del huésped ── */}
              {paso === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                  <PasoHuesped
                    huespedData={huespedData}
                    huespedErrors={huespedErrors}
                    huespedValido={huespedValido}
                    onCampo={actualizarHuesped}
                    onConfirmar={confirmarReserva}
                  />

                  <ResumenEstancia
                    habitacionSeleccionada={habitacionSeleccionada}
                    entrada={entrada}
                    salida={salida}
                    adultos={adultos}
                    noches={noches}
                    subtotal={subtotal}
                    impuestos={impuestos}
                    total={total}
                    editandoFechas={editandoFechas}
                    editandoHuespedes={editandoHuespedes}
                    faqAbierto={faqAbierto}
                    setEntrada={setEntrada}
                    setSalida={setSalida}
                    setAdultos={setAdultos}
                    setEditandoFechas={setEditandoFechas}
                    setEditandoHuespedes={setEditandoHuespedes}
                    setFaqAbierto={setFaqAbierto}
                    formatPrecio={formatPrecio}
                    formatFechaCorta={formatFechaCorta}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-brown-900 text-cream/50 text-xs py-4 text-center">
        <span aria-hidden="true">★</span>{' '}
        © 2024 Hotel Santa María &nbsp;·&nbsp;
        <a href="#" className="hover:text-cream transition-colors">{t('footer.privacidad')}</a>
        &nbsp;·&nbsp;
        <a href="#" className="hover:text-cream transition-colors">{t('footer.terminos')}</a>
        &nbsp;·&nbsp;
        <a href="#" className="hover:text-cream transition-colors">{t('footer.contacto')}</a>
      </footer>
    </div>
  );
}

// ── Pantalla de confirmación exitosa ─────────────────────────────────────────

interface ConfirmacionExitosaProps {
  reservaId: string;
  habitacion: string;
  entrada: string;
  salida: string;
  noches: number;
  total: number;
}

function ConfirmacionExitosa({
  reservaId,
  habitacion,
  entrada,
  salida,
  noches,
  total,
}: ConfirmacionExitosaProps) {
  const t = useTranslations('reservar.confirmacion');

  const formatFecha = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatCOP = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  return (
    <div
      className="max-w-xl mx-auto text-center py-16"
      role="status"
      aria-live="polite"
    >
      {/* Icono check */}
      <div
        className="mx-auto mb-6 flex items-center justify-center rounded-full"
        style={{
          width: 72,
          height: 72,
          backgroundColor: 'rgba(198,167,94,0.15)',
          border: '2px solid #C6A75E',
        }}
        aria-hidden="true"
      >
        <span style={{ fontSize: 32 }}>✓</span>
      </div>

      <h2 className="hotel-title text-brown-900 text-3xl mb-2">{t('titulo')}</h2>
      <p className="text-brown-500 text-sm mb-8">{t('subtitulo')}</p>

      {/* Tarjeta de resumen */}
      <div
        className="rounded-2xl p-6 text-left mb-8"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(198,167,94,0.25)',
          boxShadow: '0 2px 16px rgba(43,27,24,0.08)',
        }}
      >
        <dl className="space-y-3">
          <Row label={t('idLabel')} value={reservaId} mono />
          <Row label={t('habitacionLabel')} value={habitacion} />
          <Row label={t('entradaLabel')} value={formatFecha(entrada)} />
          <Row label={t('salidaLabel')} value={formatFecha(salida)} />
          <Row label={t('nochesLabel')} value={`${noches} ${noches === 1 ? 'noche' : 'noches'}`} />
          <div className="border-t border-gold-200 pt-3">
            <Row label={t('totalLabel')} value={formatCOP(total)} bold />
          </div>
        </dl>
      </div>

      <p className="text-xs text-brown-400 mb-6">{t('nota')}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/home"
          style={{
            backgroundColor: '#C6A75E',
            color: '#ffffff',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '14px',
            padding: '12px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {t('irInicio')}
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
  bold = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-2">
      <dt className="text-xs text-brown-400 uppercase tracking-wide font-medium">{label}</dt>
      <dd
        className={`text-sm text-brown-900 text-right ${bold ? 'font-bold text-base' : ''}`}
        style={mono ? { fontFamily: 'monospace' } : {}}
      >
        {value}
      </dd>
    </div>
  );
}
