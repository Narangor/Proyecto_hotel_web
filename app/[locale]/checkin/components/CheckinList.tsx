'use client';

import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckinRow } from './CheckinRow';
import type { Checkin, EstadoCheckin } from '@/types';
import type { CheckinConDatos } from '../hooks/useCheckin';

const ESTADOS: EstadoCheckin[] = ['pendiente', 'completado', 'no_presentado', 'anulado'];

interface CheckinListProps {
  checkins: CheckinConDatos[];
  filtroEstado: EstadoCheckin | '';
  onFiltroEstadoChange: (estado: EstadoCheckin | '') => void;
  onActualizar: (checkin: Checkin) => void;
  onAnular: (checkin: Checkin) => void;
}

export function CheckinList({
  checkins,
  filtroEstado,
  onFiltroEstadoChange,
  onActualizar,
  onAnular,
}: CheckinListProps) {
  const t = useTranslations('checkin');
  const tCommon = useTranslations('common');

  return (
    <div className="flex flex-col gap-4">
      {/* Filtro por estado */}
      <div className="flex items-center gap-3">
        <label htmlFor="filtro-estado-checkin" className="text-sm font-medium text-brown-700">
          {tCommon('status')}:
        </label>
        <select
          id="filtro-estado-checkin"
          value={filtroEstado}
          onChange={(e) => onFiltroEstadoChange(e.target.value as EstadoCheckin | '')}
          className="rounded-xl border border-brown-200 bg-white px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {t(`estados.${estado}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {checkins.length === 0 ? (
        <EmptyState message={t('sinCheckins')} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brown-100 bg-white shadow-sm">
          <table className="w-full text-sm" aria-label={t('title')}>
            <thead>
              <tr className="border-b border-brown-100 bg-brown-50">
                {[
                  t('campos.cliente'),
                  t('campos.habitacion'),
                  t('campos.fechaHoraCheckin'),
                  t('campos.fechaEsperadaCheckout'),
                  t('campos.numeroAcompanantes'),
                  tCommon('status'),
                  '',
                ].map((col, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500"
                  >
                    {col || <span className="sr-only">{tCommon('actions')}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checkins.map(({ checkin, cliente, reserva }) => (
                <CheckinRow
                  key={checkin.id}
                  checkin={checkin}
                  cliente={cliente}
                  reserva={reserva}
                  onActualizar={onActualizar}
                  onAnular={onAnular}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
