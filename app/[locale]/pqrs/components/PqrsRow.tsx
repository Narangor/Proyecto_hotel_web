"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { Pqrs, Reserva, Cliente, EstadoPqrs } from "@/types";
import { PQRS_ESTADOS_EDITABLES, PQRS_ESTADOS_ELIMINABLES } from "@/types";

interface PqrsRowProps {
  pqrs: Pqrs;
  cliente: Cliente | undefined;
  reserva?: Reserva | undefined;
  onEditar: (pqrs: Pqrs) => void;
  onEliminar: (pqrs: Pqrs) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoPqrs,
    respuesta?: string,
  ) => { ok: boolean; error?: string };
}

// Formatea fecha ISO a DD/MM/AAAA
function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

// Mapeo de prioridad a variantes de badge
const PRIORIDAD_VARIANTS: Record<string, BadgeVariant> = {
  baja: "pendiente",
  media: "en_proceso",
  alta: "completado",
  urgente: "rechazado",
};

export function PqrsRow({
  pqrs,
  cliente,
  onEditar,
  onEliminar,
  onCambiarEstado,
}: PqrsRowProps) {
  const t = useTranslations("pqrs");
  const tCommon = useTranslations("common");

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : (pqrs.clienteId ?? "Anónimo");

  const puedeEditar = PQRS_ESTADOS_EDITABLES.includes(pqrs.estado);
  const puedeEliminar = PQRS_ESTADOS_ELIMINABLES.includes(pqrs.estado);
  const puedeCambiarAEnProceso = pqrs.estado === "pendiente";
  const puedeCambiarAResuelto = pqrs.estado === "en_proceso";

  const hayAccionesDisponibles =
    puedeEditar ||
    puedeEliminar ||
    puedeCambiarAEnProceso ||
    puedeCambiarAResuelto;

  // Manejar cambio de estado rápido (sin respuesta)
  const handleCambioEstadoRapido = (nuevoEstado: EstadoPqrs) => {
    onCambiarEstado(pqrs.id, nuevoEstado);
  };

  return (
    <tr className="border-b border-brown-100 hover:bg-brown-50 transition-colors">
      {/* ID */}
      <td className="px-4 py-3 text-xs font-mono text-brown-400">
        #{pqrs.id.slice(-5).toUpperCase()}
      </td>

      {/* Tipo */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-brown-100 text-brown-700">
          {t(`tipos.${pqrs.tipo}`)}
        </span>
      </td>

      {/* Asunto */}
      <td className="px-4 py-3 max-w-xs">
        <div className="font-medium text-brown-900 truncate">{pqrs.asunto}</div>
        {pqrs.habitacionNumero && (
          <div className="text-xs text-brown-400">
            {tCommon("roomAbbrev")} {pqrs.habitacionNumero}
          </div>
        )}
      </td>

      {/* Cliente */}
      <td className="px-4 py-3">
        <div className="text-sm text-brown-900">{nombreCliente}</div>
        {pqrs.asignadoA && (
          <div className="text-xs text-brown-400">
            {tCommon("assigned")}: {pqrs.asignadoA}
          </div>
        )}
      </td>

      {/* Prioridad */}
      <td className="px-4 py-3">
        <Badge
          variant={PRIORIDAD_VARIANTS[pqrs.prioridad]}
          label={t(`prioridades.${pqrs.prioridad}`)}
        />
      </td>

      {/* Fecha de creación */}
      <td className="px-4 py-3 text-sm text-brown-700">
        {formatFecha(pqrs.fechaCreacion)}
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <Badge
          variant={pqrs.estado as BadgeVariant}
          label={t(`estados.${pqrs.estado}`)}
        />
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <DropdownMenu ariaLabel={`Acciones para ${pqrs.asunto}`}>
            {!hayAccionesDisponibles ? (
              <div className="px-4 py-2 text-sm text-brown-400 italic">
                {tCommon("noActionsAvailable")}
              </div>
            ) : (
              <>
                {puedeEditar && (
                  <DropdownMenuItem onClick={() => onEditar(pqrs)}>
                    <span className="text-brown-700">{tCommon("edit")}</span>
                  </DropdownMenuItem>
                )}

                {puedeCambiarAEnProceso && (
                  <DropdownMenuItem
                    onClick={() => handleCambioEstadoRapido("en_proceso")}
                  >
                    <span className="text-blue-700">{t("inProcess")}</span>
                  </DropdownMenuItem>
                )}

                {puedeCambiarAResuelto && (
                  <DropdownMenuItem
                    onClick={() => handleCambioEstadoRapido("resuelto")}
                  >
                    <span className="text-green-700">{t("resolve")}</span>
                  </DropdownMenuItem>
                )}

                {puedeEliminar && (
                  <DropdownMenuItem onClick={() => onEliminar(pqrs)}>
                    <span className="text-red-700">{tCommon("delete")}</span>
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
