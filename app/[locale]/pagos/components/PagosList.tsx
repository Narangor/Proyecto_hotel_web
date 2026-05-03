"use client";

import { useTranslations } from "next-intl";
import { Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PagoRow } from "./PagoRow";
import type { Pago, EstadoPago } from "@/types";
import type { PagoConRelaciones } from "../hooks/usePagos";

const ESTADOS: EstadoPago[] = [
  "pendiente",
  "completado",
  "rechazado",
  "reembolsado",
  "anulado",
];

interface PagosListProps {
  pagos: PagoConRelaciones[];
  filtroTexto: string;
  onFiltroTextoChange: (valor: string) => void;
  filtroEstado: EstadoPago | "";
  onFiltroEstadoChange: (estado: EstadoPago | "") => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (p: number) => void;
  onEditar: (pago: Pago) => void;
  onAnular: (pago: Pago) => void;
}

export function PagosList({
  pagos,
  filtroTexto,
  onFiltroTextoChange,
  filtroEstado,
  onFiltroEstadoChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onAnular,
}: PagosListProps) {
  const t = useTranslations("pagos");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="filtro-pagos" className="sr-only">
            {tCommon("search")}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <Search className="h-5 w-5 text-brown-400" aria-hidden="true" />
          </div>
          <input
            id="filtro-pagos"
            type="search"
            placeholder={`${tCommon("search")} ${t("searchPlaceholder")}`}
            value={filtroTexto}
            onChange={(e) => onFiltroTextoChange(e.target.value)}
            className="w-full rounded-xl border border-brown-200 bg-white py-3 pl-12 pr-4 text-sm text-brown-900 placeholder-brown-400 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brown-500" aria-hidden="true" />
          <label htmlFor="filtro-estado" className="sr-only">
            {tCommon("status")}
          </label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) =>
              onFiltroEstadoChange(e.target.value as EstadoPago | "")
            }
            className="rounded-xl border border-brown-200 bg-white px-4 py-3 text-sm text-brown-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 transition-colors min-w-40"
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

      {pagos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brown-100 p-12">
          <EmptyState message={t("sinPagos")} />
        </div>
      ) : (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          aria-label={t("title")}
        >
          {pagos.map(({ pago, reserva, cliente }) => (
            <PagoRow
              key={pago.id}
              pago={pago}
              reserva={reserva}
              cliente={cliente}
              onEditar={onEditar}
              onAnular={onAnular}
            />
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div
          className="flex items-center justify-between px-2 py-2"
          aria-label={tCommon("page")}
        >
          <button
            onClick={() => onPaginaChange(pagina - 1)}
            disabled={pagina === 1}
            aria-label={tCommon("previousPage")}
            className="rounded-lg bg-white border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brown-50 transition-colors"
          >
            ← {tCommon("previous")}
          </button>
          <span className="text-sm text-brown-600 font-medium">
            {tCommon("page")}{" "}
            <span className="text-brown-900 font-semibold">{pagina}</span>{" "}
            {tCommon("of")} {totalPaginas}
          </span>
          <button
            onClick={() => onPaginaChange(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label={tCommon("nextPage")}
            className="rounded-lg bg-white border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brown-50 transition-colors"
          >
            {tCommon("next")} →
          </button>
        </div>
      )}
    </div>
  );
}
