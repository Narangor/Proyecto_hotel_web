"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import type { Pago, PagoFormData, MetodoPago, Reserva, Cliente } from "@/types";

interface PagoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PagoFormData) => { ok: boolean; error?: string };
  onEdit: (id: string, data: PagoFormData) => { ok: boolean; error?: string };
  pagoInicial?: Pago | null;
  reservas: Reserva[];
  clientes: Cliente[];
}

type FormErrors = Partial<Record<keyof PagoFormData | "general", string>>;

const METODOS_PAGO: MetodoPago[] = [
  "EFECTIVO",
  "TARJETA_CREDITO",
  "TARJETA_DEBITO",
  "TRANSFERENCIA",
  "PSE",
];

const FORM_VACIO: PagoFormData = {
  reservaId: "",
  monto: 0,
  fecha: new Date().toISOString().split("T")[0], // Fecha actual por defecto
  metodoPago: "EFECTIVO",
  referencia: "",
  observaciones: "",
};

function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

/**
 * PagoForm - formulario para crear y editar pagos.
 *
 * Características:
 * - Selección de reserva
 * - El monto se puede ajustar
 * - Selección de método de pago
 * - Referencia opcional
 * - Solo permite editar pagos en estado pendiente
 */
export function PagoForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  pagoInicial,
  reservas,
  clientes,
}: PagoFormProps) {
  const t = useTranslations("pagos");
  const tCommon = useTranslations("common");

  const esEdicion = Boolean(pagoInicial);
  const [form, setForm] = useState<PagoFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const reservaSeleccionada = reservas.find((r) => r.id === form.reservaId);
  const clienteSeleccionado = reservaSeleccionada
    ? clientes.find((c) => c.id === reservaSeleccionada.clienteId)
    : undefined;

  useEffect(() => {
    if (pagoInicial) {
      setForm({
        reservaId: pagoInicial.reservaId,
        monto: pagoInicial.monto,
        fecha: pagoInicial.fecha,
        metodoPago: pagoInicial.metodoPago,
        referencia: pagoInicial.referencia ?? "",
        observaciones: pagoInicial.observaciones ?? "",
      });
    } else {
      setForm(FORM_VACIO);
    }
    setErrors({});
  }, [pagoInicial, isOpen]);

  useEffect(() => {
    if (!esEdicion && reservaSeleccionada) {
      setForm((prev) => ({ ...prev, monto: reservaSeleccionada.total }));
    }
  }, [reservaSeleccionada, esEdicion]);

  function actualizar<K extends keyof PagoFormData>(
    campo: K,
    valor: PagoFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.reservaId) e.reservaId = t("errores.reservaRequerida");
    if (!form.monto || form.monto <= 0) e.monto = t("errores.montoInvalido");
    if (!form.fecha) e.fecha = t("errores.fechaRequerida");
    if (!form.metodoPago) e.metodoPago = t("errores.metodoPagoRequerido");
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

    if (esEdicion && pagoInicial) {
      resultado = onEdit(pagoInicial.id, form);
    } else {
      resultado = onSubmit(form);
    }

    setSubmitting(false);

    if (!resultado.ok) {
      if (resultado.error === "reservaRequerida") {
        setErrors({ reservaId: t("errores.reservaRequerida") });
      } else if (resultado.error === "montoInvalido") {
        setErrors({ monto: t("errores.montoInvalido") });
      } else if (resultado.error === "fechaRequerida") {
        setErrors({ fecha: t("errores.fechaRequerida") });
      } else if (resultado.error === "noEditable") {
        setErrors({ general: t("errores.noEditable") });
      }
      return;
    }

    onClose();
  }

  const inputClass =
    "w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 bg-white focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:bg-brown-50 disabled:text-brown-400";

  // Filtrar reservas activas (confirmadas o en curso)
  const reservasDisponibles = reservas.filter(
    (r) =>
      r.estado === "confirmada" ||
      r.estado === "en_curso" ||
      r.estado === "pendiente",
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? t("editarTitulo") : t("crearTitulo")}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label={esEdicion ? t("editarTitulo") : t("crearTitulo")}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Reserva */}
          <div className="sm:col-span-2">
            <FormField
              label={t("campos.reserva")}
              required
              error={errors.reservaId}
            >
              {(id, aria) => (
                <select
                  id={id}
                  value={form.reservaId}
                  onChange={(e) => actualizar("reservaId", e.target.value)}
                  className={inputClass}
                  disabled={esEdicion}
                  {...aria}
                >
                  <option value="">{t("selectReservation")}</option>
                  {reservasDisponibles.map((r) => {
                    const cliente = clientes.find((c) => c.id === r.clienteId);
                    const nombreCliente = cliente
                      ? `${cliente.nombre} ${cliente.apellido}`
                      : `ID: ${r.clienteId}`;
                    return (
                      <option key={r.id} value={r.id}>
                        #{r.id.slice(-5).toUpperCase()} — {nombreCliente} —{" "}
                        {tCommon("roomAbbrev")} {r.habitacionNumero} —{" "}
                        {formatCOP(r.total)}
                      </option>
                    );
                  })}
                </select>
              )}
            </FormField>
          </div>

          {/* Información de la reserva seleccionada */}
          {reservaSeleccionada && clienteSeleccionado && (
            <div className="sm:col-span-2 rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600 space-y-1">
              <div>
                <span className="font-medium">{tCommon("client")}:</span>{" "}
                {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
              </div>
              <div>
                <span className="font-medium">{tCommon("room")}:</span>{" "}
                {reservaSeleccionada.habitacionNumero} (
                {reservaSeleccionada.tipoHabitacion})
              </div>
              <div>
                <span className="font-medium">{t("totalReservation")}:</span>{" "}
                {formatCOP(reservaSeleccionada.total)}
              </div>
            </div>
          )}

          {/* Monto */}
          <FormField label={t("campos.monto")} required error={errors.monto}>
            {(id, aria) => (
              <input
                id={id}
                type="number"
                min={0}
                step={1000}
                value={form.monto}
                onChange={(e) => actualizar("monto", Number(e.target.value))}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Fecha */}
          <FormField label={t("campos.fecha")} required error={errors.fecha}>
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fecha}
                onChange={(e) => actualizar("fecha", e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Método de pago */}
          <FormField
            label={t("campos.metodoPago")}
            required
            error={errors.metodoPago}
          >
            {(id, aria) => (
              <select
                id={id}
                value={form.metodoPago}
                onChange={(e) =>
                  actualizar("metodoPago", e.target.value as MetodoPago)
                }
                className={inputClass}
                {...aria}
              >
                {METODOS_PAGO.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {t(`metodosPago.${metodo}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Referencia */}
          <FormField label={t("campos.referencia")} error={errors.referencia}>
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.referencia ?? ""}
                onChange={(e) => actualizar("referencia", e.target.value)}
                placeholder={t("placeholders.referencia")}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Observaciones */}
          <div className="sm:col-span-2">
            <FormField
              label={t("campos.observaciones")}
              error={errors.observaciones}
            >
              {(id, aria) => (
                <textarea
                  id={id}
                  value={form.observaciones ?? ""}
                  onChange={(e) => actualizar("observaciones", e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  {...aria}
                />
              )}
            </FormField>
          </div>
        </div>

        {/* Error general */}
        {errors.general && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {errors.general}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-5 flex justify-end gap-3 border-t border-brown-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gold-600 px-4 py-2 text-sm font-medium text-white hover:bg-gold-700 transition-colors disabled:opacity-50"
          >
            {submitting ? tCommon("loading") : tCommon("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
