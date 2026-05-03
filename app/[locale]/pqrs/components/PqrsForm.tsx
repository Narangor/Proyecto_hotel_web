"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import type {
  Pqrs,
  PqrsFormData,
  TipoPqrs,
  PrioridadPqrs,
  EstadoPqrs,
  Cliente,
  Reserva,
} from "@/types";

interface PqrsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PqrsFormData) => { ok: boolean; error?: string };
  onEdit: (id: string, data: PqrsFormData) => { ok: boolean; error?: string };
  pqrsInicial?: Pqrs | null;
  clientes: Cliente[];
  reservas: Reserva[];
}

type FormErrors = Partial<Record<keyof PqrsFormData | "general", string>>;

const TIPOS: TipoPqrs[] = ["peticion", "queja", "reclamo", "sugerencia"];
const PRIORIDADES: PrioridadPqrs[] = ["baja", "media", "alta", "urgente"];
const ESTADOS: EstadoPqrs[] = [
  "pendiente",
  "en_proceso",
  "resuelto",
  "cerrado",
];

const FORM_VACIO: PqrsFormData = {
  tipo: "peticion",
  asunto: "",
  descripcion: "",
  clienteId: "",
  habitacionNumero: "",
  reservaId: "",
  prioridad: "media",
  estado: "pendiente",
  fechaCreacion: new Date().toISOString().split("T")[0],
  fechaLimite: "",
  asignadoA: "",
  respuesta: "",
};

/**
 * PqrsForm - formulario para crear y editar PQRS.
 *
 * Características:
 * - Selección de tipo (petición, queja, reclamo, sugerencia)
 * - Cliente opcional (puede ser anónimo)
 * - Habitación y reserva opcionales
 * - Prioridad y estado
 * - Asignación de empleado
 * - Respuesta opcional
 */
