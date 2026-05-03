"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import type { Pqrs, Cliente } from "@/types";

interface EliminarPqrsModalProps {
  pqrs: Pqrs | null;
  cliente: Cliente | undefined;
  onConfirmar: (id: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

/**
 * EliminarPqrsModal - confirmación de eliminación de PQRS
 *
 * Solo se pueden eliminar PQRS en estado pendiente
 */
export function EliminarPqrsModal({
  pqrs,
  cliente,
  onConfirmar,
  onCerrar,
}: EliminarPqrsModalProps) {
  const t = useTranslations("pqrs");
  const tCommon = useTranslations("common");

  if (!pqrs) return null;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : (pqrs.clienteId ?? "Anónimo");

  function handleConfirmar() {
    if (!pqrs) return;
    const resultado = onConfirmar(pqrs.id);
    if (resultado.ok) {
      onCerrar();
    }
  }

  return (
    <Modal
      isOpen={Boolean(pqrs)}
      onClose={onCerrar}
      title={t("eliminar.titulo")}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">{t("eliminar.mensaje")}</p>

        {/* Detalles del PQRS */}
        <div className="rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600 space-y-1">
          <div>
            <span className="font-medium">{tCommon("type")}:</span>{" "}
            {t(`tipos.${pqrs.tipo}`)}
          </div>
          <div>
            <span className="font-medium">{tCommon("subject")}:</span>{" "}
            {pqrs.asunto}
          </div>
          <div>
            <span className="font-medium">{tCommon("client")}:</span>{" "}
            {nombreCliente}
          </div>
          {pqrs.habitacionNumero && (
            <div>
              <span className="font-medium">{tCommon("room")}:</span>{" "}
              {pqrs.habitacionNumero}
            </div>
          )}
          <div>
            <span className="font-medium">{tCommon("creationDate")}:</span>{" "}
            {new Date(pqrs.fechaCreacion).toLocaleDateString("es-CO")}
          </div>
          <div>
            <span className="font-medium">{tCommon("priority")}:</span>{" "}
            {t(`prioridades.${pqrs.prioridad}`)}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className="rounded-xl bg-brown-700 px-4 py-2 text-sm font-medium text-white hover:bg-brown-800 transition-colors"
          >
            {tCommon("confirm")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
