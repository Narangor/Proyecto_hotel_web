"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import {
  Calendar,
  User,
  AlertCircle,
  Clock,
  FileText,
  Frown,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import type { Pqrs, Cliente, EstadoPqrs } from "@/types";
import { PQRS_ESTADOS_EDITABLES, PQRS_ESTADOS_ELIMINABLES } from "@/types";

interface PqrsCardProps {
  pqrs: Pqrs;
  cliente: Cliente | undefined;
  onEditar: (pqrs: Pqrs) => void;
  onEliminar: (pqrs: Pqrs) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoPqrs,
    respuesta?: string,
  ) => { ok: boolean; error?: string };
  onDragStart?: (pqrs: Pqrs) => void;
  onDragEnd?: () => void;
}

// Mapeo de prioridad a variantes de badge
const PRIORIDAD_VARIANTS: Record<string, BadgeVariant> = {
  baja: "pendiente",
  media: "en_proceso",
  alta: "completado",
  urgente: "rechazado",
};

// Mapeo de prioridad a colores
const PRIORIDAD_BORDER_COLORS: Record<string, string> = {
  baja: "border-l-brown-300",
  media: "border-l-brown-500",
  alta: "border-l-gold-500",
  urgente: "border-l-brown-900",
};

// Iconos para tipos de PQRS
const TIPO_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  peticion: FileText,
  queja: Frown,
  reclamo: AlertTriangle,
  sugerencia: Lightbulb,
};

// Formatea fecha ISO a DD/MM/AAAA
function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function PqrsCard({
  pqrs,
  cliente,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onDragStart,
  onDragEnd,
}: PqrsCardProps) {
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

  //Manejar cambio de estado rápido
  const handleCambioEstadoRapido = (nuevoEstado: EstadoPqrs) => {
    onCambiarEstado(pqrs.id, nuevoEstado);
  };

  return (
    <div
      data-testid={`pqrs-card-${pqrs.id}`}
      draggable
      onDragStart={() => onDragStart?.(pqrs)}
      onDragEnd={onDragEnd}
      className={`group bg-white rounded-lg border-l-4 ${PRIORIDAD_BORDER_COLORS[pqrs.prioridad]} shadow-sm hover:shadow-md transition-all duration-200 cursor-move`}
    >
      <div className="p-4 pb-3 border-b border-brown-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {(() => {
              const IconComponent = TIPO_ICONS[pqrs.tipo];
              return (
                <IconComponent
                  className="h-5 w-5 shrink-0 text-brown-600"
                  aria-hidden="true"
                />
              );
            })()}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-brown-900 truncate text-sm">
                {pqrs.asunto}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-brown-400">
                  #{pqrs.id.slice(-5).toUpperCase()}
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-brown-50 text-brown-600">
                  {t(`tipos.${pqrs.tipo}`)}
                </span>
              </div>
            </div>
          </div>

          {hayAccionesDisponibles && (
            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <DropdownMenu
                ariaLabel={`${tCommon("actions")} - ${pqrs.asunto}`}
              >
                {puedeCambiarAEnProceso && (
                  <DropdownMenuItem
                    onClick={() => handleCambioEstadoRapido("en_proceso")}
                  >
                    <span className="text-brown-700">
                      {t("acciones.marcarEnProceso")}
                    </span>
                  </DropdownMenuItem>
                )}
                {puedeCambiarAResuelto && (
                  <DropdownMenuItem
                    onClick={() => handleCambioEstadoRapido("resuelto")}
                  >
                    <span className="text-brown-700">
                      {t("acciones.marcarResuelto")}
                    </span>
                  </DropdownMenuItem>
                )}
                {puedeEditar && (
                  <DropdownMenuItem onClick={() => onEditar(pqrs)}>
                    <span className="text-brown-700">{tCommon("edit")}</span>
                  </DropdownMenuItem>
                )}
                {puedeEliminar && (
                  <DropdownMenuItem onClick={() => onEliminar(pqrs)}>
                    <span className="text-red-700">{tCommon("delete")}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Prioridad */}
        <div className="flex items-center justify-between">
          <Badge
            variant={PRIORIDAD_VARIANTS[pqrs.prioridad]}
            label={t(`prioridades.${pqrs.prioridad}`)}
          />
          {pqrs.fechaLimite && (
            <div className="flex items-center gap-1 text-xs text-brown-500">
              <Clock className="h-3 w-3" />
              <span>{formatFecha(pqrs.fechaLimite)}</span>
            </div>
          )}
        </div>

        {/* Cliente */}
        <div className="flex items-start gap-2 text-sm">
          <User className="h-4 w-4 text-brown-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-brown-900 truncate">{nombreCliente}</div>
            {pqrs.habitacionNumero && (
              <div className="text-xs text-brown-500">
                {tCommon("roomAbbrev")} {pqrs.habitacionNumero}
              </div>
            )}
          </div>
        </div>

        {/* Asignado a */}
        {pqrs.asignadoA && (
          <div className="flex items-center gap-2 text-xs text-brown-500 bg-brown-50 rounded-md px-2 py-1.5">
            <AlertCircle className="h-3 w-3" />
            <span>
              {tCommon("assigned")}:{" "}
              <span className="font-medium text-brown-700">
                {pqrs.asignadoA}
              </span>
            </span>
          </div>
        )}

        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-xs text-brown-400 pt-1 border-t border-brown-50">
          <Calendar className="h-3 w-3" />
          <span>{formatFecha(pqrs.fechaCreacion)}</span>
        </div>

        {/* Respuesta (si existe) */}
        {pqrs.respuesta && (
          <div className="bg-gold-50 border border-gold-200 rounded-md p-2 mt-2">
            <div className="text-xs font-medium text-gold-900 mb-1">
              {t("campos.respuesta")}:
            </div>
            <div className="text-xs text-gold-800 line-clamp-2">
              {pqrs.respuesta}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
