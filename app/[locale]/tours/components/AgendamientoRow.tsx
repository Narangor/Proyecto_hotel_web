"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { AgendamientoTour, Cliente, EstadoAgendamientoTour } from "@/types";
import {
  AGENDAMIENTO_ESTADOS_EDITABLES,
  AGENDAMIENTO_ESTADOS_CANCELABLES,
} from "@/types";
import type { AgendamientoConRelaciones } from "../hooks/useAgendamientosTour";

interface AgendamientoRowProps {
  fila: AgendamientoConRelaciones;
  onEditar: (a: AgendamientoTour) => void;
  onCancelar: (a: AgendamientoTour) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoAgendamientoTour,
  ) => { ok: boolean; error?: string };
}

const ESTADO_VARIANT: Record<string, BadgeVariant> = {
  pendiente: "pendiente",
  confirmado: "en_proceso",
  cancelado: "rechazado",
  realizado: "completado",
};

function formatFecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function AgendamientoRow({
  fila,
  onEditar,
  onCancelar,
  onCambiarEstado,
}: AgendamientoRowProps) {
  const { agendamiento, cliente, tour } = fila;
  const t = useTranslations("tours");
  const tCommon = useTranslations("common");

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : "—";

  const nombreTour = tour?.nombre ?? agendamiento.tourCatalogoId;

  const puedeEditar = AGENDAMIENTO_ESTADOS_EDITABLES.includes(
    agendamiento.estado,
  );
  const puedeCancelar = AGENDAMIENTO_ESTADOS_CANCELABLES.includes(
    agendamiento.estado,
  );
  const puedeMarcarRealizado = agendamiento.estado === "confirmado";

  const hayAccionesDisponibles =
    puedeEditar || puedeCancelar || puedeMarcarRealizado;

  return (
    <tr className="border-b border-brown-100 hover:bg-brown-50 transition-colors">
      <td className="px-4 py-3 text-xs font-mono text-brown-400">
        #{agendamiento.id.slice(-5).toUpperCase()}
      </td>
      <td className="px-4 py-3 max-w-xs">
        <div className="font-medium text-brown-900">{nombreTour}</div>
        {tour && (
          <div className="text-xs text-brown-400">{tour.descripcion}</div>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-brown-900">{nombreCliente}</td>
      <td className="px-4 py-3 text-sm text-brown-700">
        {formatFecha(agendamiento.fecha)} {agendamiento.horaSalida}
      </td>
      <td className="px-4 py-3 text-sm text-brown-700">
        {agendamiento.numeroParticipantes}
      </td>
      <td className="px-4 py-3 text-xs text-brown-600 max-w-[140px] truncate">
        {agendamiento.puntoEncuentro}
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={ESTADO_VARIANT[agendamiento.estado] ?? "pendiente"}
          label={t(`estados.${agendamiento.estado}`)}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <DropdownMenu
            ariaLabel={`${tCommon("actions")}: ${nombreTour}`}
          >
            {!hayAccionesDisponibles ? (
              <div className="px-4 py-2 text-sm text-brown-400 italic">
                {tCommon("noActionsAvailable")}
              </div>
            ) : (
              <>
                {puedeEditar && (
                  <DropdownMenuItem onClick={() => onEditar(agendamiento)}>
                    <span className="text-brown-700">{tCommon("edit")}</span>
                  </DropdownMenuItem>
                )}
                {puedeMarcarRealizado && (
                  <DropdownMenuItem
                    onClick={() => onCambiarEstado(agendamiento.id, "realizado")}
                  >
                    <span className="text-green-700">
                      {t("acciones.marcarRealizado")}
                    </span>
                  </DropdownMenuItem>
                )}
                {puedeCancelar && (
                  <DropdownMenuItem onClick={() => onCancelar(agendamiento)}>
                    <span className="text-brown-600">
                      {t("acciones.cancelar")}
                    </span>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
