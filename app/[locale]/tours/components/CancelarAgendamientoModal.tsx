"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { btnNeutral, btnSecondary } from "@/components/ui/buttonClasses";
import type { AgendamientoTour, Cliente, Reserva, TourCatalogo } from "@/types";

interface CancelarAgendamientoModalProps {
  agendamiento: AgendamientoTour | null;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
  tour: TourCatalogo | undefined;
  onConfirmar: (id: string, motivo?: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

export function CancelarAgendamientoModal({
  agendamiento,
  cliente,
  reserva,
  tour,
  onConfirmar,
  onCerrar,
}: CancelarAgendamientoModalProps) {
  const t = useTranslations("tours");
  const tCommon = useTranslations("common");
  const [motivo, setMotivo] = useState("");

  if (!agendamiento) return null;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : "—";

  const nombreTour = tour?.nombre ?? agendamiento.tourCatalogoId;

  function handleConfirmar() {
    if (!agendamiento) return;
    const resultado = onConfirmar(agendamiento.id, motivo || undefined);
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
      isOpen={Boolean(agendamiento)}
      onClose={handleCerrar}
      title={t("cancelar.titulo")}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">
          {t("cancelar.mensaje", { tour: nombreTour })}
        </p>
        <div className="space-y-1 rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600">
          <div>
            <span className="font-medium">Cliente:</span> {nombreCliente}
          </div>
          {reserva && (
            <div>
              <span className="font-medium">Reserva:</span> #
              {reserva.id.slice(-5).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="motivo-tour" className="text-sm font-medium text-brown-800">
            {t("cancelar.motivo")}
          </label>
          <textarea
            id="motivo-tour"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleCerrar}
            className={btnSecondary}
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className={btnNeutral}
          >
            {tCommon("confirm")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
