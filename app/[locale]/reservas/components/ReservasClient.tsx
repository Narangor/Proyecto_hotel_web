"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/ui/AdminShell";
import { MOCK_CLIENTES, MOCK_RESERVAS } from "@/lib/mock-data";
import { getStoredClientes, getStoredReservas, mergeById } from "@/lib/booking-store";
import { useReservas } from "../hooks/useReservas";
import { ReservasList } from "./ReservasList";
import { ReservaForm } from "./ReservaForm";
import { CancelarReservaModal } from "./CancelarReservaModal";

/**
 * ReservasClient — contenedor 'use client' del módulo Gestión de Reservas.
 *
 * Patrón idéntico a ClientesClient: único punto de contacto con el hook,
 * distribuye datos y callbacks hacia los componentes hijos sin que ellos
 * accedan al hook directamente.
 */
export function ReservasClient() {
  const t = useTranslations("reservas");

  // Mezclar datos mock con reservas/clientes persistidos (sin duplicados)
  const [initialData] = useState(() => ({
    reservas: mergeById(MOCK_RESERVAS, getStoredReservas()),
    clientes: mergeById(MOCK_CLIENTES, getStoredClientes()),
  }));

  const {
    reservas,
    reservasFiltradas,
    totalReservas,
    clientes,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    reservaSeleccionada,
    reservaACancelar,
    isFormOpen,
    crearReserva,
    editarReserva,
    cancelarReserva,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalCancelar,
    cerrarModalCancelar,
  } = useReservas(initialData.reservas, initialData.clientes);

  // Resolver el cliente de la reserva a cancelar para mostrarlo en el modal
  const clienteACancelar = reservaACancelar
    ? clientes.find((c) => c.id === reservaACancelar.clienteId)
    : undefined;

  return (
    <AdminShell>
      <div className="min-h-screen bg-linear-to-br from-cream via-cream to-brown-50">
        {/* Header — mismo patrón que PagosClient */}
        <header className="border-b border-brown-100 bg-white/80 backdrop-blur-sm px-6 py-6 shadow-sm sticky top-0 z-10">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown-900">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-brown-500">
                {totalReservas}{" "}
                {totalReservas === 1
                  ? "reserva registrada"
                  : "reservas registradas"}
              </p>
            </div>
            <button
              onClick={abrirFormularioCrear}
              className="rounded-xl bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-gold-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 flex items-center gap-2"
              aria-label={t("nueva")}
            >
              <Plus className="h-5 w-5" />
              {t("nueva")}
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <ReservasList
            reservas={reservas}
            filtroTexto={filtroTexto}
            onFiltroTextoChange={(val) => {
              setFiltroTexto(val);
              setPagina(1);
            }}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={(val) => {
              setFiltroEstado(val);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onCancelar={abrirModalCancelar}
          />
        </main>

        {/* Modal crear/editar */}
        <ReservaForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearReserva}
          onEdit={editarReserva}
          reservaInicial={reservaSeleccionada}
          clientes={clientes}
        />

        {/* Modal cancelar */}
        <CancelarReservaModal
          reserva={reservaACancelar}
          cliente={clienteACancelar}
          onConfirmar={cancelarReserva}
          onCerrar={cerrarModalCancelar}
        />
      </div>
    </AdminShell>
  );
}
