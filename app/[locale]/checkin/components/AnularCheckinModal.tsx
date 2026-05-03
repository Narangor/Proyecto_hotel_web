'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import type { Checkin, Cliente } from '@/types';

interface AnularCheckinModalProps {
  checkin: Checkin | null;
  cliente: Cliente | undefined;
  onAnular: (id: string, motivo: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

/**
 * AnularCheckinModal — HU-K4: anular un check-in registrado por error.
 *
 * El motivo es obligatorio: sin él no se puede confirmar la anulación.
 * El check-in queda en estado 'anulado' con historial de motivo y timestamp.
 *
 * En Ciclo 2, esta acción también revertirá la reserva asociada a 'confirmada'.
 */
export function AnularCheckinModal({
  checkin,
  cliente,
  onAnular,
  onCerrar,
}: AnularCheckinModalProps) {
  const t = useTranslations('checkin');
  const tCommon = useTranslations('common');
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState('');

  if (!checkin) return null;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : `ID: ${checkin.clienteId}`;

  const fechaCheckinFormateada = checkin.fechaHoraCheckin
    ? new Date(checkin.fechaHoraCheckin).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '—';

  function handleCerrar() {
    setMotivo('');
    setErrorMotivo('');
    onCerrar();
  }

  function handleConfirmar() {
    const resultado = onAnular(checkin!.id, motivo);
    if (!resultado.ok) {
      if (resultado.error === 'motivoRequerido') {
        setErrorMotivo(t('errores.motivoRequerido'));
      }
      return;
    }
    setMotivo('');
    setErrorMotivo('');
    onCerrar();
  }

  return (
    <Modal
      isOpen={Boolean(checkin)}
      onClose={handleCerrar}
      title={t('anular.titulo')}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        {/* Contexto del check-in a anular */}
        <p className="text-sm text-brown-700">
          {t('anular.mensaje', {
            nombre: nombreCliente,
            habitacion: checkin.habitacionNumero,
          })}
        </p>

        <div className="rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600 space-y-1">
          <div>
            <span className="font-medium">Habitación:</span>{' '}
            {checkin.habitacionNumero}
          </div>
          <div>
            <span className="font-medium">Check-in registrado:</span>{' '}
            {fechaCheckinFormateada}
          </div>
        </div>

        {/* Motivo — obligatorio */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="motivo-anulacion"
            className="text-sm font-medium text-brown-800"
          >
            {t('anular.motivo')}
            <span className="ml-1 text-gold-600" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id="motivo-anulacion"
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (e.target.value.trim()) setErrorMotivo('');
            }}
            rows={3}
            placeholder="Ej: Error de registro — el huésped ingresó por otra recepción"
            aria-required="true"
            aria-invalid={Boolean(errorMotivo)}
            aria-describedby={errorMotivo ? 'error-motivo' : undefined}
            className="w-full resize-none rounded-lg border border-brown-200 bg-white px-3 py-2 text-sm text-brown-900 placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
          {errorMotivo && (
            <p
              id="error-motivo"
              role="alert"
              className="text-xs text-amber-700"
            >
              {errorMotivo}
            </p>
          )}
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
            aria-label={`Confirmar anulación del check-in de ${nombreCliente}`}
            className="rounded-xl bg-brown-700 px-4 py-2 text-sm font-medium text-white hover:bg-brown-800 transition-colors"
          >
            {tCommon('confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
