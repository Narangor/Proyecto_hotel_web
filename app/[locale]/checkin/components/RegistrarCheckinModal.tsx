'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import type { Reserva, Cliente } from '@/types';

interface RegistrarCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservasElegibles: Reserva[];
  clienteMap: Map<string, Cliente>;
  onRegistrar: (reservaId: string) => { ok: boolean; error?: string; hora?: string };
}

/**
 * RegistrarCheckinModal — HU-K2: registrar el ingreso de un huésped.
 *
 * Muestra las reservas elegibles (confirmadas, fecha de hoy ±1 día,
 * sin check-in previo). El recepcionista selecciona una y confirma.
 *
 * Si no hay reservas elegibles, muestra un estado vacío informativo.
 */
export function RegistrarCheckinModal({
  isOpen,
  onClose,
  reservasElegibles,
  clienteMap,
  onRegistrar,
}: RegistrarCheckinModalProps) {
  const t = useTranslations('checkin');
  const tCommon = useTranslations('common');

  const [reservaSeleccionadaId, setReservaSeleccionadaId] = useState('');
  const [error, setError] = useState('');

  function handleClose() {
    setReservaSeleccionadaId('');
    setError('');
    onClose();
  }

  function handleRegistrar() {
    if (!reservaSeleccionadaId) return;
    const resultado = onRegistrar(reservaSeleccionadaId);
    if (resultado.ok) {
      handleClose();
    } else if (resultado.error === 'yaRealizado') {
      setError(t('errores.yaRealizado', { hora: resultado.hora ?? '' }));
    } else {
      setError(t('errores.sinReserva'));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('registrar')}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {reservasElegibles.length === 0 ? (
          /* Estado vacío — ninguna reserva elegible para hoy */
          <div className="rounded-xl bg-brown-50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-brown-600">
              {t('errores.sinReserva')}
            </p>
            <p className="mt-1 text-xs text-brown-400">
              No hay reservas confirmadas para registrar en este momento.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-brown-600">
              Selecciona la reserva del huésped que deseas registrar:
            </p>

            {/* Lista de reservas elegibles como cards seleccionables */}
            <div
              className="flex flex-col gap-2"
              role="listbox"
              aria-label="Reservas disponibles para check-in"
            >
              {reservasElegibles.map((reserva) => {
                const cliente = clienteMap.get(reserva.clienteId);
                const isSelected = reservaSeleccionadaId === reserva.id;

                return (
                  <button
                    key={reserva.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setReservaSeleccionadaId(reserva.id);
                      setError('');
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-200'
                        : 'border-brown-200 hover:border-brown-300 hover:bg-brown-50'
                    }`}
                  >
                    <div className="font-medium text-brown-900">
                      {cliente
                        ? `${cliente.nombre} ${cliente.apellido}`
                        : `Cliente ID: ${reserva.clienteId}`}
                    </div>
                    <div className="mt-0.5 flex gap-3 text-xs text-brown-500">
                      <span>Hab. {reserva.habitacionNumero}</span>
                      <span>·</span>
                      <span>Entrada: {new Date(reserva.fechaEntrada).toLocaleDateString('es-CO')}</span>
                      <span>·</span>
                      <span>Salida: {new Date(reserva.fechaSalida).toLocaleDateString('es-CO')}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <p role="alert" className="text-xs text-amber-700">
                {error}
              </p>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3 border-t border-brown-100 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="button"
                onClick={handleRegistrar}
                disabled={!reservaSeleccionadaId}
                className="rounded-xl bg-gold-600 px-4 py-2 text-sm font-medium text-white hover:bg-gold-700 disabled:opacity-50 transition-colors"
              >
                {t('registrar')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
