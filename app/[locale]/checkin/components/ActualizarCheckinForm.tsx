'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import type { Checkin, CheckinUpdateData } from '@/types';

interface ActualizarCheckinFormProps {
  isOpen: boolean;
  onClose: () => void;
  onActualizar: (id: string, data: CheckinUpdateData) => { ok: boolean };
  checkin: Checkin | null;
}

/**
 * ActualizarCheckinForm — HU-K3: editar datos de un check-in registrado.
 *
 * Campos editables: observaciones, numeroAcompanantes, habitacionNumero.
 * Campos de solo lectura: fechaHoraCheckin (registro histórico inmutable).
 */
export function ActualizarCheckinForm({
  isOpen,
  onClose,
  onActualizar,
  checkin,
}: ActualizarCheckinFormProps) {
  const t = useTranslations('checkin');
  const tCommon = useTranslations('common');

  const [form, setForm] = useState<CheckinUpdateData>({
    numeroAcompanantes: 0,
    observaciones: '',
    habitacionNumero: '',
  });

  useEffect(() => {
    if (checkin) {
      setForm({
        numeroAcompanantes: checkin.numeroAcompanantes,
        observaciones: checkin.observaciones ?? '',
        habitacionNumero: checkin.habitacionNumero,
      });
    }
  }, [checkin, isOpen]);

  if (!checkin) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onActualizar(checkin!.id, form);
    onClose();
  }

  const fechaHoraFormateada = checkin.fechaHoraCheckin
    ? new Date(checkin.fechaHoraCheckin).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '—';

  const inputClass =
    'w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 bg-white focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:bg-brown-50 disabled:text-brown-400';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editarTitulo')}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate aria-label={t('editarTitulo')}>
        <div className="flex flex-col gap-4">

          {/* Fecha/hora de check-in — solo lectura, registro histórico */}
          <div className="rounded-xl bg-brown-50 px-4 py-3">
            <p className="text-xs font-medium text-brown-500 uppercase tracking-wide">
              {t('campos.fechaHoraCheckin')}
            </p>
            <p className="mt-1 text-sm font-semibold text-brown-700">
              {fechaHoraFormateada}
            </p>
            <p className="mt-0.5 text-xs text-brown-400">
              Este campo es inmutable — es el registro histórico del ingreso.
            </p>
          </div>

          {/* Habitación */}
          <FormField label={t('campos.habitacion')}>
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.habitacionNumero}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, habitacionNumero: e.target.value }))
                }
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* N° de acompañantes */}
          <FormField label={t('campos.numeroAcompanantes')}>
            {(id, aria) => (
              <input
                id={id}
                type="number"
                min={0}
                max={10}
                value={form.numeroAcompanantes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    numeroAcompanantes: Number(e.target.value),
                  }))
                }
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Observaciones */}
          <FormField label={t('campos.observaciones')}>
            {(id, aria) => (
              <textarea
                id={id}
                value={form.observaciones ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, observaciones: e.target.value }))
                }
                rows={3}
                placeholder="Ej: Huésped VIP — atención prioritaria"
                className={`${inputClass} resize-none`}
                {...aria}
              />
            )}
          </FormField>
        </div>

        <div className="mt-5 flex justify-end gap-3 border-t border-brown-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brown-200 px-5 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gold-600 px-5 py-2 text-sm font-medium text-white hover:bg-gold-700 transition-colors"
          >
            {tCommon('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
