"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReservaRow } from "./ReservaRow";
import type { Reserva, EstadoReserva } from "@/types";
import type { ReservaConCliente } from "../hooks/useReservas";

const ESTADOS: EstadoReserva[] = [
  "pendiente",
  "confirmada",
  "en_curso",
  "completada",
  "cancelada",
];

interface ReservasListProps {
  reservas: ReservaConCliente[];
  filtroTexto: string;
  onFiltroTextoChange: (valor: string) => void;
  filtroEstado: EstadoReserva | "";
  onFiltroEstadoChange: (estado: EstadoReserva | "") => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (p: number) => void;
  onEditar: (reserva: Reserva) => void;
  onCancelar: (reserva: Reserva) => void;
}

export function ReservasList({
  reservas,
  filtroTexto,
  onFiltroTextoChange,
  filtroEstado,
  onFiltroEstadoChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onCancelar,
}: ReservasListProps) {
  const t = useTranslations("reservas");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Buscador */}
        <div className="relative flex-1">
          <label htmlFor="filtro-reservas" className="sr-only">
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
            id="filtro-reservas"
            type="search"
            placeholder={`${tCommon("search")} por cliente o habitación...`}
            value={filtroTexto}
            onChange={(e) => onFiltroTextoChange(e.target.value)}
            className="w-full rounded-xl border border-brown-200 bg-white py-2.5 pl-10 pr-4 text-sm text-brown-900 placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label htmlFor="filtro-estado" className="sr-only">
            {tCommon("status")}
          </label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) =>
              onFiltroEstadoChange(e.target.value as EstadoReserva | "")
            }
            className="rounded-xl border border-brown-200 bg-white px-3 py-2.5 text-sm text-brown-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {t(`estados.${estado}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Reservas */}
      {reservas.length === 0 ? (
        <EmptyState message={t("sinReservas")} />
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label={t("title")}
        >
          {reservas.map(({ reserva, cliente }) => (
            <ReservaRow
              key={reserva.id}
              reserva={reserva}
              cliente={cliente}
              onEditar={onEditar}
              onCancelar={onCancelar}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div
          className="flex items-center justify-between text-sm text-brown-500"
          aria-label="Paginación"
        >
          <button
            onClick={() => onPaginaChange(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className="rounded-lg border border-brown-200 px-3 py-1.5 disabled:opacity-40 hover:bg-brown-50 transition-colors"
          >
            ← Anterior
          </button>
          <span>
            {tCommon("page")} {pagina} {tCommon("of")} {totalPaginas}
          </span>
          <button
            onClick={() => onPaginaChange(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
            className="rounded-lg border border-brown-200 px-3 py-1.5 disabled:opacity-40 hover:bg-brown-50 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
