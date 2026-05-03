"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { PqrsKanbanBoard } from "./PqrsKanbanBoard";
import type { Pqrs, EstadoPqrs, TipoPqrs } from "@/types";
import type { PqrsConRelaciones } from "../hooks/usePqrs";

const TIPOS: TipoPqrs[] = ["peticion", "queja", "reclamo", "sugerencia"];

const ESTADOS: EstadoPqrs[] = [
  "pendiente",
  "en_proceso",
  "resuelto",
  "cerrado",
];

interface PqrsListProps {
  pqrs: PqrsConRelaciones[];
  filtroTexto: string;
  onFiltroTextoChange: (valor: string) => void;
  filtroTipo: TipoPqrs | "";
  onFiltroTipoChange: (tipo: TipoPqrs | "") => void;
  filtroEstado: EstadoPqrs | "";
  onFiltroEstadoChange: (estado: EstadoPqrs | "") => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (p: number) => void;
  onEditar: (pqrs: Pqrs) => void;
  onEliminar: (pqrs: Pqrs) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoPqrs,
    respuesta?: string,
  ) => { ok: boolean; error?: string };
}

export function PqrsList({
  pqrs,
  filtroTexto,
  onFiltroTextoChange,
  filtroTipo,
  onFiltroTipoChange,
  filtroEstado,
  onFiltroEstadoChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onEliminar,
  onCambiarEstado,
}: PqrsListProps) {
  const t = useTranslations("pqrs");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Buscador */}
        <div className="relative flex-1">
          <label htmlFor="filtro-pqrs" className="sr-only">
            {tCommon("search")}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg
              className="h-4 w-4 text-brown-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="filtro-pqrs"
            type="search"
            placeholder={`${tCommon("search")} ${t("searchPlaceholder")}`}
            value={filtroTexto}
            onChange={(e) => onFiltroTextoChange(e.target.value)}
            className="w-full rounded-xl border border-brown-200 bg-white py-2.5 pl-10 pr-4 text-sm text-brown-900 placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>

        {/* Filtro por tipo */}
        <div>
          <label htmlFor="filtro-tipo" className="sr-only">
            {t("campos.tipo")}
          </label>
          <select
            id="filtro-tipo"
            value={filtroTipo}
            onChange={(e) =>
              onFiltroTipoChange(e.target.value as TipoPqrs | "")
            }
            className="rounded-xl border border-brown-200 bg-white px-3 py-2.5 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          >
            <option value="">{tCommon("allTypes")}</option>
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {t(`tipos.${tipo}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-estado" className="sr-only">
            {tCommon("status")}
          </label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) =>
              onFiltroEstadoChange(e.target.value as EstadoPqrs | "")
            }
            className="rounded-xl border border-brown-200 bg-white px-3 py-2.5 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          >
            <option value="">{tCommon("allStates")}</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {t(`estados.${estado}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pqrs.length === 0 ? (
        <EmptyState message={t("sinPqrs")} />
      ) : (
        <>
          <PqrsKanbanBoard
            pqrs={pqrs}
            onEditar={onEditar}
            onEliminar={onEliminar}
            onCambiarEstado={onCambiarEstado}
          />
        </>
      )}
    </div>
  );
}
