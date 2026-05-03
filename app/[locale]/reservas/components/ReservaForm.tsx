'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { calcularTotal } from '../hooks/useReservas';
import type { Cliente, Reserva, ReservaFormData, TipoHabitacion } from '@/types';
import { HABITACIONES, PRECIOS_HABITACION } from '@/lib/mock-data';

interface ReservaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservaFormData) => { ok: boolean; error?: string };
  onEdit: (id: string, data: ReservaFormData) => { ok: boolean; error?: string };
  reservaInicial?: Reserva | null;
  clientes: Cliente[];
}

type FormErrors = Partial<Record<keyof ReservaFormData | 'general', string>>;

const TIPOS_HABITACION: TipoHabitacion[] = ['SENCILLA', 'DOBLE', 'SUITE', 'FAMILIAR'];

const FORM_VACIO: ReservaFormData = {
  clienteId: '',
  habitacionNumero: '',
  tipoHabitacion: 'SENCILLA',
  fechaEntrada: '',
  fechaSalida: '',
  numeroHuespedes: 1,
  observaciones: '',
};

function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor);
}

/**
 * ReservaForm — formulario para crear y editar reservas.
 *
 * Características:
 * - Selección de cliente desde la lista de clientes registrados.
 * - Selección de tipo de habitación filtra las habitaciones disponibles.
 * - Fechas controlan el cálculo automático del total.
 * - Valida fechas y disponibilidad antes de llamar al hook.
 */
export function ReservaForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  reservaInicial,
  clientes,
}: ReservaFormProps) {
  const t = useTranslations('reservas');
  const tCommon = useTranslations('common');

  const esEdicion = Boolean(reservaInicial);
  const [form, setForm] = useState<ReservaFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Habitaciones filtradas según el tipo seleccionado
  const habitacionesFiltradas = HABITACIONES.filter(
    (h) => h.tipo === form.tipoHabitacion,
  );

  // Total calculado en tiempo real
  const totalCalculado =
    form.tipoHabitacion && form.fechaEntrada && form.fechaSalida
      ? calcularTotal(form.tipoHabitacion, form.fechaEntrada, form.fechaSalida)
      : 0;

  // Cargar datos al abrir en modo edición
  useEffect(() => {
    if (reservaInicial) {
      setForm({
        clienteId: reservaInicial.clienteId,
        habitacionNumero: reservaInicial.habitacionNumero,
        tipoHabitacion: reservaInicial.tipoHabitacion,
        fechaEntrada: reservaInicial.fechaEntrada,
        fechaSalida: reservaInicial.fechaSalida,
        numeroHuespedes: reservaInicial.numeroHuespedes,
        observaciones: reservaInicial.observaciones ?? '',
      });
    } else {
      setForm(FORM_VACIO);
    }
    setErrors({});
  }, [reservaInicial, isOpen]);

  function actualizar<K extends keyof ReservaFormData>(campo: K, valor: ReservaFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [campo]: valor };
      // Al cambiar tipo, limpiar habitación seleccionada
      if (campo === 'tipoHabitacion') {
        next.habitacionNumero = '';
      }
      return next;
    });
    if (errors[campo as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.clienteId) e.clienteId = t('errores.clienteRequerido');
    if (!form.habitacionNumero) e.habitacionNumero = t('errores.habitacionRequerida');
    if (!form.fechaEntrada) e.fechaEntrada = t('errores.fechaEntradaRequerida');
    if (!form.fechaSalida) e.fechaSalida = t('errores.fechaSalidaRequerida');
    if (form.fechaEntrada && form.fechaSalida && form.fechaSalida <= form.fechaEntrada) {
      e.fechaSalida = t('errores.fechasInvalidas');
    }
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validar();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    let resultado: { ok: boolean; error?: string };

    if (esEdicion && reservaInicial) {
      resultado = onEdit(reservaInicial.id, form);
    } else {
      resultado = onSubmit(form);
    }

    setSubmitting(false);

    if (!resultado.ok) {
      if (resultado.error === 'habitacionNoDisponible') {
        setErrors({ habitacionNumero: t('errores.habitacionNoDisponible') });
      } else if (resultado.error === 'fechasInvalidas') {
        setErrors({ fechaSalida: t('errores.fechasInvalidas') });
      }
      return;
    }

    onClose();
  }

  const inputClass =
    'w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 bg-white focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:bg-brown-50 disabled:text-brown-400';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? t('editarTitulo') : t('crearTitulo')}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate aria-label={esEdicion ? t('editarTitulo') : t('crearTitulo')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Cliente */}
          <FormField label={t('campos.cliente')} required error={errors.clienteId}>
            {(id, aria) => (
              <select
                id={id}
                value={form.clienteId}
                onChange={(e) => actualizar('clienteId', e.target.value)}
                className={inputClass}
                {...aria}
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.filter((c) => c.estado === 'activo').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido} — {c.numeroDocumento}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Tipo de habitación */}
          <FormField label={t('campos.tipoHabitacion')} required error={errors.tipoHabitacion}>
            {(id, aria) => (
              <select
                id={id}
                value={form.tipoHabitacion}
                onChange={(e) => actualizar('tipoHabitacion', e.target.value as TipoHabitacion)}
                className={inputClass}
                {...aria}
              >
                {TIPOS_HABITACION.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {t(`tiposHabitacion.${tipo}`)} — {formatCOP(PRECIOS_HABITACION[tipo])}/noche
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Número de habitación */}
          <FormField label={t('campos.habitacion')} required error={errors.habitacionNumero}>
            {(id, aria) => (
              <select
                id={id}
                value={form.habitacionNumero}
                onChange={(e) => actualizar('habitacionNumero', e.target.value)}
                className={inputClass}
                {...aria}
              >
                <option value="">Seleccionar habitación...</option>
                {habitacionesFiltradas.map((h) => (
                  <option key={h.numero} value={h.numero}>
                    Hab. {h.numero} — Piso {h.piso}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* N° de huéspedes */}
          <FormField label={t('campos.numeroHuespedes')} required error={errors.numeroHuespedes}>
            {(id, aria) => (
              <input
                id={id}
                type="number"
                min={1}
                max={10}
                value={form.numeroHuespedes}
                onChange={(e) => actualizar('numeroHuespedes', Number(e.target.value))}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Fecha de entrada */}
          <FormField label={t('campos.fechaEntrada')} required error={errors.fechaEntrada}>
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fechaEntrada}
                onChange={(e) => actualizar('fechaEntrada', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Fecha de salida */}
          <FormField label={t('campos.fechaSalida')} required error={errors.fechaSalida}>
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fechaSalida}
                min={form.fechaEntrada || undefined}
                onChange={(e) => actualizar('fechaSalida', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Observaciones — ocupa ancho completo */}
          <div className="sm:col-span-2">
            <FormField label={t('campos.observaciones')} error={errors.observaciones}>
              {(id, aria) => (
                <textarea
                  id={id}
                  value={form.observaciones ?? ''}
                  onChange={(e) => actualizar('observaciones', e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  {...aria}
                />
              )}
            </FormField>
          </div>
        </div>

        {/* Total calculado en tiempo real */}
        {totalCalculado > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-gold-50 border border-gold-200 px-4 py-3">
            <span className="text-sm font-medium text-brown-700">
              {t('campos.total')} estimado
            </span>
            <span className="font-serif text-lg font-bold text-gold-700">
              {formatCOP(totalCalculado)}
            </span>
          </div>
        )}

        {/* Acciones */}
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
            disabled={submitting}
            className="rounded-xl bg-gold-600 px-5 py-2 text-sm font-medium text-white hover:bg-gold-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
