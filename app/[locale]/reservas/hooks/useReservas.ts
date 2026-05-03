'use client';

import { useState, useMemo } from 'react';
import { MOCK_RESERVAS, MOCK_CLIENTES, PRECIOS_HABITACION } from '@/lib/mock-data';
import { storeReserva } from '@/lib/booking-store';
import type { Cliente, Reserva, ReservaFormData, EstadoReserva, TipoHabitacion } from '@/types';
import { RESERVA_ESTADOS_EDITABLES, RESERVA_ESTADOS_CANCELABLES } from '@/types';

function generarId(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Número de noches entre dos fechas ISO. Retorna 0 si las fechas son inválidas. */
function calcularNoches(fechaEntrada: string, fechaSalida: string): number {
  const entrada = new Date(fechaEntrada).getTime();
  const salida = new Date(fechaSalida).getTime();
  if (isNaN(entrada) || isNaN(salida) || salida <= entrada) return 0;
  return Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
}

/** Precio total en COP según tipo de habitación y número de noches. */
export function calcularTotal(tipo: TipoHabitacion, fechaEntrada: string, fechaSalida: string): number {
  const noches = calcularNoches(fechaEntrada, fechaSalida);
  return (PRECIOS_HABITACION[tipo] ?? 0) * noches;
}

/**
 * Verifica solapamiento de fechas entre dos rangos.
 * Dos reservas se solapan si: entrada1 < salida2 Y salida1 > entrada2
 */
function fechasSeSolapan(
  e1: string, s1: string,
  e2: string, s2: string,
): boolean {
  return e1 < s2 && s1 > e2;
}

export interface ReservaConCliente {
  reserva: Reserva;
  cliente: Cliente | undefined;
}

/**
 * useReservas — hook central del módulo de Gestión de Reservas.
 *
 * Responsabilidades:
 * - Estado: lista de reservas, filtros (texto + estado), paginación, UI.
 * - CRUD: crearReserva, editarReserva, cancelarReserva.
 * - Validaciones de negocio:
 *     · fechaSalida debe ser posterior a fechaEntrada.
 *     · La habitación debe estar disponible en el rango de fechas.
 *     · Solo se pueden editar/cancelar reservas en estados editables.
 * - Derivación: `reservasConCliente` resuelve el clienteId → Cliente para la tabla.
 *
 * @param initialReservas - Lista inicial (default: MOCK_RESERVAS)
 * @param clientes        - Clientes para resolución de nombres (default: MOCK_CLIENTES)
 */
export function useReservas(
  initialReservas: Reserva[] = MOCK_RESERVAS,
  clientes: Cliente[] = MOCK_CLIENTES,
) {
  const ITEMS_POR_PAGINA = 10;

  // ── Estado de datos ──
  const [reservas, setReservas] = useState<Reserva[]>(initialReservas);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | ''>('');
  const [pagina, setPagina] = useState(1);

  // ── Estado de UI ──
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [reservaACancelar, setReservaACancelar] = useState<Reserva | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ── Derivación: reservas con datos del cliente resueltos ──
  const reservasConCliente = useMemo<ReservaConCliente[]>(() => {
    const clienteMap = new Map(clientes.map((c) => [c.id, c]));
    return reservas.map((r) => ({
      reserva: r,
      cliente: clienteMap.get(r.clienteId),
    }));
  }, [reservas, clientes]);

  // ── Filtrado y ordenación ──
  const reservasFiltradas = useMemo<ReservaConCliente[]>(() => {
    let resultado = reservasConCliente;

    if (filtroTexto.trim()) {
      const termino = filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(({ reserva, cliente }) => {
        const nombreCliente = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
          : '';
        return (
          nombreCliente.includes(termino) ||
          reserva.habitacionNumero.includes(termino) ||
          reserva.id.toLowerCase().includes(termino)
        );
      });
    }

    if (filtroEstado) {
      resultado = resultado.filter(({ reserva }) => reserva.estado === filtroEstado);
    }

    // Ordenar por fecha de entrada ascendente (más próximas primero)
    return [...resultado].sort((a, b) =>
      a.reserva.fechaEntrada.localeCompare(b.reserva.fechaEntrada),
    );
  }, [reservasConCliente, filtroTexto, filtroEstado]);

  // ── Paginación ──
  const totalPaginas = Math.max(1, Math.ceil(reservasFiltradas.length / ITEMS_POR_PAGINA));
  const reservasPaginadas = reservasFiltradas.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  // ── Validaciones de negocio ──

  /**
   * Verifica si una habitación está disponible en un rango de fechas.
   * Excluye la reserva con `excludeId` (para edición de la misma reserva).
   */
  function habitacionDisponible(
    habitacionNumero: string,
    fechaEntrada: string,
    fechaSalida: string,
    excludeId?: string,
  ): boolean {
    return !reservas.some(
      (r) =>
        r.id !== excludeId &&
        r.habitacionNumero === habitacionNumero &&
        r.estado !== 'cancelada' &&
        r.estado !== 'completada' &&
        fechasSeSolapan(fechaEntrada, fechaSalida, r.fechaEntrada, r.fechaSalida),
    );
  }

  function fechasValidas(fechaEntrada: string, fechaSalida: string): boolean {
    return (
      Boolean(fechaEntrada) &&
      Boolean(fechaSalida) &&
      fechaSalida > fechaEntrada
    );
  }

  // ── CRUD ──

  function crearReserva(data: ReservaFormData): { ok: boolean; error?: string } {
    if (!fechasValidas(data.fechaEntrada, data.fechaSalida)) {
      return { ok: false, error: 'fechasInvalidas' };
    }
    if (!habitacionDisponible(data.habitacionNumero, data.fechaEntrada, data.fechaSalida)) {
      return { ok: false, error: 'habitacionNoDisponible' };
    }

    const nueva: Reserva = {
      ...data,
      id: generarId(),
      estado: 'pendiente',
      total: calcularTotal(data.tipoHabitacion, data.fechaEntrada, data.fechaSalida),
      creadoEn: new Date().toISOString(),
    };
    setReservas((prev) => [nueva, ...prev]);
    storeReserva(nueva);
    setPagina(1);
    return { ok: true };
  }

  function editarReserva(
    id: string,
    data: ReservaFormData,
  ): { ok: boolean; error?: string } {
    const reservaActual = reservas.find((r) => r.id === id);
    if (!reservaActual || !RESERVA_ESTADOS_EDITABLES.includes(reservaActual.estado)) {
      return { ok: false, error: 'noEditable' };
    }
    if (!fechasValidas(data.fechaEntrada, data.fechaSalida)) {
      return { ok: false, error: 'fechasInvalidas' };
    }
    if (
      !habitacionDisponible(
        data.habitacionNumero,
        data.fechaEntrada,
        data.fechaSalida,
        id, // excluir la reserva actual del check de disponibilidad
      )
    ) {
      return { ok: false, error: 'habitacionNoDisponible' };
    }

    const reservaActualizada: Reserva = {
      ...reservaActual,
      ...data,
      total: calcularTotal(data.tipoHabitacion, data.fechaEntrada, data.fechaSalida),
    };
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? reservaActualizada : r)),
    );
    storeReserva(reservaActualizada);
    return { ok: true };
  }

  function cancelarReserva(id: string, motivo?: string): { ok: boolean; error?: string } {
    const reservaActual = reservas.find((r) => r.id === id);
    if (!reservaActual || !RESERVA_ESTADOS_CANCELABLES.includes(reservaActual.estado)) {
      return { ok: false, error: 'noCancelable' };
    }

    const reservaCancelada: Reserva = {
      ...reservaActual,
      estado: 'cancelada',
      motivoCancelacion: motivo ?? '',
    };
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? reservaCancelada : r)),
    );
    storeReserva(reservaCancelada);
    return { ok: true };
  }

  // ── Controles de UI ──

  function abrirFormularioCrear() {
    setReservaSeleccionada(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(reserva: Reserva) {
    setReservaSeleccionada(reserva);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setReservaSeleccionada(null);
  }

  function abrirModalCancelar(reserva: Reserva) {
    setReservaACancelar(reserva);
  }

  function cerrarModalCancelar() {
    setReservaACancelar(null);
  }

  return {
    // Datos
    reservas: reservasPaginadas,
    reservasFiltradas,
    totalReservas: reservas.length,
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
    reservaSeleccionada,
    reservaACancelar,
    isFormOpen,
    // Helpers
    calcularTotal,
    habitacionDisponible,
    // Acciones de datos
    crearReserva,
    editarReserva,
    cancelarReserva,
    // Acciones de UI
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalCancelar,
    cerrarModalCancelar,
  };
}
