"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import type { Pago, Reserva, Cliente } from "@/types";

interface AnularPagoModalProps {
  pago: Pago | null;
  reserva: Reserva | undefined;
  cliente: Cliente | undefined;
  onConfirmar: (id: string, motivo?: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

// Formatea un precio COP sin decimales con separador de miles
function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

/**
 * AnularPagoModal - confirmación de anulación de pago con motivo opcional
 *
 * El pago pasa a estado anulado pero no se elimina del sistema
 */
export function AnularPagoModal({
  pago,
  reserva,
  cliente,
  onConfirmar,
  onCerrar,
}: AnularPagoModalProps) {
  const t = useTranslations("pagos");
  const tCommon = useTranslations("common");
  const [motivo, setMotivo] = useState("");
  const [errorAnulacion, setErrorAnulacion] = useState<string | null>(null);

  if (!pago) return null;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : (reserva?.clienteId ?? "—");

  const reservaId = reserva ? `#${reserva.id.slice(-5).toUpperCase()}` : "—";

  function handleConfirmar() {
    if (!pago) return;
    const resultado = onConfirmar(pago.id, motivo || undefined);
    if (resultado.ok) {
      setMotivo("");
      setErrorAnulacion(null);
      onCerrar();
    } else {
      setErrorAnulacion(t(`errores.${resultado.error ?? "errorAnulacion"}`));
    }
  }

  function handleCerrar() {
    setMotivo("");
    setErrorAnulacion(null);
    onCerrar();
  }

  return (
    <Modal
      isOpen={Boolean(pago)}
      onClose={handleCerrar}
      title={t("anular.titulo")}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">
          {t("anular.mensaje", {
            monto: formatCOP(pago.monto),
            reserva: reservaId,
          })}
        </p>

        {/* Detalles del pago */}
        <div className="rounded-lg bg-brown-50 px-4 py-3 text-xs text-brown-600 space-y-1">
          <div>
            <span className="font-medium">{tCommon("client")}:</span>{" "}
            {nombreCliente}
          </div>
          <div>
            <span className="font-medium">{tCommon("reservation")}:</span>{" "}
            {reservaId}
            {reserva &&
              ` — ${tCommon("roomAbbrev")} ${reserva.habitacionNumero}`}
          </div>
          <div>
            <span className="font-medium">{tCommon("paymentDate")}:</span>{" "}
            {new Date(pago.fecha).toLocaleDateString("es-CO")}
          </div>
          <div>
            <span className="font-medium">{tCommon("method")}:</span>{" "}
            {pago.metodoPago}
          </div>
          {pago.referencia && (
            <div>
              <span className="font-medium">{tCommon("reference")}:</span>{" "}
              {pago.referencia}
            </div>
          )}
        </div>

        {/* Motivo opcional */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="motivo-anulacion"
            className="text-sm font-medium text-brown-800"
          >
            {t("anular.motivo")}
          </label>
          <textarea
            id="motivo-anulacion"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder={t("placeholders.motivoAnulacion")}
            className="w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 bg-white placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 resize-none"
          />
        </div>

        {errorAnulacion && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {errorAnulacion}
          </div>
        )}

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
            aria-label={`Confirmar anulación de pago de ${nombreCliente}`}
            className="rounded-xl bg-brown-700 px-4 py-2 text-sm font-medium text-white hover:bg-brown-800 transition-colors"
          >
            {tCommon("confirm")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
