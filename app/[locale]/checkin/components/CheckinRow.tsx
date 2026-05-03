'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import type { Checkin, Cliente, Reserva, EstadoCheckin } from '@/types';

interface CheckinRowProps {
  checkin: Checkin;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
  onActualizar: (checkin: Checkin) => void;
  onAnular: (checkin: Checkin) => void;
}

function formatFechaHora(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function CheckinRow({
  checkin,
  cliente,
  reserva,
  onActualizar,
  onAnular,
}: CheckinRowProps) {
  const t = useTranslations('checkin');
  const tCommon = useTranslations('common');

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : `ID: ${checkin.clienteId}`;

  const esPendiente = checkin.estado === 'pendiente';
  const esCompletado = checkin.estado === 'completado';
  const esAnulado = checkin.estado === 'anulado';

  return (
    <tr
      className={`border-b border-brown-100 transition-colors ${
        esPendiente
          ? 'bg-gold-50 hover:bg-gold-100'   // Pendientes destacados
          : 'hover:bg-brown-50'
      }`}
    >
      {/* Cliente */}
      <td className="px-4 py-3">
        <div className="font-medium text-brown-900">{nombreCliente}</div>
        {reserva && (
          <div className="text-xs text-brown-400">
            Reserva #{reserva.id.slice(-5).toUpperCase()}
          </div>
        )}
      </td>

      {/* Habitación */}
      <td className="px-4 py-3 text-sm text-brown-700">
        Hab. {checkin.habitacionNumero}
      </td>

      {/* Fecha/hora de check-in */}
      <td className="px-4 py-3 text-sm text-brown-700">
        {formatFechaHora(checkin.fechaHoraCheckin)}
      </td>

      {/* Check-out esperado */}
      <td className="px-4 py-3 text-sm text-brown-700">
        {formatFecha(checkin.fechaEsperadaCheckout)}
      </td>

      {/* N° acompañantes */}
      <td className="px-4 py-3 text-sm text-center text-brown-700">
        {checkin.numeroAcompanantes}
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <Badge
          variant={checkin.estado as EstadoCheckin}
          label={t(`estados.${checkin.estado}`)}
        />
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Actualizar — disponible en pendiente y completado */}
          {!esAnulado && (
            <button
              onClick={() => onActualizar(checkin)}
              aria-label={`${tCommon('edit')} check-in de ${nombreCliente}`}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-brown-700 border border-brown-200 hover:bg-brown-100 transition-colors"
            >
              {tCommon('edit')}
            </button>
          )}

          {/* Anular — solo disponible en completado */}
          {esCompletado && (
            <button
              onClick={() => onAnular(checkin)}
              aria-label={`Anular check-in de ${nombreCliente}`}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-brown-600 border border-brown-200 hover:bg-brown-100 transition-colors"
            >
              {t('anular.titulo')}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
