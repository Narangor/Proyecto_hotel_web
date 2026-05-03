"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { btnFormPrimary, btnSecondary } from "@/components/ui/buttonClasses";
import type {
  AgendamientoTour,
  AgendamientoTourFormData,
  EstadoAgendamientoTour,
  Cliente,
  Reserva,
  TourCatalogo,
} from "@/types";
import { AGENDAMIENTO_ESTADOS_EDITABLES } from "@/types";

interface AgendamientoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgendamientoTourFormData) => { ok: boolean; error?: string };
  onEdit: (
    id: string,
    data: AgendamientoTourFormData,
  ) => { ok: boolean; error?: string };
  agendamientoInicial?: AgendamientoTour | null;
  catalogo: TourCatalogo[];
  clientes: Cliente[];
  reservas: Reserva[];
}

type FormErrors = Partial<
  Record<keyof AgendamientoTourFormData | "general", string>
>;

const ESTADOS: EstadoAgendamientoTour[] = [
  "pendiente",
  "confirmado",
  "cancelado",
  "realizado",
];

const FORM_VACIO: AgendamientoTourFormData = {
  tourCatalogoId: "",
  clienteId: "",
  reservaId: "",
  fecha: new Date().toISOString().split("T")[0],
  horaSalida: "09:00",
  numeroParticipantes: 1,
  estado: "pendiente",
  puntoEncuentro: "",
  guiaAsignado: "",
};

export function AgendamientoForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  agendamientoInicial,
  catalogo,
  clientes,
  reservas,
}: AgendamientoFormProps) {
  const t = useTranslations("tours");
  const tCommon = useTranslations("common");

  const esEdicion = Boolean(agendamientoInicial);
  const [form, setForm] = useState<AgendamientoTourFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (agendamientoInicial) {
      setForm({
        tourCatalogoId: agendamientoInicial.tourCatalogoId,
        clienteId: agendamientoInicial.clienteId,
        reservaId: agendamientoInicial.reservaId ?? "",
        fecha: agendamientoInicial.fecha,
        horaSalida: agendamientoInicial.horaSalida,
        numeroParticipantes: agendamientoInicial.numeroParticipantes,
        estado: agendamientoInicial.estado,
        puntoEncuentro: agendamientoInicial.puntoEncuentro,
        guiaAsignado: agendamientoInicial.guiaAsignado ?? "",
      });
    } else {
      setForm({
        ...FORM_VACIO,
        tourCatalogoId: catalogo[0]?.id ?? "",
      });
    }
    setErrors({});
  }, [agendamientoInicial, isOpen, catalogo]);

  function actualizar<K extends keyof AgendamientoTourFormData>(
    campo: K,
    valor: AgendamientoTourFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.tourCatalogoId) e.tourCatalogoId = t("errores.tourRequerido");
    if (!form.clienteId) e.clienteId = t("errores.clienteRequerido");
    if (!form.puntoEncuentro.trim()) {
      e.puntoEncuentro = t("errores.puntoRequerido");
    }
    if (form.numeroParticipantes < 1) {
      e.numeroParticipantes = t("errores.participantesInvalidos");
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

    const payload: AgendamientoTourFormData = {
      ...form,
      reservaId: form.reservaId || undefined,
      guiaAsignado: form.guiaAsignado?.trim() || undefined,
    };

    if (esEdicion && agendamientoInicial) {
      if (
        !AGENDAMIENTO_ESTADOS_EDITABLES.includes(agendamientoInicial.estado)
      ) {
        setSubmitting(false);
        return;
      }
      resultado = onEdit(agendamientoInicial.id, payload);
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

        <FormField label={t("campos.tour")} required error={errors.tourCatalogoId}>
          {(id, aria) => (
            <select
              id={id}
              value={form.tourCatalogoId}
              onChange={(e) => actualizar("tourCatalogoId", e.target.value)}
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            >
              <option value="">{t("placeholders.seleccioneTour")}</option>
              {catalogo.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.duracionHoras}h)
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label={t("campos.cliente")} required error={errors.clienteId}>
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
                  {c.nombre} {c.apellido}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label={t("campos.reserva")}>
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
          <FormField label={t("campos.fecha")} required>
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fecha}
                onChange={(e) => actualizar("fecha", e.target.value)}
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
          <FormField label={t("campos.horaSalida")} required>
            {(id, aria) => (
              <input
                id={id}
                type="time"
                value={form.horaSalida}
                onChange={(e) => actualizar("horaSalida", e.target.value)}
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
        </div>

        <FormField
          label={t("campos.numeroParticipantes")}
          required
          error={errors.numeroParticipantes}
        >
          {(id, aria) => (
            <input
              id={id}
              type="number"
              min={1}
              value={form.numeroParticipantes}
              onChange={(e) =>
                actualizar(
                  "numeroParticipantes",
                  Number.parseInt(e.target.value, 10) || 1,
                )
              }
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            />
          )}
        </FormField>

        <FormField
          label={t("campos.puntoEncuentro")}
          required
          error={errors.puntoEncuentro}
        >
          {(id, aria) => (
            <input
              id={id}
              type="text"
              value={form.puntoEncuentro}
              onChange={(e) => actualizar("puntoEncuentro", e.target.value)}
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            />
          )}
        </FormField>

        <FormField label={t("campos.guiaAsignado")}>
          {(id) => (
            <input
              id={id}
              type="text"
              value={form.guiaAsignado}
              onChange={(e) => actualizar("guiaAsignado", e.target.value)}
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
            />
          )}
        </FormField>

        {esEdicion && agendamientoInicial && (
          <FormField label={t("campos.estado")}>
            {(id) => (
              <select
                id={id}
                value={form.estado}
                onChange={(e) =>
                  actualizar("estado", e.target.value as EstadoAgendamientoTour)
                }
                disabled={
                  !AGENDAMIENTO_ESTADOS_EDITABLES.includes(
                    agendamientoInicial.estado,
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
