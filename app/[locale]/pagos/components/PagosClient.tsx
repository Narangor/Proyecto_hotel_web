"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Plus,
  CreditCard,
  TrendingUp,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { AdminShell } from "@/components/ui/AdminShell";
import { MOCK_PAGOS } from "@/lib/mock-data";
import { usePagos } from "../hooks/usePagos";
import { PagosList } from "./PagosList";
import { PagoForm } from "./PagoForm";
import { AnularPagoModal } from "./AnularPagoModal";
import type { EstadoPago } from "@/types";

// Formatea un precio COP
function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

/**
 * PagosClient - contenedor 'use client' del módulo Gestión de Pagos.
 */
export function PagosClient() {
  const t = useTranslations("pagos");
  const {
    pagos,
    totalPagos,
    reservas,
    clientes,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    pagoSeleccionado,
    pagoAAnular,
    isFormOpen,
    crearPago,
    editarPago,
    anularPago,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalAnular,
    cerrarModalAnular,
  } = usePagos();

  const reservaAAnular = pagoAAnular
    ? reservas.find((r) => r.id === pagoAAnular.reservaId)
    : undefined;
  const clienteAAnular = reservaAAnular
    ? clientes.find((c) => c.id === reservaAAnular.clienteId)
    : undefined;

  // Cálculo de estadisticas
  const stats = useMemo(() => {
    const todosLosPagos = MOCK_PAGOS;
    return todosLosPagos.reduce(
      (acc, pago) => {
        acc.total += pago.monto;
        if (pago.estado === "completado") {
          acc.completados += 1;
          acc.montoCompletado += pago.monto;
        } else if (pago.estado === "pendiente") {
          acc.pendientes += 1;
          acc.montoPendiente += pago.monto;
        }
        return acc;
      },
      {
        total: 0,
        completados: 0,
        pendientes: 0,
        montoCompletado: 0,
        montoPendiente: 0,
      },
    );
  }, []);

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
                {totalPagos}{" "}
                {totalPagos === 1
                  ? t("paymentRecorded")
                  : t("paymentsRecorded")}
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

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brown-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div>
                  <DollarSign className="h-8 w-8 text-gold-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-500 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-bold text-brown-900">
                    {formatCOP(stats.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-gold-50 to-white rounded-2xl p-6 shadow-sm border border-gold-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div>
                  <CheckCircle className="h-8 w-8 text-gold-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gold-700 uppercase tracking-wide">
                    {t("estados.completado")}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gold-900">
                    {formatCOP(stats.montoCompletado)}
                  </p>
                  <p className="text-xs text-gold-600 mt-1">
                    {stats.completados}{" "}
                    {stats.completados === 1
                      ? t("paymentRecorded")
                      : t("paymentsRecorded")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-brown-50 to-white rounded-2xl p-6 shadow-sm border border-brown-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div>
                  <TrendingUp className="h-8 w-8 text-brown-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-600 uppercase tracking-wide">
                    {t("estados.pendiente")}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-brown-800">
                    {formatCOP(stats.montoPendiente)}
                  </p>
                  <p className="text-xs text-brown-600 mt-1">
                    {stats.pendientes}{" "}
                    {stats.pendientes === 1
                      ? t("paymentRecorded")
                      : t("paymentsRecorded")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brown-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div>
                  <CreditCard className="h-8 w-8 text-brown-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-500 uppercase tracking-wide">
                    Registros
                  </p>
                  <p className="mt-2 text-2xl font-bold text-brown-900">
                    {totalPagos}
                  </p>
                  <p className="text-xs text-brown-500 mt-1">
                    {t("paymentsRecorded")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <PagosList
            pagos={pagos}
            filtroTexto={filtroTexto}
            onFiltroTextoChange={(val: string) => {
              setFiltroTexto(val);
              setPagina(1);
            }}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={(val: EstadoPago | "") => {
              setFiltroEstado(val);
              setPagina(1);
            }}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
            onEditar={abrirFormularioEditar}
            onAnular={abrirModalAnular}
          />
        </div>

        <PagoForm
          isOpen={isFormOpen}
          onClose={cerrarFormulario}
          onSubmit={crearPago}
          onEdit={editarPago}
          pagoInicial={pagoSeleccionado}
          reservas={reservas}
          clientes={clientes}
        />

        <AnularPagoModal
          pago={pagoAAnular}
          reserva={reservaAAnular}
          cliente={clienteAAnular}
          onConfirmar={anularPago}
          onCerrar={cerrarModalAnular}
        />
      </div>
    </AdminShell>
  );
}
