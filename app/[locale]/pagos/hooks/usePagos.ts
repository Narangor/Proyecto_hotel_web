"use client";

import { useState, useMemo } from "react";
import { MOCK_PAGOS, MOCK_RESERVAS, MOCK_CLIENTES } from "@/lib/mock-data";
import type { Pago, PagoFormData, EstadoPago, Reserva, Cliente } from "@/types";
import { PAGO_ESTADOS_EDITABLES, PAGO_ESTADOS_ANULABLES } from "@/types";

function generarId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface PagoConRelaciones {
  pago: Pago;
  reserva: Reserva | undefined;
  cliente: Cliente | undefined;
}

/**
 * usePagos - hook central del módulo de Gestión de Pagos.
 *
 * Responsabilidades:
 * - Estado: lista de pagos, filtros (texto + estado), paginación, UI
 * - CRUD: crearPago, editarPago, anularPago
 * - Validaciones de negocio:
 *     - El monto debe ser mayor a cero
 *     - La fecha de pago es requerida
 *     - Solo se pueden editar pagos en estado pendiente
 *     - Solo se pueden anular pagos en estados anulables
 *
 * @param initialPagos  - Lista inicial (default: MOCK_PAGOS)
 * @param reservas      - Reservas para resolución (default: MOCK_RESERVAS)
 * @param clientes      - Clientes para resolución (default: MOCK_CLIENTES)
 */
export function usePagos(
  initialPagos: Pago[] = MOCK_PAGOS,
  reservas: Reserva[] = MOCK_RESERVAS,
  clientes: Cliente[] = MOCK_CLIENTES,
) {
  const ITEMS_POR_PAGINA = 10;

  // Estado de datos
  const [pagos, setPagos] = useState<Pago[]>(initialPagos);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPago | "">("");
  const [pagina, setPagina] = useState(1);

  // Estado de UI
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);
  const [pagoAAnular, setPagoAAnular] = useState<Pago | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Derivación: pagos con datos de reserva y cliente resueltos
  const pagosConRelaciones = useMemo<PagoConRelaciones[]>(() => {
    const reservaMap = new Map(reservas.map((r) => [r.id, r]));
    const clienteMap = new Map(clientes.map((c) => [c.id, c]));
    return pagos.map((p) => {
      const reserva = reservaMap.get(p.reservaId);
      const cliente = reserva ? clienteMap.get(reserva.clienteId) : undefined;
      return { pago: p, reserva, cliente };
    });
  }, [pagos, reservas, clientes]);

  // Filtrado y ordenación
  const pagosFiltrados = useMemo<PagoConRelaciones[]>(() => {
    let resultado = pagosConRelaciones;

    if (filtroTexto.trim()) {
      const termino = filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(({ pago, reserva, cliente }) => {
        const nombreCliente = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
          : "";
        const reservaId = reserva?.id.toLowerCase() ?? "";
        const habitacion = reserva?.habitacionNumero ?? "";
        return (
          nombreCliente.includes(termino) ||
          reservaId.includes(termino) ||
          habitacion.includes(termino) ||
          pago.id.toLowerCase().includes(termino) ||
          (pago.referencia?.toLowerCase().includes(termino) ?? false)
        );
      });
    }

    if (filtroEstado) {
      resultado = resultado.filter(({ pago }) => pago.estado === filtroEstado);
    }

    return [...resultado].sort((a, b) =>
      b.pago.fecha.localeCompare(a.pago.fecha),
    );
  }, [pagosConRelaciones, filtroTexto, filtroEstado]);

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(pagosFiltrados.length / ITEMS_POR_PAGINA),
  );
  const pagosPaginados = pagosFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  // Validaciones de negocio

  function montoValido(monto: number): boolean {
    return typeof monto === "number" && monto > 0;
  }

  // CRUD

  function crearPago(data: PagoFormData): { ok: boolean; error?: string } {
    if (!data.reservaId) {
      return { ok: false, error: "reservaRequerida" };
    }
    if (!montoValido(data.monto)) {
      return { ok: false, error: "montoInvalido" };
    }
    if (!data.fecha) {
      return { ok: false, error: "fechaRequerida" };
    }

    const nuevo: Pago = {
      ...data,
      id: generarId(),
      estado: "pendiente",
      creadoEn: new Date().toISOString(),
    };
    setPagos((prev) => [nuevo, ...prev]);
    setPagina(1);
    return { ok: true };
  }

  function editarPago(
    id: string,
    data: PagoFormData,
  ): { ok: boolean; error?: string } {
    const pagoActual = pagos.find((p) => p.id === id);
    if (!pagoActual || !PAGO_ESTADOS_EDITABLES.includes(pagoActual.estado)) {
      return { ok: false, error: "noEditable" };
    }
    if (!montoValido(data.monto)) {
      return { ok: false, error: "montoInvalido" };
    }
    if (!data.fecha) {
      return { ok: false, error: "fechaRequerida" };
    }

    setPagos((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    return { ok: true };
  }

  function anularPago(
    id: string,
    motivo?: string,
  ): { ok: boolean; error?: string } {
    const pagoActual = pagos.find((p) => p.id === id);
    if (!pagoActual || !PAGO_ESTADOS_ANULABLES.includes(pagoActual.estado)) {
      return { ok: false, error: "noAnulable" };
    }

    setPagos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, estado: "anulado", motivoAnulacion: motivo ?? "" }
          : p,
      ),
    );
    return { ok: true };
  }

  // Controles de UI

  function abrirFormularioCrear() {
    setPagoSeleccionado(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(pago: Pago) {
    setPagoSeleccionado(pago);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setPagoSeleccionado(null);
  }

  function abrirModalAnular(pago: Pago) {
    setPagoAAnular(pago);
  }

  function cerrarModalAnular() {
    setPagoAAnular(null);
  }

  return {
    // Datos
    pagos: pagosPaginados,
    pagosFiltrados,
    totalPagos: pagos.length,
    reservas,
    clientes,
    // Filtros y paginación
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    // Estado UI
    pagoSeleccionado,
    pagoAAnular,
    isFormOpen,
    // Acciones datos
    crearPago,
    editarPago,
    anularPago,
    // Acciones UI
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalAnular,
    cerrarModalAnular,
  };
}
