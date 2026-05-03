"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClienteRow } from "./ClienteRow";
import type { Cliente } from "@/types";

interface ClientesListProps {
  clientes: Cliente[];
  filtro: string;
  onFiltroChange: (valor: string) => void;
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (pagina: number) => void;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (cliente: Cliente) => void;
}

export function ClientesList({
  clientes,
  filtro,
  onFiltroChange,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEditar,
  onEliminar,
}: ClientesListProps) {
  const t = useTranslations("clientes");
  const tCommon = useTranslations("common");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const clientesGrouped = useMemo(() => {
    const grouped: Record<string, Cliente[]> = {};
    clientes.forEach((cliente) => {
      const firstLetter = cliente.apellido[0]?.toUpperCase() || "#";
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(cliente);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [clientes]);

  const availableLetters = useMemo(() => {
    return clientesGrouped.map(([letter]) => letter);
  }, [clientesGrouped]);

  const scrollToLetter = (letter: string) => {
    setSelectedLetter(letter);
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <label htmlFor="filtro-clientes" className="sr-only">
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
          id="filtro-clientes"
          type="search"
          placeholder={`${tCommon("search")} por nombre o documento...`}
          value={filtro}
          onChange={(e) => onFiltroChange(e.target.value)}
          className="w-full rounded-xl border border-brown-200 bg-white py-2.5 pl-10 pr-4 text-sm text-brown-900 placeholder-brown-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
        />
      </div>

      {clientes.length === 0 ? (
        <EmptyState message={t("sinClientes")} />
      ) : (
        <div className="flex gap-4">
          {availableLetters.length > 1 && (
            <div className="shrink-0 w-12">
              <div className="sticky top-24 flex flex-col gap-1 bg-white rounded-xl border border-brown-100 p-2 shadow-sm">
                {availableLetters.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => scrollToLetter(letter)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      selectedLetter === letter
                        ? "bg-gold-600 text-white shadow-md"
                        : "bg-brown-50 text-brown-700 hover:bg-brown-100"
                    }`}
                    aria-label={`Ir a la letra ${letter}`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 space-y-6">
            {clientesGrouped.map(([letter, clientesInGroup]) => (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gold-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-serif text-xl font-bold">
                      {letter}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-brown-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {clientesInGroup.map((cliente) => (
                    <ClienteRow
                      key={cliente.id}
                      cliente={cliente}
                      onEditar={onEditar}
                      onEliminar={onEliminar}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
