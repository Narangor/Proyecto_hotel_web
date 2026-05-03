"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/ui/AdminShell";
import { usePaquetes } from "../hooks/usePaquetes";
import { PaquetesList } from "./PaquetesList";
import { PaqueteForm } from "./PaqueteForm";
import { EliminarPaqueteModal } from "./EliminarPaqueteModal";
import type { EstadoPaquete } from "@/types";

export function PaquetesClient() {
  const t = useTranslations("paquetes");
  const {
    paquetes,
    totalPaquetes,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    seleccionado,
    aEliminar,
    isFormOpen,
    crearPaquete,
    editarPaquete,
    eliminarPaquete,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar,
    cerrarModalEliminar,
  } = usePaquetes();

  return (
    <AdminShell>
      <div className="min-h-screen bg-linear-to-br from-cream via-cream to-brown-50">
        <header className="border-b border-brown-100 bg-white/80 backdrop-blur-sm px-6 py-6 shadow-sm sticky top-0 z-30">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown-900">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-brown-500">
                {totalPaquetes}{" "}
                {totalPaquetes === 1 ? t("contadorUno") : t("contadorVarios")}
              </p>
            </div>
            <button
              type="button"
              onClick={abrirFormularioCrear}
              className="rounded-xl bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-gold-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 flex items-center gap-2"
              aria-label={t("nuevo")}
            >
              <Plus className="h-5 w-5" aria-hidden />
              {t("nuevo")}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <PaquetesList
            paquetes={paquetes}
            filtroTexto={filtroTexto}
            onFiltroTextoChange={(v) => {
              setFiltroTexto(v);
              setPagina(1);
            }}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={(v: EstadoPaquete | "") => {
              setFiltroEstado(v);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onEliminar={abrirModalEliminar}
          />
        </main>

        <PaqueteForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearPaquete}
          onEdit={editarPaquete}
          paqueteInicial={seleccionado}
        />

        <EliminarPaqueteModal
          paquete={aEliminar}
          onConfirmar={eliminarPaquete}
          onCerrar={cerrarModalEliminar}
        />
      </div>
    </AdminShell>
  );
}
