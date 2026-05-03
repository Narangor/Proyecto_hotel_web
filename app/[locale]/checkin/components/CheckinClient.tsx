"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/ui/AdminShell";
import { MOCK_CLIENTES, MOCK_RESERVAS, MOCK_CHECKINS } from "@/lib/mock-data";
import {
  getStoredClientes,
  getStoredReservas,
  getStoredCheckins,
  mergeById,
} from "@/lib/booking-store";
import { useCheckin } from "../hooks/useCheckin";
import { CheckinList } from "./CheckinList";
import { RegistrarCheckinModal } from "./RegistrarCheckinModal";
import { ActualizarCheckinForm } from "./ActualizarCheckinForm";
import { AnularCheckinModal } from "./AnularCheckinModal";

/**
 * CheckinClient — componente contenedor del módulo de Check-in Digital.
 *
 * Mezcla datos mock con check-ins, reservas y clientes persistidos desde
 * cualquier módulo (flujo público o administración).
 *
 * Patrón: Server Component (page.tsx) → Client Component (aquí)
 * → componentes de presentación (sin acceso al hook).
 */
export function CheckinClient() {
  const t = useTranslations("checkin");

  // Merge datos mock con datos persistidos en localStorage (sin duplicados)
  const [initialData] = useState(() => ({
    checkins: mergeById(MOCK_CHECKINS, getStoredCheckins()),
    reservas: mergeById(MOCK_RESERVAS, getStoredReservas()),
    clientes: mergeById(MOCK_CLIENTES, getStoredClientes()),
  }));

  const {
    checkins,
    totalCheckins,
    pendientesHoy,
    reservasElegibles,
    clienteMap,
    filtroEstado,
    setFiltroEstado,
    checkinSeleccionado,
    checkinAAnular,
    isRegistrarOpen,
    isActualizarOpen,
    registrarCheckin,
    actualizarCheckin,
    anularCheckin,
    abrirRegistrar,
    cerrarRegistrar,
    abrirActualizar,
    cerrarActualizar,
    abrirAnular,
    cerrarAnular,
  } = useCheckin(initialData.checkins, initialData.reservas, initialData.clientes);

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
                {totalCheckins} {totalCheckins === 1 ? "registro" : "registros"}
                {pendientesHoy > 0 && (
                  <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
                    {pendientesHoy} pendiente{pendientesHoy > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={abrirRegistrar}
              className="rounded-xl bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-gold-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 flex items-center gap-2"
              aria-label={t("registrar")}
            >
              <Plus className="h-5 w-5" />
              {t("registrar")}
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <CheckinList
            checkins={checkins}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={setFiltroEstado}
            onActualizar={abrirActualizar}
            onAnular={abrirAnular}
          />
        </main>

        {/* Modal: registrar nuevo check-in */}
        <RegistrarCheckinModal
          isOpen={isRegistrarOpen}
          onClose={cerrarRegistrar}
          reservasElegibles={reservasElegibles}
          clienteMap={clienteMap}
          onRegistrar={registrarCheckin}
        />

        {/* Modal: editar check-in existente */}
        <ActualizarCheckinForm
          isOpen={isActualizarOpen}
          onClose={cerrarActualizar}
          onActualizar={actualizarCheckin}
          checkin={checkinSeleccionado}
        />

        {/* Modal: anular check-in */}
        <AnularCheckinModal
          checkin={checkinAAnular}
          cliente={
            checkinAAnular
              ? clienteMap.get(checkinAAnular.clienteId)
              : undefined
          }
          onAnular={anularCheckin}
          onCerrar={cerrarAnular}
        />
      </div>
    </AdminShell>
  );
}
