"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/ui/AdminShell";
import { MOCK_CLIENTES, MOCK_RESERVAS } from "@/lib/mock-data";
import { getStoredClientes, getStoredReservas, mergeById } from "@/lib/booking-store";
import { useClientes } from "../hooks/useClientes";
import { ClientesList } from "./ClientesList";
import { ClienteForm } from "./ClienteForm";
import { DeleteClienteModal } from "./DeleteClienteModal";

/**
 * ClientesClient — componente contenedor del módulo de Gestión de Clientes.
 *
 * El único componente 'use client' que toca el hook useClientes.
 * Mezcla datos mock con clientes/reservas persistidos desde el flujo público.
 */
export function ClientesClient() {
  const t = useTranslations("clientes");

  const [initialData] = useState(() => ({
    clientes: mergeById(MOCK_CLIENTES, getStoredClientes()),
    reservas: mergeById(MOCK_RESERVAS, getStoredReservas()),
  }));

  const {
    clientes,
    filtro,
    setFiltro,
    pagina,
    setPagina,
    totalPaginas,
    clienteSeleccionado,
    clienteAEliminar,
    isFormOpen,
    totalClientes,
    crearCliente,
    editarCliente,
    eliminarCliente,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar,
    cerrarModalEliminar,
  } = useClientes(initialData.clientes, initialData.reservas);

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
                {totalClientes}{" "}
                {totalClientes === 1
                  ? "cliente registrado"
                  : "clientes registrados"}
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

        <main className="mx-auto max-w-7xl px-6 py-8">
          <ClientesList
            clientes={clientes}
            filtro={filtro}
            onFiltroChange={(val) => {
              setFiltro(val);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onEliminar={abrirModalEliminar}
          />
        </main>

        <ClienteForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearCliente}
          onEdit={editarCliente}
          clienteInicial={clienteSeleccionado}
        />

        <DeleteClienteModal
          cliente={clienteAEliminar}
          onConfirmar={eliminarCliente}
          onCerrar={cerrarModalEliminar}
        />
      </div>
    </AdminShell>
  );
}
