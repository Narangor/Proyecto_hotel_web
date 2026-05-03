"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/ui/AdminShell";
import { btnHeaderPrimary } from "@/components/ui/buttonClasses";
import { useAgendamientosTour } from "../hooks/useAgendamientosTour";
import { AgendamientosList } from "./AgendamientosList";
import { AgendamientoForm } from "./AgendamientoForm";
import { CancelarAgendamientoModal } from "./CancelarAgendamientoModal";
import type { EstadoAgendamientoTour } from "@/types";

export function ToursClient() {
  const t = useTranslations("tours");
  const {
    filas,
    totalAgendamientos,
    catalogo,
    clientes,
    reservas,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    seleccionado,
    aCancelar,
    isFormOpen,
    crearAgendamiento,
    editarAgendamiento,
    cancelarAgendamiento,
    cambiarEstado,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalCancelar,
    cerrarModalCancelar,
  } = useAgendamientosTour();

  const clienteCancelar = aCancelar
    ? clientes.find((c) => c.id === aCancelar.clienteId)
    : undefined;
  const reservaCancelar = aCancelar?.reservaId
    ? reservas.find((r) => r.id === aCancelar.reservaId)
    : undefined;
  const tourCancelar = aCancelar
    ? catalogo.find((c) => c.id === aCancelar.tourCatalogoId)
    : undefined;

  return (
    <AdminShell>
      <div className="min-h-screen bg-linear-to-br from-cream via-white to-brown-50/30">
        <header className="border-b border-brown-100 bg-white/80 backdrop-blur-sm px-6 py-6 shadow-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown-900">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-brown-500">
                {totalAgendamientos}{" "}
                {totalAgendamientos === 1
                  ? t("contadorUno")
                  : t("contadorVarios")}
              </p>
            </div>
            <button
              type="button"
              onClick={abrirFormularioCrear}
              className={btnHeaderPrimary}
              aria-label={t("nuevo")}
            >
              <Plus className="h-5 w-5" aria-hidden />
              {t("nuevo")}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <AgendamientosList
            filas={filas}
            catalogo={catalogo}
            filtroTexto={filtroTexto}
            onFiltroTextoChange={(v) => {
              setFiltroTexto(v);
              setPagina(1);
            }}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={(v: EstadoAgendamientoTour | "") => {
              setFiltroEstado(v);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onCancelar={abrirModalCancelar}
            onCambiarEstado={cambiarEstado}
          />
        </main>

        <AgendamientoForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearAgendamiento}
          onEdit={editarAgendamiento}
          agendamientoInicial={seleccionado}
          catalogo={catalogo}
          clientes={clientes}
          reservas={reservas}
        />

        <CancelarAgendamientoModal
          agendamiento={aCancelar}
          cliente={clienteCancelar}
          reserva={reservaCancelar}
          tour={tourCancelar}
          onConfirmar={cancelarAgendamiento}
          onCerrar={cerrarModalCancelar}
        />
      </div>
    </AdminShell>
  );
}
