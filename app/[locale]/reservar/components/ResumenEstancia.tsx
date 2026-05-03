'use client';

import { useTranslations } from 'next-intl';
import type { HabitacionDisponible } from '../hooks/useReservar';

interface ResumenEstanciaProps {
  habitacionSeleccionada: HabitacionDisponible | null;
  entrada: string;
  salida: string;
  adultos: number;
  noches: number;
  subtotal: number;
  impuestos: number;
  total: number;
  editandoFechas: boolean;
  editandoHuespedes: boolean;
  faqAbierto: boolean;
  setEntrada: (v: string) => void;
  setSalida: (v: string) => void;
  setAdultos: (v: number) => void;
  setEditandoFechas: (v: boolean) => void;
  setEditandoHuespedes: (v: boolean) => void;
  setFaqAbierto: (v: boolean) => void;
  formatPrecio: (v: number) => string;
  formatFechaCorta: (iso: string) => string;
}

export default function ResumenEstancia({
  habitacionSeleccionada,
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
  formatPrecio,
  formatFechaCorta,
}: ResumenEstanciaProps) {
  const t = useTranslations('reservar.resumen');

  return (
    <aside
      className="bg-white rounded-xl border border-brown-200 p-6 flex flex-col gap-5 sticky top-[96px]"
      aria-label={t('ariaLabel')}
    >
      <h2 className="hotel-title text-brown-900 text-xl">{t('titulo')}</h2>

      {/* ESTANCIA */}
      <section aria-labelledby="resumen-estancia-label">
        <div className="flex items-center justify-between mb-2">
          <span
            id="resumen-estancia-label"
            className="text-[10px] font-bold tracking-widest uppercase text-brown-500"
          >
            {t('estancia')}
          </span>
          <button
            type="button"
            className="text-gold-600 text-xs underline hover:text-gold-700"
            onClick={() => setEditandoFechas(!editandoFechas)}
            aria-expanded={editandoFechas}
          >
            {editandoFechas ? t('cerrar') : t('editar')}
          </button>
        </div>

        {editandoFechas ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-brown-600">
              {t('entrada')}
              <input
                type="date"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                className="mt-1 w-full border border-brown-200 rounded px-2 py-1 text-sm text-brown-900 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </label>
            <label className="text-xs text-brown-600">
              {t('salida')}
              <input
                type="date"
                value={salida}
                onChange={(e) => setSalida(e.target.value)}
                className="mt-1 w-full border border-brown-200 rounded px-2 py-1 text-sm text-brown-900 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </label>
          </div>
        ) : (
          <p className="text-brown-800 text-sm">
            {formatFechaCorta(entrada)} → {formatFechaCorta(salida)}
            <span className="ml-2 text-brown-500 text-xs">({noches} {t('noches')})</span>
          </p>
        )}
      </section>

      {/* HUÉSPEDES */}
      <section aria-labelledby="resumen-huespedes-label">
        <div className="flex items-center justify-between mb-2">
          <span
            id="resumen-huespedes-label"
            className="text-[10px] font-bold tracking-widest uppercase text-brown-500"
          >
            {t('huespedes')}
          </span>
          <button
            type="button"
            className="text-gold-600 text-xs underline hover:text-gold-700"
            onClick={() => setEditandoHuespedes(!editandoHuespedes)}
            aria-expanded={editandoHuespedes}
          >
            {editandoHuespedes ? t('cerrar') : t('editar')}
          </button>
        </div>

        {editandoHuespedes ? (
          <label className="text-xs text-brown-600">
            {t('adultos')}
            <input
              type="number"
              min={1}
              max={10}
              value={adultos}
              onChange={(e) => setAdultos(Number(e.target.value))}
              className="mt-1 w-full border border-brown-200 rounded px-2 py-1 text-sm text-brown-900 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
          </label>
        ) : (
          <p className="text-brown-800 text-sm">
            {adultos} {t('adultosLabel')}
          </p>
        )}
      </section>

      {/* DESGLOSE DE PRECIO */}
      <section aria-labelledby="resumen-precio-label" className="border-t border-brown-100 pt-4 flex flex-col gap-2">
        <span
          id="resumen-precio-label"
          className="sr-only"
        >
          {t('desglosePrecio')}
        </span>

        {habitacionSeleccionada ? (
          <>
            <div className="flex justify-between text-sm text-brown-700">
              <span>
                {formatPrecio(habitacionSeleccionada.precioPorNoche)} × {noches} {t('noches')}
              </span>
              <span>{formatPrecio(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-brown-500">
              <span>{t('impuestos')}</span>
              <span>{formatPrecio(impuestos)}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-brown-200 pt-2 mt-1">
              <span className="font-semibold text-brown-900">{t('total')}</span>
              <span className="text-gold-600 text-2xl font-bold hotel-title">
                {formatPrecio(total)}
              </span>
            </div>
            <p className="text-brown-400 text-[11px] mt-1">{t('disclaimer')}</p>
          </>
        ) : (
          <p className="text-brown-400 text-sm italic">{t('sinHabitacion')}</p>
        )}
      </section>

      {/* FAQ */}
      <section id="ayuda">
        <button
          type="button"
          className="w-full flex items-center justify-between text-sm text-brown-700 font-medium border border-brown-200 rounded px-3 py-2 hover:bg-brown-50 transition-colors"
          onClick={() => setFaqAbierto(!faqAbierto)}
          aria-expanded={faqAbierto}
          aria-controls="faq-contenido"
        >
          <span>{t('faqTitulo')}</span>
          <span aria-hidden="true">{faqAbierto ? '▲' : '▼'}</span>
        </button>

        {faqAbierto && (
          <div id="faq-contenido" className="mt-2 text-xs text-brown-600 space-y-2 px-3">
            <p><strong>{t('faq1Pregunta')}</strong><br />{t('faq1Respuesta')}</p>
            <p><strong>{t('faq2Pregunta')}</strong><br />{t('faq2Respuesta')}</p>
          </div>
        )}
      </section>

      {/* Botón de ayuda */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 border border-brown-300 text-brown-700 rounded px-4 py-2 text-sm hover:bg-brown-50 transition-colors"
        aria-label={t('ayudaAriaLabel')}
      >
        <span aria-hidden="true">💬</span>
        {t('ayudaBoton')}
      </button>
    </aside>
  );
}
