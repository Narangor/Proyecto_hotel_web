"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { btnDanger, btnSecondary } from "@/components/ui/buttonClasses";
import type { Inscripcion, Cliente } from "@/types";

interface EliminarInscripcionModalProps {
  inscripcion: Inscripcion | null;
  cliente: Cliente | undefined;
  onConfirmar: (id: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

export function EliminarInscripcionModal({
  inscripcion,
  cliente,
  onConfirmar,
  onCerrar,
}: EliminarInscripcionModalProps) {
  const t = useTranslations("inscripciones");
  const tCommon = useTranslations("common");

  if (!inscripcion) return null;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : "—";

  function handleConfirmar() {
    if (!inscripcion) return;
    const resultado = onConfirmar(inscripcion.id);
    if (resultado.ok) {
      onCerrar();
    }
  }

  return (
    <Modal
      isOpen={Boolean(inscripcion)}
      onClose={onCerrar}
      title={t("eliminar.titulo")}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">{t("eliminar.mensaje")}</p>
        <div className="space-y-1 rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600">
          <div>
            <span className="font-medium">{t("campos.nombreActividad")}:</span>{" "}
            {inscripcion.nombreActividad}
          </div>
          <div>
            <span className="font-medium">{t("campos.cliente")}:</span>{" "}
            {nombreCliente}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            className={btnSecondary}
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className={btnDanger}
          >
            {tCommon("confirm")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
