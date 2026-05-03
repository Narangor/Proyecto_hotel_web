"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import type { Solicitud, Reserva, Cliente } from "@/types";

interface CancelarSolicitudModalProps {
  solicitud: Solicitud | null;
  reserva: Reserva | undefined;
  cliente: Cliente | undefined;
  onConfirmar: (id: string, motivo?: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

/**
 * CancelarSolicitudModal - confirmación de cancelación de solicitud con motivo opcional
 *
 * Solicitud pasa a estado cancelada pero no se elimina del sistema
 */
export function CancelarSolicitudModal({
  solicitud,
  reserva,
  cliente,
  onConfirmar,
  onCerrar,
}: CancelarSolicitudModalProps) {
  const t = useTranslations("solicitudes");
  const tCommon = useTranslations("common");
  const [motivo, setMotivo] = useState("");

  if (!solicitud) return null;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : (reserva?.clienteId ?? "—");

  const reservaId = reserva ? `#${reserva.id.slice(-5).toUpperCase()}` : "—";

  function handleConfirmar() {
    if (!solicitud) return;
    const resultado = onConfirmar(solicitud.id, motivo || undefined);
    if (resultado.ok) {
      setMotivo("");
      onCerrar();
    }
  }

  function handleCerrar() {
    setMotivo("");
    onCerrar();
  }

  return (
    <Modal
      isOpen={Boolean(solicitud)}
      onClose={handleCerrar}
      title={t("cancelar.titulo")}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">
          {t("cancelar.mensaje", {
            tipo: t(`tipos.${solicitud.tipo}`),
            habitacion: solicitud.habitacionNumero,
          })}
        </p>

        {/* Detalles de la solicitud */}
        <div className="rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600 space-y-1">
          <div>
            <span className="font-medium">{tCommon("client")}:</span>{" "}
            {nombreCliente}
          </div>
          <div>
            <span className="font-medium">{tCommon("reservation")}:</span>{" "}
            {reservaId}
          </div>
          <div>
            <span className="font-medium">{tCommon("room")}:</span>{" "}
            {solicitud.habitacionNumero}
          </div>
          <div>
            <span className="font-medium">{tCommon("type")}:</span>{" "}
            {t(`tipos.${solicitud.tipo}`)}
          </div>
          <div>
            <span className="font-medium">{tCommon("description")}:</span>{" "}
            {solicitud.descripcion}
          </div>
          {solicitud.empleadoAsignado && (
            <div>
              <span className="font-medium">{tCommon("assigned")} a:</span>{" "}
              {solicitud.empleadoAsignado}
            </div>
          )}
        </div>

        {/* Motivo opcional */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="motivo-cancelacion"
            className="text-sm font-medium text-brown-800"
          >
            {t("cancelar.motivo")}
          </label>
          <textarea
            id="motivo-cancelacion"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder={t("placeholders.motivoCancelacion")}
            className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 bg-white placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleCerrar}
            className="rounded-xl border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            aria-label={`Confirmar cancelación de solicitud de ${nombreCliente}`}
            className="rounded-xl bg-brown-700 px-4 py-2 text-sm font-medium text-white hover:bg-brown-800 transition-colors"
          >
            {tCommon("confirm")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
