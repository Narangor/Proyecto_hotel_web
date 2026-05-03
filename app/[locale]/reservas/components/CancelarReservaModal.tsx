'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import type { Reserva, Cliente } from '@/types';

interface CancelarReservaModalProps {
  reserva: Reserva | null;
  cliente: Cliente | undefined;
  onConfirmar: (id: string, motivo?: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

/**
 * CancelarReservaModal — confirmación de cancelación con motivo opcional.
 *
 * La reserva pasa a estado 'cancelada' pero NO se elimina del sistema,
 * manteniendo el historial completo del cliente.
 */
export function CancelarReservaModal({
  reserva,
  cliente,
  onConfirmar,
  onCerrar,
}: CancelarReservaModalProps) {
  const t = useTranslations('reservas');
  const tCommon = useTranslations('common');
  const [motivo, setMotivo] = useState('');

  if (!reserva) return null;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : `ID: ${reserva.clienteId}`;

  function handleConfirmar() {
    if (!reserva) return;
    const resultado = onConfirmar(reserva.id, motivo || undefined);
    if (resultado.ok) {
      setMotivo('');
      onCerrar();
    }
  }

  function handleCerrar() {
    setMotivo('');
    onCerrar();
  }

  return (
    <Modal
      isOpen={Boolean(reserva)}
      onClose={handleCerrar}
      title={t('cancelar.titulo')}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">
          {t('cancelar.mensaje', { nombre: nombreCliente })}
        </p>

        {/* Habitación y fechas como contexto visual */}
        <div className="rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600 space-y-1">
          <div>
            <span className="font-medium">Habitación:</span>{' '}
            {reserva.habitacionNumero}
          </div>
          <div>
            <span className="font-medium">Entrada:</span>{' '}
            {new Date(reserva.fechaEntrada).toLocaleDateString('es-CO')}
          </div>
          <div>
            <span className="font-medium">Salida:</span>{' '}
            {new Date(reserva.fechaSalida).toLocaleDateString('es-CO')}
          </div>
        </div>

        {/* Motivo opcional */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="motivo-cancelacion"
            className="text-sm font-medium text-brown-800"
          >
            {t('cancelar.motivo')}
          </label>
          <textarea
            id="motivo-cancelacion"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ej: Cambio de planes del cliente..."
            className="w-full resize-none rounded-lg border border-brown-200 bg-white px-3 py-2 text-sm text-brown-900 placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleCerrar}
            className="rounded-xl border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            aria-label={`Confirmar cancelación de reserva de ${nombreCliente}`}
            className="rounded-xl bg-brown-700 px-4 py-2 text-sm font-medium text-white hover:bg-brown-800 transition-colors"
          >
            {tCommon('confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
