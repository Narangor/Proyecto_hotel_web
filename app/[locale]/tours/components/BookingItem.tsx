"use client";

import { useTranslations } from "next-intl";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  CheckCircle2,
} from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type {
  AgendamientoTour,
  EstadoAgendamientoTour,
  Cliente,
} from "@/types";
import {
  AGENDAMIENTO_ESTADOS_EDITABLES,
  AGENDAMIENTO_ESTADOS_CANCELABLES,
} from "@/types";

interface BookingItemProps {
  agendamiento: AgendamientoTour;
  cliente: Cliente | undefined;
  onEditar: (a: AgendamientoTour) => void;
  onCancelar: (a: AgendamientoTour) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoAgendamientoTour,
  ) => { ok: boolean; error?: string };
}

const ESTADO_VARIANTS: Record<EstadoAgendamientoTour, BadgeVariant> = {
  pendiente: "pendiente",
  confirmado: "confirmada",
  cancelado: "cancelada",
  realizado: "completada",
};

function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function BookingItem({
  agendamiento,
  cliente,
  onEditar,
  onCancelar,
  onCambiarEstado,
}: BookingItemProps) {
  const t = useTranslations("tours");
  const tCommon = useTranslations("common");

  const puedeEditar = AGENDAMIENTO_ESTADOS_EDITABLES.includes(
    agendamiento.estado,
  );
  const puedeCancelar = AGENDAMIENTO_ESTADOS_CANCELABLES.includes(
    agendamiento.estado,
  );
  const puedeConfirmar = agendamiento.estado === "pendiente";
  const puedeRealizar = agendamiento.estado === "confirmado";

  const hayAcciones =
    puedeEditar || puedeCancelar || puedeConfirmar || puedeRealizar;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : agendamiento.clienteId;

  const handleCambiarEstado = (estado: EstadoAgendamientoTour) => {
    onCambiarEstado(agendamiento.id, estado);
  };

  return (
    <div className="group flex items-start gap-4 p-4 bg-white border border-brown-100 rounded-lg hover:bg-brown-50/50 transition-colors">
      <div className="shrink-0 pt-0.5">
        <Badge
          variant={ESTADO_VARIANTS[agendamiento.estado]}
          label={t(`estados.${agendamiento.estado}`)}
        />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <User
            className="h-4 w-4 text-brown-500 shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-brown-900 truncate">
            {nombreCliente}
          </span>
          <span className="text-xs text-brown-400 font-mono">
            #{agendamiento.id.slice(-5).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brown-600">
          <div className="flex items-center gap-1.5">
            <Calendar
              className="h-3.5 w-3.5 text-brown-500"
              aria-hidden="true"
            />
            <span>{formatFecha(agendamiento.fecha)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brown-500" aria-hidden="true" />
            <span>{agendamiento.horaSalida}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-brown-500" aria-hidden="true" />
            <span>
              {agendamiento.numeroParticipantes}{" "}
              {agendamiento.numeroParticipantes === 1
                ? t("participanteUno")
                : t("participanteVarios")}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-brown-600">
          <MapPin
            className="h-3.5 w-3.5 text-brown-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span className="line-clamp-1">{agendamiento.puntoEncuentro}</span>
        </div>

        {agendamiento.guiaAsignado && (
          <div className="text-xs">
            <span className="text-brown-500 bg-brown-50 px-2 py-0.5 rounded">
              {agendamiento.guiaAsignado}
            </span>
          </div>
        )}
      </div>

      {hayAcciones && (
        <div className="shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <DropdownMenu ariaLabel={`${tCommon("actions")} - ${nombreCliente}`}>
            {puedeConfirmar && (
              <DropdownMenuItem
                onClick={() => handleCambiarEstado("confirmado")}
              >
                <span className="flex items-center gap-2 text-brown-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("acciones.marcarConfirmado")}
                </span>
              </DropdownMenuItem>
            )}
            {puedeRealizar && (
              <DropdownMenuItem
                onClick={() => handleCambiarEstado("realizado")}
              >
                <span className="flex items-center gap-2 text-brown-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("acciones.marcarRealizado")}
                </span>
              </DropdownMenuItem>
            )}
            {puedeEditar && (
              <DropdownMenuItem onClick={() => onEditar(agendamiento)}>
                <span className="text-brown-700">{tCommon("edit")}</span>
              </DropdownMenuItem>
            )}
            {puedeCancelar && (
              <DropdownMenuItem onClick={() => onCancelar(agendamiento)}>
                <span className="text-brown-700">{t("acciones.cancelar")}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
