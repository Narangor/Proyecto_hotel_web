"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { SolicitudRow } from "./SolicitudRow";
import type { Solicitud, EstadoSolicitud } from "@/types";
import type { SolicitudConRelaciones } from "../hooks/useSolicitudes";

const ESTADOS: EstadoSolicitud[] = [
  "pendiente",
  "en_proceso",
  "completada",
  "cancelada",
];

interface SolicitudesListProps {
  solicitudes: SolicitudConRelaciones[];
  filtroTexto: string;
  onFiltroTextoChange: (valor: string) => void;
  filtroEstado: EstadoSolicitud | "";
  onFiltroEstadoChange: (estado: EstadoSolicitud | "") => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (p: number) => void;
  onEditar: (solicitud: Solicitud) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoSolicitud,
  ) => { ok: boolean; error?: string };
  onCancelar: (solicitud: Solicitud) => void;
}

export function SolicitudesList({
  solicitudes,
  filtroTexto,
  onFiltroTextoChange,
  filtroEstado,
  onFiltroEstadoChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onCambiarEstado,
  onCancelar,
}: SolicitudesListProps) {
  const t = useTranslations("solicitudes");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Buscador */}
        <div className="relative flex-1">
          <label htmlFor="filtro-solicitudes" className="sr-only">
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
            id="filtro-solicitudes"
            type="search"
            placeholder={`${tCommon("search")} ${t("searchPlaceholder")}`}
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
              onFiltroEstadoChange(e.target.value as EstadoSolicitud | "")
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

      {/* Tabla */}
      {solicitudes.length === 0 ? (
        <EmptyState message={t("sinSolicitudes")} />
      ) : (
        <div className="rounded-xl border border-brown-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label={t("title")}>
              <thead>
                <tr className="border-b border-brown-100 bg-brown-50">
                  {[
                    "ID",
                    t("campos.tipo"),
                    t("campos.habitacion"),
                    t("campos.cliente"),
                    t("campos.descripcion"),
                    t("campos.prioridad"),
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
                {solicitudes.map(({ solicitud, reserva, cliente }) => (
                  <SolicitudRow
                    key={solicitud.id}
                    solicitud={solicitud}
                    reserva={reserva}
                    cliente={cliente}
                    onEditar={onEditar}
                    onCambiarEstado={onCambiarEstado}
                    onCancelar={onCancelar}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div
          className="flex items-center justify-between text-sm text-brown-500"
          aria-label={tCommon("page")}
        >
          <button
            onClick={() => onPaginaChange(pagina - 1)}
            disabled={pagina === 1}
            aria-label={tCommon("previousPage")}
            className="rounded-lg border border-brown-200 px-3 py-1.5 disabled:opacity-40 hover:bg-brown-50 transition-colors"
          >
            ← {tCommon("previous")}
          </button>
          <span>
            {tCommon("page")} {pagina} {tCommon("of")} {totalPaginas}
          </span>
          <button
            onClick={() => onPaginaChange(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label={tCommon("nextPage")}
            className="rounded-lg border border-brown-200 px-3 py-1.5 disabled:opacity-40 hover:bg-brown-50 transition-colors"
          >
            {tCommon("next")} →
          </button>
        </div>
      )}
    </div>
  );
}
