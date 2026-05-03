"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { btnPagination } from "@/components/ui/buttonClasses";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaqueteRow } from "./PaqueteRow";
import type { PaquetePromocional, EstadoPaquete } from "@/types";

const ESTADOS: EstadoPaquete[] = ["activo", "inactivo", "agotado"];

interface PaquetesListProps {
  paquetes: PaquetePromocional[];
  filtroTexto: string;
  onFiltroTextoChange: (v: string) => void;
  filtroEstado: EstadoPaquete | "";
  onFiltroEstadoChange: (v: EstadoPaquete | "") => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (p: number) => void;
  onEditar: (p: PaquetePromocional) => void;
  onEliminar: (p: PaquetePromocional) => void;
}

export function PaquetesList({
  paquetes,
  filtroTexto,
  onFiltroTextoChange,
  filtroEstado,
  onFiltroEstadoChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onEliminar,
}: PaquetesListProps) {
  const t = useTranslations("paquetes");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="filtro-paquetes" className="sr-only">
            {tCommon("search")}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-brown-400" aria-hidden />
          </div>
          <input
            id="filtro-paquetes"
            type="search"
            value={filtroTexto}
            onChange={(e) => onFiltroTextoChange(e.target.value)}
            placeholder={`${tCommon("search")} ${t("searchPlaceholder")}`}
            className="w-full rounded-xl border border-brown-200 bg-white py-2.5 pl-10 pr-4 text-sm text-brown-900 placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) =>
            onFiltroEstadoChange(e.target.value as EstadoPaquete | "")
          }
          className="cursor-pointer rounded-xl border border-brown-200 bg-white px-3 py-2.5 text-sm text-brown-900 shadow-sm transition-all duration-150 hover:border-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
        >
          <option value="">{tCommon("allStates")}</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {t(`estados.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {paquetes.length === 0 ? (
        <EmptyState message={t("sinPaquetes")} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((p) => (
            <PaqueteRow
              key={p.id}
              paquete={p}
              onEditar={onEditar}
              onEliminar={onEliminar}
            />
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onPaginaChange(pagina - 1)}
            disabled={pagina === 1}
            className={btnPagination}
            aria-label={tCommon("previousPage")}
          >
            ←
          </button>
          <span className="text-sm text-brown-600">
            {tCommon("page")} {pagina} {tCommon("of")} {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => onPaginaChange(pagina + 1)}
            disabled={pagina === totalPaginas}
            className={btnPagination}
            aria-label={tCommon("nextPage")}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
