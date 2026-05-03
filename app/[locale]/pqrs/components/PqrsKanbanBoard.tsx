"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, RefreshCw, CheckCircle2, Lock } from "lucide-react";
import { PqrsCard } from "./PqrsCard";
import type { Pqrs, EstadoPqrs } from "@/types";
import type { PqrsConRelaciones } from "../hooks/usePqrs";

const ESTADOS: EstadoPqrs[] = [
  "pendiente",
  "en_proceso",
  "resuelto",
  "cerrado",
];

// Colores de columna según estado
const ESTADO_COLUMN_COLORS: Record<
  EstadoPqrs,
  { bg: string; header: string; badge: string }
> = {
  pendiente: {
    bg: "bg-brown-50/50",
    header: "bg-brown-100 border-brown-200",
    badge: "bg-brown-200 text-brown-800",
  },
  en_proceso: {
    bg: "bg-gold-50/30",
    header: "bg-gold-100 border-gold-200",
    badge: "bg-gold-200 text-gold-900",
  },
  resuelto: {
    bg: "bg-green-50/30",
    header: "bg-green-100 border-green-200",
    badge: "bg-green-200 text-green-900",
  },
  cerrado: {
    bg: "bg-gray-50/50",
    header: "bg-gray-100 border-gray-200",
    badge: "bg-gray-200 text-gray-700",
  },
};

// Iconos para cada estado
const ESTADO_ICONS: Record<
  EstadoPqrs,
  React.ComponentType<{ className?: string }>
> = {
  pendiente: Clock,
  en_proceso: RefreshCw,
  resuelto: CheckCircle2,
  cerrado: Lock,
};

interface PqrsKanbanBoardProps {
  pqrs: PqrsConRelaciones[];
  onEditar: (pqrs: Pqrs) => void;
  onEliminar: (pqrs: Pqrs) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoPqrs,
    respuesta?: string,
  ) => { ok: boolean; error?: string };
}

export function PqrsKanbanBoard({
  pqrs,
  onEditar,
  onEliminar,
  onCambiarEstado,
}: PqrsKanbanBoardProps) {
  const t = useTranslations("pqrs");
  const [draggedPqrs, setDraggedPqrs] = useState<Pqrs | null>(null);
  const [dragOverEstado, setDragOverEstado] = useState<EstadoPqrs | null>(null);

  // Agrupar PQRS por estado
  const pqrsPorEstado = ESTADOS.reduce(
    (acc, estado) => {
      acc[estado] = pqrs.filter(({ pqrs: p }) => p.estado === estado);
      return acc;
    },
    {} as Record<EstadoPqrs, PqrsConRelaciones[]>,
  );

  const handleDragStart = (pqrs: Pqrs) => {
    setDraggedPqrs(pqrs);
  };

  const handleDragEnd = () => {
    setDraggedPqrs(null);
    setDragOverEstado(null);
  };

  const handleDragOver = (e: React.DragEvent, estado: EstadoPqrs) => {
    e.preventDefault();
    setDragOverEstado(estado);
  };

  const handleDragLeave = () => {
    setDragOverEstado(null);
  };

  const handleDrop = (e: React.DragEvent, nuevoEstado: EstadoPqrs) => {
    e.preventDefault();
    if (draggedPqrs && draggedPqrs.estado !== nuevoEstado) {
      const transicionesPermitidas: Record<EstadoPqrs, EstadoPqrs[]> = {
        pendiente: ["en_proceso", "cerrado"],
        en_proceso: ["resuelto", "cerrado"],
        resuelto: ["cerrado"],
        cerrado: [],
      };

      if (transicionesPermitidas[draggedPqrs.estado].includes(nuevoEstado)) {
        onCambiarEstado(draggedPqrs.id, nuevoEstado);
      }
    }
    handleDragEnd();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
      {ESTADOS.map((estado) => {
        const pqrsEnEstado = pqrsPorEstado[estado];
        const colors = ESTADO_COLUMN_COLORS[estado];
        const isDragOver = dragOverEstado === estado;
        const canDrop = draggedPqrs && draggedPqrs.estado !== estado;

        return (
          <div
            key={estado}
            data-testid={`kanban-column-${estado}`}
            onDragOver={(e) => handleDragOver(e, estado)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, estado)}
            className={`flex flex-col rounded-xl border ${
              isDragOver && canDrop
                ? "border-gold-500 border-2 shadow-lg"
                : "border-brown-100"
            } ${colors.bg} overflow-hidden min-h-100 transition-all duration-200`}
          >
            <div
              className={`${colors.header} border-b px-4 py-3 sticky top-0 z-10`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = ESTADO_ICONS[estado];
                    return (
                      <IconComponent
                        className="h-4 w-4 text-brown-700"
                        aria-hidden="true"
                      />
                    );
                  })()}
                  <h3 className="font-semibold text-brown-900 text-sm">
                    {t(`estados.${estado}`)}
                  </h3>
                </div>
                <span
                  className={`${colors.badge} rounded-full px-2 py-0.5 text-xs font-bold min-w-6 text-center`}
                  aria-label={`${pqrsEnEstado.length} ${t("requestsInState")}`}
                >
                  {pqrsEnEstado.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {pqrsEnEstado.length === 0 ? (
                <div className="text-center py-8 text-sm text-brown-400">
                  {t("sinPqrsEnEstado")}
                </div>
              ) : (
                pqrsEnEstado.map(({ pqrs: p, cliente }) => (
                  <PqrsCard
                    key={p.id}
                    pqrs={p}
                    cliente={cliente}
                    onEditar={onEditar}
                    onEliminar={onEliminar}
                    onCambiarEstado={onCambiarEstado}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
