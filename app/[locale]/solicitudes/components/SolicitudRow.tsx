"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { Solicitud, Reserva, Cliente, EstadoSolicitud } from "@/types";
import {
  SOLICITUD_ESTADOS_EDITABLES,
  SOLICITUD_ESTADOS_CANCELABLES,
} from "@/types";

interface SolicitudRowProps {
  solicitud: Solicitud;
  reserva: Reserva | undefined;
  cliente: Cliente | undefined;
  onEditar: (solicitud: Solicitud) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoSolicitud,
  ) => { ok: boolean; error?: string };
  onCancelar: (solicitud: Solicitud) => void;
}

// Formatea fecha ISO a DD/MM/AAAA HH:MM
function formatFechaHora(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Mapeo de prioridad a variantes de badge
const PRIORIDAD_VARIANTS: Record<string, BadgeVariant> = {
  baja: "pendiente",
  media: "en_proceso",
  alta: "completado",
  urgente: "rechazado",
};

export function SolicitudRow({
  solicitud,
  reserva,
  cliente,
  onEditar,
  onCambiarEstado,
  onCancelar,
}: SolicitudRowProps) {
  const t = useTranslations("solicitudes");
  const tCommon = useTranslations("common");

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : (reserva?.clienteId ?? "—");

  const puedeEditar = SOLICITUD_ESTADOS_EDITABLES.includes(solicitud.estado);
  const puedeCancelar = SOLICITUD_ESTADOS_CANCELABLES.includes(
    solicitud.estado,
  );
  const puedeIniciarProceso = solicitud.estado === "pendiente";
  const puedeCompletar = solicitud.estado === "en_proceso";

  const hayAccionesDisponibles =
    puedeEditar || puedeCancelar || puedeIniciarProceso || puedeCompletar;

  function handleCambiarEstado(nuevoEstado: EstadoSolicitud) {
    onCambiarEstado(solicitud.id, nuevoEstado);
  }

  return (
    <tr className="border-b border-brown-100 hover:bg-brown-50 transition-colors">
      {/* ID */}
      <td className="px-4 py-3 text-xs font-mono text-brown-400">
        #{solicitud.id.slice(-5).toUpperCase()}
      </td>

      {/* Tipo */}
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-brown-900">
          {t(`tipos.${solicitud.tipo}`)}
        </div>
        <div className="text-xs text-brown-400">
          {formatFechaHora(solicitud.fechaSolicitud)}
        </div>
      </td>

      {/* Habitación */}
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-brown-900">
          {solicitud.habitacionNumero}
        </div>
        {reserva && (
          <div className="text-xs text-brown-400">
            #{reserva.id.slice(-5).toUpperCase()}
          </div>
        )}
      </td>

      {/* Cliente */}
      <td className="px-4 py-3">
        <div className="font-medium text-brown-900">{nombreCliente}</div>
        {solicitud.empleadoAsignado && (
          <div className="text-xs text-brown-400">
            {tCommon("assigned")}: {solicitud.empleadoAsignado}
          </div>
        )}
      </td>

      {/* Descripción */}
      <td className="px-4 py-3">
        <div className="text-sm text-brown-700 max-w-xs truncate">
          {solicitud.descripcion}
        </div>
        {solicitud.notas && (
          <div className="text-xs text-brown-400 italic truncate">
            {solicitud.notas}
          </div>
        )}
      </td>

      {/* Prioridad */}
      <td className="px-4 py-3">
        <Badge
          variant={PRIORIDAD_VARIANTS[solicitud.prioridad]}
          label={t(`prioridades.${solicitud.prioridad}`)}
        />
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <Badge
          variant={solicitud.estado as EstadoSolicitud}
          label={t(`estados.${solicitud.estado}`)}
        />
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <DropdownMenu
            ariaLabel={`Acciones para solicitud de ${nombreCliente}`}
          >
            {!hayAccionesDisponibles ? (
              <div className="px-4 py-2 text-sm text-brown-400 italic">
                {tCommon("noActionsAvailable")}
              </div>
            ) : (
              <>
                {puedeEditar && (
                  <DropdownMenuItem onClick={() => onEditar(solicitud)}>
                    <span className="text-brown-700">{tCommon("edit")}</span>
                  </DropdownMenuItem>
                )}

                {puedeIniciarProceso && (
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstado("en_proceso")}
                  >
                    <span className="text-blue-700">{t("start")}</span>
                  </DropdownMenuItem>
                )}

                {puedeCompletar && (
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstado("completada")}
                  >
                    <span className="text-green-700">{t("complete")}</span>
                  </DropdownMenuItem>
                )}

                {puedeCancelar && (
                  <DropdownMenuItem onClick={() => onCancelar(solicitud)}>
                    <span className="text-brown-600">
                      {t("cancelar.titulo")}
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
