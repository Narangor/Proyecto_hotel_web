"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/ui/AdminShell";
import { usePqrs } from "../hooks/usePqrs";
import { PqrsList } from "./PqrsList";
import { PqrsForm } from "./PqrsForm";
import { EliminarPqrsModal } from "./EliminarPqrsModal";
import type { EstadoPqrs, TipoPqrs } from "@/types";

/**
 * PqrsClient - contenedor 'use client' del módulo Gestión de PQRS.
 */
export function PqrsClient() {
  const t = useTranslations("pqrs");
  const {
    pqrs,
    totalPqrs,
    clientes,
    reservas,
    filtroTexto,
    setFiltroTexto,
    filtroTipo,
    setFiltroTipo,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    pqrsSeleccionado,
    pqrsAEliminar,
    isFormOpen,
    crearPqrs,
    editarPqrs,
    eliminarPqrs,
    cambiarEstado,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar,
    cerrarModalEliminar,
  } = usePqrs();

  const clienteAEliminar = pqrsAEliminar?.clienteId
    ? clientes.find((c) => c.id === pqrsAEliminar.clienteId)
    : undefined;

  return (
    <AdminShell>
      <div className="min-h-screen bg-linear-to-br from-cream via-cream to-brown-50">
        <header className="border-b border-brown-100 bg-white/80 backdrop-blur-sm px-6 py-6 shadow-sm sticky top-0 z-10">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown-900">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-brown-500">
                {totalPqrs}{" "}
                {totalPqrs === 1 ? t("requestRecorded") : t("requestsRecorded")}
              </p>
            </div>
            <button
              onClick={abrirFormularioCrear}
              className="rounded-xl bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-gold-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 flex items-center gap-2"
              aria-label={t("nuevo")}
            >
              <Plus className="h-5 w-5" />
              {t("nuevo")}
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <PqrsList
            pqrs={pqrs}
            filtroTexto={filtroTexto}
            onFiltroTextoChange={(val: string) => {
              setFiltroTexto(val);
              setPagina(1);
            }}
            filtroTipo={filtroTipo}
            onFiltroTipoChange={(val: TipoPqrs | "") => {
              setFiltroTipo(val);
              setPagina(1);
            }}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={(val: EstadoPqrs | "") => {
              setFiltroEstado(val);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onEliminar={abrirModalEliminar}
            onCambiarEstado={cambiarEstado}
          />
        </main>

        {/* Modal crear/editar */}
        <PqrsForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearPqrs}
          onEdit={editarPqrs}
          pqrsInicial={pqrsSeleccionado}
          clientes={clientes}
          reservas={reservas}
        />

        {/* Modal eliminar */}
        <EliminarPqrsModal
          pqrs={pqrsAEliminar}
          cliente={clienteAEliminar}
          onConfirmar={eliminarPqrs}
          onCerrar={cerrarModalEliminar}
        />
      </div>
    </AdminShell>
  );
}
