"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/ui/AdminShell";
import { useSolicitudes } from "../hooks/useSolicitudes";
import { SolicitudesList } from "./SolicitudesList";
import { SolicitudForm } from "./SolicitudForm";
import { CancelarSolicitudModal } from "./CancelarSolicitudModal";
import type { EstadoSolicitud } from "@/types";

/**
 * SolicitudesClient - contenedor 'use client' del módulo Gestión de Solicitudes.
 */
export function SolicitudesClient() {
  const t = useTranslations("solicitudes");
  const {
    solicitudes,
    totalSolicitudes,
    reservas,
    clientes,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    solicitudSeleccionada,
    solicitudACancelar,
    isFormOpen,
    crearSolicitud,
    editarSolicitud,
    cambiarEstado,
    cancelarSolicitud,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalCancelar,
    cerrarModalCancelar,
  } = useSolicitudes();

  const reservaACancelar = solicitudACancelar
    ? reservas.find((r) => r.id === solicitudACancelar.reservaId)
    : undefined;
  const clienteACancelar = reservaACancelar
    ? clientes.find((c) => c.id === reservaACancelar.clienteId)
    : undefined;

  return (
    <AdminShell>
      <div className="min-h-screen bg-linear-to-br from-cream via-cream to-brown-50">
        {/* Header */}
        <header className="border-b border-brown-100 bg-white/80 backdrop-blur-sm px-6 py-6 shadow-sm sticky top-0 z-10">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown-900">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-brown-500">
                {totalSolicitudes}{" "}
                {totalSolicitudes === 1
                  ? t("requestRecorded")
                  : t("requestsRecorded")}
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
          <SolicitudesList
            solicitudes={solicitudes}
            filtroTexto={filtroTexto}
            onFiltroTextoChange={(val: string) => {
              setFiltroTexto(val);
              setPagina(1);
            }}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={(val: EstadoSolicitud | "") => {
              setFiltroEstado(val);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onCambiarEstado={cambiarEstado}
            onCancelar={abrirModalCancelar}
          />
        </main>

        {/* Modal crear/editar */}
        <SolicitudForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearSolicitud}
          onEdit={editarSolicitud}
          solicitudInicial={solicitudSeleccionada}
          reservas={reservas}
          clientes={clientes}
        />

        {/* Modal cancelar */}
        <CancelarSolicitudModal
          solicitud={solicitudACancelar}
          reserva={reservaACancelar}
          cliente={clienteACancelar}
          onConfirmar={cancelarSolicitud}
          onCerrar={cerrarModalCancelar}
        />
      </div>
    </AdminShell>
  );
}
