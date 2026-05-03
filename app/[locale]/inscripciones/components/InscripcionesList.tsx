"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { btnPagination } from "@/components/ui/buttonClasses";
import { EmptyState } from "@/components/ui/EmptyState";
import { InscripcionRow } from "./InscripcionRow";
import type {
  Inscripcion,
  EstadoInscripcion,
  CategoriaInscripcion,
} from "@/types";
import type { InscripcionConRelaciones } from "../hooks/useInscripciones";

const CATEGORIAS: CategoriaInscripcion[] = ["evento", "restaurante"];
const ESTADOS: EstadoInscripcion[] = [
  "pendiente",
  "confirmada",
  "cancelada",
  "completada",
];

interface InscripcionesListProps {
  filas: InscripcionConRelaciones[];
  filtroTexto: string;
  onFiltroTextoChange: (v: string) => void;
  filtroCategoria: CategoriaInscripcion | "";
  onFiltroCategoriaChange: (v: CategoriaInscripcion | "") => void;
  filtroEstado: EstadoInscripcion | "";
  onFiltroEstadoChange: (v: EstadoInscripcion | "") => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (p: number) => void;
  onEditar: (i: Inscripcion) => void;
  onEliminar: (i: Inscripcion) => void;
  onCancelar: (i: Inscripcion) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoInscripcion,
  ) => { ok: boolean; error?: string };
}

export function InscripcionesList({
  filas,
  filtroTexto,
  onFiltroTextoChange,
  filtroCategoria,
  onFiltroCategoriaChange,
  filtroEstado,
  onFiltroEstadoChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onEliminar,
  onCancelar,
  onCambiarEstado,
}: InscripcionesListProps) {
  const t = useTranslations("inscripciones");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="filtro-ins" className="sr-only">
            {tCommon("search")}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-brown-400" aria-hidden />
          </div>
          <input
            id="filtro-ins"
            type="search"
            value={filtroTexto}
            onChange={(e) => onFiltroTextoChange(e.target.value)}
            placeholder={`${tCommon("search")} ${t("searchPlaceholder")}`}
            className="w-full rounded-xl border border-brown-200 bg-white py-2.5 pl-10 pr-4 text-sm text-brown-900 placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) =>
            onFiltroCategoriaChange(e.target.value as CategoriaInscripcion | "")
          }
          className="cursor-pointer rounded-xl border border-brown-200 bg-white px-3 py-2.5 text-sm text-brown-900 shadow-sm transition-all duration-150 hover:border-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
        >
          <option value="">{t("filtros.todasCategorias")}</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {t(`categorias.${c}`)}
            </option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) =>
            onFiltroEstadoChange(e.target.value as EstadoInscripcion | "")
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
        <EmptyState message={t("sinInscripciones")} />
      ) : (
        <div className="rounded-xl border border-brown-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label={t("title")}>
              <thead>
                <tr className="border-b border-brown-100 bg-brown-50">
                  {[
                    "ID",
                    t("campos.categoria"),
                    t("campos.nombreActividad"),
                    t("campos.cliente"),
                    t("campos.fechaHora"),
                    t("campos.numeroPersonas"),
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
                {filas.map(({ inscripcion, cliente }) => (
                  <InscripcionRow
                    key={inscripcion.id}
                    inscripcion={inscripcion}
                    cliente={cliente}
                    onEditar={onEditar}
                    onEliminar={onEliminar}
                    onCancelar={onCancelar}
                    onCambiarEstado={onCambiarEstado}
                  />
                ))}
              </tbody>
            </table>
          </div>
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
            ← {tCommon("back")}
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
