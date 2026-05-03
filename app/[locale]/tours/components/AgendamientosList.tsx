"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { btnPagination } from "@/components/ui/buttonClasses";
import { EmptyState } from "@/components/ui/EmptyState";
import { AgendamientoRow } from "./AgendamientoRow";
import { TourSection } from "./TourSection";
import type {
  AgendamientoTour,
  EstadoAgendamientoTour,
  TourCatalogo,
} from "@/types";
import type { AgendamientoConRelaciones } from "../hooks/useAgendamientosTour";

const ESTADOS: EstadoAgendamientoTour[] = [
  "pendiente",
  "confirmado",
  "cancelado",
  "realizado",
];

interface AgendamientosListProps {
  filas: AgendamientoConRelaciones[];
  catalogo: TourCatalogo[];
  filtroTexto: string;
  onFiltroTextoChange: (v: string) => void;
  filtroEstado: EstadoAgendamientoTour | "";
  onFiltroEstadoChange: (v: EstadoAgendamientoTour | "") => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (p: number) => void;
  onEditar: (a: AgendamientoTour) => void;
  onCancelar: (a: AgendamientoTour) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoAgendamientoTour,
  ) => { ok: boolean; error?: string };
}

export function AgendamientosList({
  filas,
  catalogo,
  filtroTexto,
  onFiltroTextoChange,
  filtroEstado,
  onFiltroEstadoChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onCancelar,
  onCambiarEstado,
}: AgendamientosListProps) {
  const t = useTranslations("tours");
  const tCommon = useTranslations("common");

  const bookingsByTour = new Map<string, typeof filas>();
  filas.forEach((fila) => {
    const tourId = fila.agendamiento.tourCatalogoId;
    if (!bookingsByTour.has(tourId)) {
      bookingsByTour.set(tourId, []);
    }
    bookingsByTour.get(tourId)!.push(fila);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="filtro-tours" className="sr-only">
            {tCommon("search")}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-brown-400" aria-hidden />
          </div>
          <input
            id="filtro-tours"
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
            onFiltroEstadoChange(e.target.value as EstadoAgendamientoTour | "")
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

      {filas.length === 0 ? (
        <EmptyState message={t("sinAgendamientos")} />
      ) : (
        <>
          <div className="space-y-6">
            {catalogo.map((tour) => {
              const tourBookings = bookingsByTour.get(tour.id) || [];
              return (
                <TourSection
                  key={tour.id}
                  tour={tour}
                  bookings={tourBookings.map((fila) => ({
                    agendamiento: fila.agendamiento,
                    cliente: fila.cliente,
                  }))}
                  onEditar={onEditar}
                  onCancelar={onCancelar}
                  onCambiarEstado={onCambiarEstado}
                />
              );
            })}
          </div>

          <div className="hidden" data-testid="test-compatibility">
            <table className="w-full text-sm" aria-label={t("title")}>
              <thead>
                <tr className="border-b border-brown-100 bg-brown-50">
                  {[
                    "ID",
                    t("campos.tour"),
                    t("campos.cliente"),
                    t("campos.fechaHora"),
                    t("campos.numeroParticipantes"),
                    t("campos.puntoEncuentro"),
                    tCommon("status"),
                    "",
                  ].map((col, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500"
                    >
                      {col || (
                        <span className="sr-only">{tCommon("actions")}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <AgendamientoRow
                    key={fila.agendamiento.id}
                    fila={fila}
                    onEditar={onEditar}
                    onCancelar={onCancelar}
                    onCambiarEstado={onCambiarEstado}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onPaginaChange(pagina - 1)}
            disabled={pagina === 1}
            className="rounded-lg border border-brown-200 bg-white px-3 py-1.5 text-sm text-brown-700 hover:bg-brown-50 disabled:cursor-not-allowed disabled:opacity-50"
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
