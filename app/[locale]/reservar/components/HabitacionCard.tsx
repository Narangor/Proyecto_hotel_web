'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { HabitacionDisponible } from '../hooks/useReservar';

// ── Iconos de amenidad ──────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
  huespedes: '👥',
  wifi:      '📶',
  ac:        '❄️',
  balcon:    '🏙️',
  nespresso: '☕',
  spa:       '🧖',
};

// ── Componente ──────────────────────────────────────────────────────────────

interface HabitacionCardProps {
  habitacion: HabitacionDisponible;
  seleccionada: boolean;
  onSeleccionar: (id: string) => void;
  formatPrecio: (v: number) => string;
}

export default function HabitacionCard({
  habitacion,
  seleccionada,
  onSeleccionar,
  formatPrecio,
}: HabitacionCardProps) {
  const t = useTranslations('reservar.tarjeta');

  return (
    <article
      className={`
        flex rounded-xl overflow-hidden border transition-all cursor-pointer
        ${seleccionada
          ? 'border-gold-500 ring-2 ring-gold-400/50'
          : 'border-brown-700 hover:border-brown-500'}
        bg-brown-900
      `}
      onClick={() => onSeleccionar(habitacion.id)}
      aria-pressed={seleccionada}
      aria-label={habitacion.nombre}
    >
      {/* Imagen de la habitación */}
      <div className="w-2/5 min-h-[180px] flex-shrink-0 relative overflow-hidden">
        {habitacion.imagen ? (
          <Image
            src={habitacion.imagen}
            alt={habitacion.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 240px"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${habitacion.gradiente}`}
            aria-hidden="true"
          />
        )}
        {habitacion.esMasPopular && (
          <span className="absolute top-3 left-3 z-10 bg-gold-500 text-brown-900 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
            {t('masPopular')}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Nombre */}
        <h3 className="font-bold text-gold-400 text-base leading-tight">
          {habitacion.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-cream/60 text-xs leading-relaxed">
          {habitacion.descripcion}
        </p>

        {/* Amenidades */}
        <ul className="flex flex-wrap gap-2" aria-label={t('amenidades')}>
          {habitacion.amenidades.map(({ tipo, label }) => (
            <li
              key={tipo}
              className="flex items-center gap-1 text-cream/70 text-xs"
            >
              <span aria-hidden="true">{ICONS[tipo] ?? '•'}</span>
              <span>{label}</span>
            </li>
          ))}
        </ul>

        {/* Precio + botón */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-brown-700">
          <div>
            <span className="text-gold-300 text-xl font-bold">
              {formatPrecio(habitacion.precioPorNoche)}
            </span>
            <span className="text-cream/50 text-xs ml-1">{t('porNoche')}</span>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSeleccionar(habitacion.id); }}
            className={`
              px-4 py-1.5 rounded text-sm font-medium transition-colors
              ${seleccionada
                ? 'bg-gold-500 text-brown-900 hover:bg-gold-400'
                : 'border border-gold-500 text-gold-400 hover:bg-gold-500/10'}
            `}
            aria-pressed={seleccionada}
          >
            {seleccionada ? t('deseleccionar') : t('seleccionar')}
          </button>
        </div>
      </div>
    </article>
  );
}
