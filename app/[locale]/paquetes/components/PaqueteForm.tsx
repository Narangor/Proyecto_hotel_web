"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { btnFormPrimary, btnSecondary } from "@/components/ui/buttonClasses";
import type { PaquetePromocional, PaqueteFormData, EstadoPaquete } from "@/types";

interface PaqueteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaqueteFormData) => { ok: boolean; error?: string };
  onEdit: (
    id: string,
    data: PaqueteFormData,
  ) => { ok: boolean; error?: string };
  paqueteInicial?: PaquetePromocional | null;
}

type FormErrors = Partial<Record<keyof PaqueteFormData | "general", string>>;

const ESTADOS: EstadoPaquete[] = ["activo", "inactivo", "agotado"];

const FORM_VACIO: PaqueteFormData = {
  nombre: "",
  descripcion: "",
  precioLista: 0,
  precioPromocional: 0,
  fechaInicioVigencia: new Date().toISOString().split("T")[0],
  fechaFinVigencia: new Date().toISOString().split("T")[0],
  cuposTotales: 10,
  estado: "activo",
  incluye: "",
};

export function PaqueteForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  paqueteInicial,
}: PaqueteFormProps) {
  const t = useTranslations("paquetes");
  const tCommon = useTranslations("common");

  const esEdicion = Boolean(paqueteInicial);
  const [form, setForm] = useState<PaqueteFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (paqueteInicial) {
      setForm({
        nombre: paqueteInicial.nombre,
        descripcion: paqueteInicial.descripcion,
        precioLista: paqueteInicial.precioLista,
        precioPromocional: paqueteInicial.precioPromocional,
        fechaInicioVigencia: paqueteInicial.fechaInicioVigencia,
        fechaFinVigencia: paqueteInicial.fechaFinVigencia,
        cuposTotales: paqueteInicial.cuposTotales,
        estado: paqueteInicial.estado,
        incluye: paqueteInicial.incluye,
      });
    } else {
      setForm(FORM_VACIO);
    }
    setErrors({});
  }, [paqueteInicial, isOpen]);

  function actualizar<K extends keyof PaqueteFormData>(
    campo: K,
    valor: PaqueteFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = t("errores.nombreRequerido");
    if (!form.descripcion.trim()) e.descripcion = t("errores.descripcionRequerida");
    if (!form.incluye.trim()) e.incluye = t("errores.incluyeRequerido");
    if (form.precioLista < 1) e.precioLista = t("errores.precioInvalido");
    if (form.precioPromocional < 1) {
      e.precioPromocional = t("errores.precioInvalido");
    }
    if (form.precioPromocional > form.precioLista) {
      e.precioPromocional = t("errores.promoMayorLista");
    }
    if (form.cuposTotales < 1) e.cuposTotales = t("errores.cuposInvalidos");
    if (form.fechaFinVigencia < form.fechaInicioVigencia) {
      e.fechaFinVigencia = t("errores.fechasInvalidas");
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

    if (esEdicion && paqueteInicial) {
      resultado = onEdit(paqueteInicial.id, form);
    } else {
      resultado = onSubmit(form);
    }

    setSubmitting(false);

    if (!resultado.ok) {
      if (resultado.error === "datosIncompletos") {
        setErrors({ general: t("errores.datosIncompletos") });
      }
      if (resultado.error === "cuposInvalidos") {
        setErrors({ cuposTotales: t("errores.cuposMenosVendidos") });
      }
      return;
    }

    onClose();
  }

  const titulo = esEdicion ? t("editarTitulo") : t("crearTitulo");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.general && (
          <p className="text-sm text-red-600" role="alert">
            {errors.general}
          </p>
        )}

        <FormField label={t("campos.nombre")} required error={errors.nombre}>
          {(id, aria) => (
            <input
              id={id}
              type="text"
              value={form.nombre}
              onChange={(e) => actualizar("nombre", e.target.value)}
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
              className="w-full resize-none rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label={t("campos.precioLista")}
            required
            error={errors.precioLista}
          >
            {(id, aria) => (
              <input
                id={id}
                type="number"
                min={1}
                value={form.precioLista || ""}
                onChange={(e) =>
                  actualizar("precioLista", Number.parseInt(e.target.value, 10) || 0)
                }
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
          <FormField
            label={t("campos.precioPromocional")}
            required
            error={errors.precioPromocional}
          >
            {(id, aria) => (
              <input
                id={id}
                type="number"
                min={1}
                value={form.precioPromocional || ""}
                onChange={(e) =>
                  actualizar(
                    "precioPromocional",
                    Number.parseInt(e.target.value, 10) || 0,
                  )
                }
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label={t("campos.fechaInicioVigencia")}
            required
            error={errors.fechaInicioVigencia}
          >
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fechaInicioVigencia}
                onChange={(e) => actualizar("fechaInicioVigencia", e.target.value)}
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
          <FormField
            label={t("campos.fechaFinVigencia")}
            required
            error={errors.fechaFinVigencia}
          >
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fechaFinVigencia}
                onChange={(e) => actualizar("fechaFinVigencia", e.target.value)}
                className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                {...aria}
              />
            )}
          </FormField>
        </div>

        <FormField
          label={t("campos.cuposTotales")}
          required
          error={errors.cuposTotales}
        >
          {(id, aria) => (
            <input
              id={id}
              type="number"
              min={1}
              value={form.cuposTotales || ""}
              onChange={(e) =>
                actualizar(
                  "cuposTotales",
                  Number.parseInt(e.target.value, 10) || 0,
                )
              }
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            />
          )}
        </FormField>

        {esEdicion && paqueteInicial && (
          <p className="text-sm text-brown-600">
            {t("campos.cuposVendidos")}: {paqueteInicial.cuposVendidos}
          </p>
        )}

        <FormField label={t("campos.estado")}>
          {(id) => (
            <select
              id={id}
              value={form.estado}
              onChange={(e) =>
                actualizar("estado", e.target.value as EstadoPaquete)
              }
              className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {t(`estados.${s}`)}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label={t("campos.incluye")} required error={errors.incluye}>
          {(id, aria) => (
            <textarea
              id={id}
              rows={2}
              value={form.incluye}
              onChange={(e) => actualizar("incluye", e.target.value)}
              className="w-full resize-none rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
              {...aria}
            />
          )}
        </FormField>

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
