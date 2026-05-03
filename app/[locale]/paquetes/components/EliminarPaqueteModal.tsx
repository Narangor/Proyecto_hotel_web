"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { btnDanger, btnSecondary } from "@/components/ui/buttonClasses";
import type { PaquetePromocional } from "@/types";

interface EliminarPaqueteModalProps {
  paquete: PaquetePromocional | null;
  onConfirmar: (id: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

export function EliminarPaqueteModal({
  paquete,
  onConfirmar,
  onCerrar,
}: EliminarPaqueteModalProps) {
  const t = useTranslations("paquetes");
  const tCommon = useTranslations("common");

  if (!paquete) return null;

  function handleConfirmar() {
    if (!paquete) return;
    const resultado = onConfirmar(paquete.id);
    if (resultado.ok) {
      onCerrar();
    }
  }

  return (
    <Modal
      isOpen={Boolean(paquete)}
      onClose={onCerrar}
      title={t("eliminar.titulo")}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">{t("eliminar.mensaje")}</p>
        <div className="rounded-lg bg-brown-50 px-4 py-3 text-sm text-brown-800">
          {paquete.nombre}
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
