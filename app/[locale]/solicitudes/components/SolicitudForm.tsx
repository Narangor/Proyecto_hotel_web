"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import type {
  Solicitud,
  SolicitudFormData,
  TipoSolicitud,
  PrioridadSolicitud,
  Reserva,
  Cliente,
} from "@/types";

interface SolicitudFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SolicitudFormData) => { ok: boolean; error?: string };
  onEdit: (
    id: string,
    data: SolicitudFormData,
  ) => { ok: boolean; error?: string };
  solicitudInicial?: Solicitud | null;
  reservas: Reserva[];
  clientes: Cliente[];
}

type FormErrors = Partial<Record<keyof SolicitudFormData | "general", string>>;

const TIPOS_SOLICITUD: TipoSolicitud[] = [
  "limpieza",
  "comida",
  "bebidas",
  "amenidades",
  "mantenimiento",
  "lavanderia",
  "transporte",
  "otro",
];

const PRIORIDADES: PrioridadSolicitud[] = ["baja", "media", "alta", "urgente"];

const FORM_VACIO: SolicitudFormData = {
  reservaId: "",
  tipo: "limpieza",
  descripcion: "",
  habitacionNumero: "",
  prioridad: "media",
  empleadoAsignado: "",
  notas: "",
  fechaSolicitud: new Date().toISOString(),
};

/**
 * SolicitudForm - formulario para crear y editar solicitudes de servicio.
 *
 * Características:
 * - Selección de reserva
 * - Tipo de solicitud
 * - Descripción requerida
 * - Nivel de prioridad
 * - Asignación de empleado
 * - Solo permite editar solicitudes en estado pendiente
 */
export function SolicitudForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  solicitudInicial,
  reservas,
  clientes,
}: SolicitudFormProps) {
  const t = useTranslations("solicitudes");
  const tCommon = useTranslations("common");

  const esEdicion = Boolean(solicitudInicial);
  const [form, setForm] = useState<SolicitudFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reserva seleccionada para mostrar detalles
  const reservaSeleccionada = reservas.find((r) => r.id === form.reservaId);
  const clienteSeleccionado = reservaSeleccionada
    ? clientes.find((c) => c.id === reservaSeleccionada.clienteId)
    : undefined;

  // Cargar datos al abrir en modo edición
  useEffect(() => {
    if (solicitudInicial) {
      setForm({
        reservaId: solicitudInicial.reservaId,
        tipo: solicitudInicial.tipo,
        descripcion: solicitudInicial.descripcion,
        habitacionNumero: solicitudInicial.habitacionNumero,
        prioridad: solicitudInicial.prioridad,
        empleadoAsignado: solicitudInicial.empleadoAsignado ?? "",
        notas: solicitudInicial.notas ?? "",
        fechaSolicitud: solicitudInicial.fechaSolicitud,
      });
    } else {
      setForm(FORM_VACIO);
    }
    setErrors({});
  }, [solicitudInicial, isOpen]);

  // Al seleccionar una reserva, pre-cargar habitación si no es edición
  useEffect(() => {
    if (!esEdicion && reservaSeleccionada && !form.habitacionNumero) {
      setForm((prev) => ({
        ...prev,
        habitacionNumero: reservaSeleccionada.habitacionNumero,
      }));
    }
  }, [reservaSeleccionada, esEdicion, form.habitacionNumero]);

  function actualizar<K extends keyof SolicitudFormData>(
    campo: K,
    valor: SolicitudFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.reservaId) e.reservaId = t("errores.reservaRequerida");
    if (!form.descripcion.trim())
      e.descripcion = t("errores.descripcionRequerida");
    if (!form.habitacionNumero.trim())
      e.habitacionNumero = t("errores.habitacionRequerida");
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

    if (esEdicion && solicitudInicial) {
      resultado = onEdit(solicitudInicial.id, form);
    } else {
      resultado = onSubmit(form);
    }

    setSubmitting(false);

    if (!resultado.ok) {
      if (resultado.error === "reservaRequerida") {
        setErrors({ reservaId: t("errores.reservaRequerida") });
      } else if (resultado.error === "descripcionRequerida") {
        setErrors({ descripcion: t("errores.descripcionRequerida") });
      } else if (resultado.error === "habitacionRequerida") {
        setErrors({ habitacionNumero: t("errores.habitacionRequerida") });
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
                        {tCommon("roomAbbrev")} {r.habitacionNumero}
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
                <span className="font-medium">{t("checkIn")}:</span>{" "}
                {new Date(reservaSeleccionada.fechaEntrada).toLocaleDateString(
                  "es-CO",
                )}
                {" — "}
                <span className="font-medium">{t("checkOut")}:</span>{" "}
                {new Date(reservaSeleccionada.fechaSalida).toLocaleDateString(
                  "es-CO",
                )}
              </div>
            </div>
          )}

          {/* Tipo de solicitud */}
          <FormField label={t("campos.tipo")} required error={errors.tipo}>
            {(id, aria) => (
              <select
                id={id}
                value={form.tipo}
                onChange={(e) =>
                  actualizar("tipo", e.target.value as TipoSolicitud)
                }
                className={inputClass}
                {...aria}
              >
                {TIPOS_SOLICITUD.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {t(`tipos.${tipo}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Prioridad */}
          <FormField
            label={t("campos.prioridad")}
            required
            error={errors.prioridad}
          >
            {(id, aria) => (
              <select
                id={id}
                value={form.prioridad}
                onChange={(e) =>
                  actualizar("prioridad", e.target.value as PrioridadSolicitud)
                }
                className={inputClass}
                {...aria}
              >
                {PRIORIDADES.map((prioridad) => (
                  <option key={prioridad} value={prioridad}>
                    {t(`prioridades.${prioridad}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Habitación */}
          <FormField
            label={t("campos.habitacion")}
            required
            error={errors.habitacionNumero}
          >
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.habitacionNumero}
                onChange={(e) => actualizar("habitacionNumero", e.target.value)}
                placeholder={t("placeholders.habitacion")}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Empleado asignado */}
          <FormField
            label={t("campos.empleadoAsignado")}
            error={errors.empleadoAsignado}
          >
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.empleadoAsignado ?? ""}
                onChange={(e) => actualizar("empleadoAsignado", e.target.value)}
                placeholder={t("placeholders.empleado")}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Descripción */}
          <div className="sm:col-span-2">
            <FormField
              label={t("campos.descripcion")}
              required
              error={errors.descripcion}
            >
              {(id, aria) => (
                <textarea
                  id={id}
                  value={form.descripcion}
                  onChange={(e) => actualizar("descripcion", e.target.value)}
                  rows={3}
                  placeholder={t("placeholders.descripcion")}
                  className={`${inputClass} resize-none`}
                  {...aria}
                />
              )}
            </FormField>
          </div>

          {/* Notas adicionales */}
          <div className="sm:col-span-2">
            <FormField label={t("campos.notas")} error={errors.notas}>
              {(id, aria) => (
                <textarea
                  id={id}
                  value={form.notas ?? ""}
                  onChange={(e) => actualizar("notas", e.target.value)}
                  rows={2}
                  placeholder={t("placeholders.notas")}
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
