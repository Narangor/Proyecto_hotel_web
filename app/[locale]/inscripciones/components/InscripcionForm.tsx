"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { btnFormPrimary, btnSecondary } from "@/components/ui/buttonClasses";
import type {
  Inscripcion,
  InscripcionFormData,
  CategoriaInscripcion,
  EstadoInscripcion,
  Cliente,
  Reserva,
} from "@/types";
import { INSCRIPCION_ESTADOS_EDITABLES } from "@/types";

interface InscripcionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InscripcionFormData) => { ok: boolean; error?: string };
  onEdit: (
    id: string,
    data: InscripcionFormData,
  ) => { ok: boolean; error?: string };
  inscripcionInicial?: Inscripcion | null;
  clientes: Cliente[];
  reservas: Reserva[];
}

type FormErrors = Partial<Record<keyof InscripcionFormData | "general", string>>;

const CATEGORIAS: CategoriaInscripcion[] = ["evento", "restaurante"];
const ESTADOS: EstadoInscripcion[] = [
  "pendiente",
  "confirmada",
  "cancelada",
  "completada",
];

const FORM_VACIO: InscripcionFormData = {
  categoria: "evento",
  nombreActividad: "",
  descripcion: "",
  clienteId: "",
  reservaId: "",
  fechaEvento: new Date().toISOString().split("T")[0],
  horaInicio: "10:00",
  numeroPersonas: 1,
  estado: "pendiente",
};

export function InscripcionForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  inscripcionInicial,
  clientes,
  reservas,
}: InscripcionFormProps) {
  const t = useTranslations("inscripciones");
  const tCommon = useTranslations("common");

  const esEdicion = Boolean(inscripcionInicial);
  const [form, setForm] = useState<InscripcionFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (inscripcionInicial) {
      setForm({
        categoria: inscripcionInicial.categoria,
        nombreActividad: inscripcionInicial.nombreActividad,
        descripcion: inscripcionInicial.descripcion,
        clienteId: inscripcionInicial.clienteId,
        reservaId: inscripcionInicial.reservaId ?? "",
        fechaEvento: inscripcionInicial.fechaEvento,
        horaInicio: inscripcionInicial.horaInicio,
        numeroPersonas: inscripcionInicial.numeroPersonas,
        estado: inscripcionInicial.estado,
      });
    } else {
      setForm(FORM_VACIO);
    }
    setErrors({});
  }, [inscripcionInicial, isOpen]);

  function actualizar<K extends keyof InscripcionFormData>(
    campo: K,
    valor: InscripcionFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.nombreActividad.trim()) {
      e.nombreActividad = t("errores.nombreRequerido");
    }
    if (!form.descripcion.trim()) {
      e.descripcion = t("errores.descripcionRequerida");
    }
    if (!form.clienteId) {
      e.clienteId = t("errores.clienteRequerido");
    }
    if (form.numeroPersonas < 1) {
      e.numeroPersonas = t("errores.personasInvalidas");
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

    const payload: InscripcionFormData = {
      ...form,
      reservaId: form.reservaId || undefined,
    };

    if (esEdicion && inscripcionInicial) {
      if (
        !INSCRIPCION_ESTADOS_EDITABLES.includes(inscripcionInicial.estado)
      ) {
        setSubmitting(false);
        return;
      }
      resultado = onEdit(inscripcionInicial.id, payload);
    } else {
      resultado = onSubmit({
        ...payload,
        estado: "pendiente",
      });
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

  const reservasCliente = reservas.filter(
    (r) => r.clienteId === form.clienteId,
  );

  const titulo = esEdicion ? t("editarTitulo") : t("crearTitulo");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.general && (
          <p className="text-sm text-red-600" role="alert">
            {errors.general}
          </p>
        )}

        <FormField
          label={t("campos.categoria")}
          required
          error={errors.categoria}
        >
          {(id) => (
            <select
              id={id}
              value={form.categoria}
              onChange={(e) =>
                actualizar("categoria", e.target.value as CategoriaInscripcion)
              }
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {t(`categorias.${c}`)}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          label={t("campos.nombreActividad")}
          required
          error={errors.nombreActividad}
        >
          {(id, aria) => (
            <input
              id={id}
              type="text"
              value={form.nombreActividad}
              onChange={(e) => actualizar("nombreActividad", e.target.value)}
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            />
          )}
        </FormField>

        <FormField
          label={t("campos.descripcion")}
          required
          error={errors.descripcion}
        >
          {(id, aria) => (
            <textarea
              id={id}
              rows={3}
              value={form.descripcion}
              onChange={(e) => actualizar("descripcion", e.target.value)}
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 resize-none"
              {...aria}
            />
          )}
        </FormField>

        <FormField
          label={t("campos.cliente")}
          required
          error={errors.clienteId}
        >
          {(id, aria) => (
            <select
              id={id}
              value={form.clienteId}
              onChange={(e) => {
                actualizar("clienteId", e.target.value);
                actualizar("reservaId", "");
              }}
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            >
              <option value="">{t("placeholders.seleccioneCliente")}</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellido} — {c.numeroDocumento}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label={t("campos.reserva")} error={errors.reservaId}>
          {(id) => (
            <select
              id={id}
              value={form.reservaId}
              onChange={(e) => actualizar("reservaId", e.target.value)}
              disabled={!form.clienteId}
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:opacity-50"
            >
              <option value="">{t("placeholders.reservaOpcional")}</option>
              {reservasCliente.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id.slice(-5).toUpperCase()} — Hab. {r.habitacionNumero}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label={t("campos.fechaEvento")}
            required
            error={errors.fechaEvento}
          >
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fechaEvento}
                onChange={(e) => actualizar("fechaEvento", e.target.value)}
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
          <FormField
            label={t("campos.horaInicio")}
            required
            error={errors.horaInicio}
          >
            {(id, aria) => (
              <input
                id={id}
                type="time"
                value={form.horaInicio}
                onChange={(e) => actualizar("horaInicio", e.target.value)}
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
        </div>

        <FormField
          label={t("campos.numeroPersonas")}
          required
          error={errors.numeroPersonas}
        >
          {(id, aria) => (
            <input
              id={id}
              type="number"
              min={1}
              value={form.numeroPersonas}
              onChange={(e) =>
                actualizar("numeroPersonas", Number.parseInt(e.target.value, 10) || 1)
              }
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            />
          )}
        </FormField>

        {esEdicion && inscripcionInicial && (
          <FormField label={t("campos.estado")}>
            {(id) => (
              <select
                id={id}
                value={form.estado}
                onChange={(e) =>
                  actualizar("estado", e.target.value as EstadoInscripcion)
                }
                disabled={
                  !INSCRIPCION_ESTADOS_EDITABLES.includes(
                    inscripcionInicial.estado,
                  )
                }
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:opacity-50"
              >
                {ESTADOS.map((s) => (
                  <option key={s} value={s}>
                    {t(`estados.${s}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondary}
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={btnFormPrimary}
          >
            {tCommon("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