export function PqrsForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  pqrsInicial,
  clientes,
  reservas,
}: PqrsFormProps) {
  const t = useTranslations("pqrs");
  const tCommon = useTranslations("common");

  const esEdicion = Boolean(pqrsInicial);
  const [form, setForm] = useState<PqrsFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos al abrir en modo edición
  useEffect(() => {
    if (pqrsInicial) {
      setForm({
        tipo: pqrsInicial.tipo,
        asunto: pqrsInicial.asunto,
        descripcion: pqrsInicial.descripcion,
        clienteId: pqrsInicial.clienteId ?? "",
        habitacionNumero: pqrsInicial.habitacionNumero ?? "",
        reservaId: pqrsInicial.reservaId ?? "",
        prioridad: pqrsInicial.prioridad,
        estado: pqrsInicial.estado,
        fechaCreacion: pqrsInicial.fechaCreacion,
        fechaLimite: pqrsInicial.fechaLimite ?? "",
        asignadoA: pqrsInicial.asignadoA ?? "",
        respuesta: pqrsInicial.respuesta ?? "",
      });
    } else {
      setForm(FORM_VACIO);
    }
    setErrors({});
  }, [pqrsInicial, isOpen]);

  function actualizar<K extends keyof PqrsFormData>(
    campo: K,
    valor: PqrsFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.asunto.trim()) e.asunto = t("errores.asuntoRequerido");
    if (!form.descripcion.trim())
      e.descripcion = t("errores.descripcionRequerida");
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

    if (esEdicion && pqrsInicial) {
      resultado = onEdit(pqrsInicial.id, form);
    } else {
      resultado = onSubmit(form);
    }

    setSubmitting(false);

    if (!resultado.ok) {
      if (resultado.error === "datosIncompletos") {
        setErrors({ general: t("errores.datosIncompletos") });
      }
      return;
    }

    onClose();
  }

  const inputClass =
    "w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 bg-white focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:bg-brown-50 disabled:text-brown-400";

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
        {errors.general && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Tipo */}
          <FormField label={t("campos.tipo")} error={errors.tipo}>
            {(id, aria) => (
              <select
                id={id}
                value={form.tipo}
                onChange={(e) => actualizar("tipo", e.target.value as TipoPqrs)}
                className={inputClass}
                {...aria}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {t(`tipos.${tipo}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Prioridad */}
          <FormField label={t("campos.prioridad")} error={errors.prioridad}>
            {(id, aria) => (
              <select
                id={id}
                value={form.prioridad}
                onChange={(e) =>
                  actualizar("prioridad", e.target.value as PrioridadPqrs)
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

          {/* Asunto */}
          <div className="sm:col-span-2">
            <FormField
              label={t("campos.asunto")}
              error={errors.asunto}
              required
            >
              {(id, aria) => (
                <input
                  id={id}
                  type="text"
                  value={form.asunto}
                  onChange={(e) => actualizar("asunto", e.target.value)}
                  className={inputClass}
                  placeholder={t("placeholders.asunto")}
                  {...aria}
                />
              )}
            </FormField>
          </div>

          {/* Descripción */}
          <div className="sm:col-span-2">
            <FormField
              label={t("campos.descripcion")}
              error={errors.descripcion}
              required
            >
              {(id, aria) => (
                <textarea
                  id={id}
                  value={form.descripcion}
                  onChange={(e) => actualizar("descripcion", e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder={t("placeholders.descripcion")}
                  {...aria}
                />
              )}
            </FormField>
          </div>

          {/* Cliente */}
          <FormField label={t("campos.cliente")} error={errors.clienteId}>
            {(id, aria) => (
              <select
                id={id}
                value={form.clienteId}
                onChange={(e) => actualizar("clienteId", e.target.value)}
                className={inputClass}
                {...aria}
              >
                <option value="">{t("anonymous")}</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Habitación */}
          <FormField
            label={t("campos.habitacionNumero")}
            error={errors.habitacionNumero}
          >
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.habitacionNumero}
                onChange={(e) => actualizar("habitacionNumero", e.target.value)}
                className={inputClass}
                placeholder={t("placeholders.habitacion")}
                {...aria}
              />
            )}
          </FormField>

          {/* Reserva */}
          <FormField label={t("campos.reserva")} error={errors.reservaId}>
            {(id, aria) => (
              <select
                id={id}
                value={form.reservaId}
                onChange={(e) => actualizar("reservaId", e.target.value)}
                className={inputClass}
                {...aria}
              >
                <option value="">{t("noReservationAssociated")}</option>
                {reservas.map((reserva) => (
                  <option key={reserva.id} value={reserva.id}>
                    #{reserva.id.slice(-5).toUpperCase()} -{" "}
                    {tCommon("roomAbbrev")} {reserva.habitacionNumero}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Estado */}
          <FormField label={tCommon("status")} error={errors.estado}>
            {(id, aria) => (
              <select
                id={id}
                value={form.estado}
                onChange={(e) =>
                  actualizar("estado", e.target.value as EstadoPqrs)
                }
                className={inputClass}
                {...aria}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {t(`estados.${estado}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Fecha límite */}
          <FormField label={t("campos.fechaLimite")} error={errors.fechaLimite}>
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fechaLimite}
                onChange={(e) => actualizar("fechaLimite", e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Asignado a */}
          <FormField label={t("campos.asignadoA")} error={errors.asignadoA}>
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.asignadoA}
                onChange={(e) => actualizar("asignadoA", e.target.value)}
                className={inputClass}
                placeholder={t("placeholders.asignadoA")}
                {...aria}
              />
            )}
          </FormField>

          {/* Respuesta */}
          {esEdicion && (
            <div className="sm:col-span-2">
              <FormField label={t("campos.respuesta")} error={errors.respuesta}>
                {(id, aria) => (
                  <textarea
                    id={id}
                    value={form.respuesta}
                    onChange={(e) => actualizar("respuesta", e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder={t("placeholders.respuesta")}
                    {...aria}
                  />
                )}
              </FormField>
            </div>
          )}
        </div>

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
            {submitting
              ? tCommon("loading")
              : esEdicion
                ? tCommon("save")
                : t("crearTitulo")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
