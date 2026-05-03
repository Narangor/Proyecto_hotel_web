"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/ui/AdminShell";
import { useInscripciones } from "../hooks/useInscripciones";
import { InscripcionesList } from "./InscripcionesList";
import { InscripcionForm } from "./InscripcionForm";
import { CancelarInscripcionModal } from "./CancelarInscripcionModal";
import { EliminarInscripcionModal } from "./EliminarInscripcionModal";
import type { CategoriaInscripcion, EstadoInscripcion } from "@/types";

export function InscripcionesClient() {
  const t = useTranslations("inscripciones");
  const {
    inscripciones,
    totalInscripciones,
    clientes,
    reservas,
    filtroTexto,
    setFiltroTexto,
    filtroCategoria,
    setFiltroCategoria,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    seleccionada,
    aEliminar,
    aCancelar,
    isFormOpen,
    crearInscripcion,
    editarInscripcion,
    eliminarInscripcion,
    cancelarInscripcion,
    cambiarEstado,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar,
    cerrarModalEliminar,
    abrirModalCancelar,
    cerrarModalCancelar,
  } = useInscripciones();

  const clienteEliminar = aEliminar
    ? clientes.find((c) => c.id === aEliminar.clienteId)
    : undefined;
  const clienteCancelar = aCancelar
    ? clientes.find((c) => c.id === aCancelar.clienteId)
    : undefined;
  const reservaCancelar = aCancelar?.reservaId
    ? reservas.find((r) => r.id === aCancelar.reservaId)
    : undefined;

  return (
    <AdminShell>
      <div className="min-h-screen bg-linear-to-br from-cream via-cream to-brown-50">
        <header className="border-b border-brown-100 bg-white/80 backdrop-blur-sm px-6 py-6 shadow-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown-900">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-brown-500">
                {totalInscripciones}{" "}
                {totalInscripciones === 1
                  ? t("contadorUna")
                  : t("contadorVarias")}
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
          <InscripcionesList
            filas={inscripciones}
            filtroTexto={filtroTexto}
            onFiltroTextoChange={(v) => {
              setFiltroTexto(v);
              setPagina(1);
            }}
            filtroCategoria={filtroCategoria}
            onFiltroCategoriaChange={(v: CategoriaInscripcion | "") => {
              setFiltroCategoria(v);
              setPagina(1);
            }}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={(v: EstadoInscripcion | "") => {
              setFiltroEstado(v);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onEliminar={abrirModalEliminar}
            onCancelar={abrirModalCancelar}
            onCambiarEstado={cambiarEstado}
          />
        </main>

        <InscripcionForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearInscripcion}
          onEdit={editarInscripcion}
          inscripcionInicial={seleccionada}
          clientes={clientes}
          reservas={reservas}
        />

        <EliminarInscripcionModal
          inscripcion={aEliminar}
          cliente={clienteEliminar}
          onConfirmar={eliminarInscripcion}
          onCerrar={cerrarModalEliminar}
        />

        <CancelarInscripcionModal
          inscripcion={aCancelar}
          cliente={clienteCancelar}
          reserva={reservaCancelar}
          onConfirmar={cancelarInscripcion}
          onCerrar={cerrarModalCancelar}
        />
      </div>
    </AdminShell>
  );
}
