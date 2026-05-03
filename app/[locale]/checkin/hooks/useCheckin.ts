'use client';

import { useState, useMemo } from 'react';
import { MOCK_CHECKINS, MOCK_RESERVAS, MOCK_CLIENTES } from '@/lib/mock-data';
import { storeCheckin } from '@/lib/booking-store';
import type {
  Checkin,
  CheckinUpdateData,
  Cliente,
  Reserva,
  EstadoCheckin,
} from '@/types';

function generarId(): string {
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Diferencia en días entre dos fechas ISO (valor absoluto). */
function diffDias(iso1: string, iso2: string): number {
  return Math.abs(
    Math.ceil(
      (new Date(iso1).getTime() - new Date(iso2).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}

export interface CheckinConDatos {
  checkin: Checkin;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
}

/**
 * useCheckin — hook central del módulo de Check-in Digital.
 *
 * Responsabilidades:
 * - Estado: lista de check-ins, filtro por estado, UI (modales abiertos).
 * - Derivación: `checkins` resuelve cliente y reserva para cada registro.
 * - Contador `pendientesHoy`: check-ins en estado 'pendiente'.
 * - `reservasElegibles`: reservas 'confirmadas' cuya fecha de entrada
 *    está dentro de ±1 día de hoy y sin check-in completado previo.
 * - registrarCheckin: valida reserva elegible, registra entrada con timestamp.
 * - actualizarCheckin: edita observaciones, acompañantes y habitación.
 * - anularCheckin: requiere motivo, marca como 'anulado' con historial.
 *
 * El parámetro `hoy` en `registrarCheckin` es inyectable para que los
 * tests unitarios sean determinísticos sin depender de `new Date()`.
 *
 * @param initialCheckins - Lista inicial (default: MOCK_CHECKINS)
 * @param reservas        - Para validación y resolución (default: MOCK_RESERVAS)
 * @param clientes        - Para resolución de nombres (default: MOCK_CLIENTES)
 */
export function useCheckin(
  initialCheckins: Checkin[] = MOCK_CHECKINS,
  reservas: Reserva[] = MOCK_RESERVAS,
  clientes: Cliente[] = MOCK_CLIENTES,
) {
  // ── Estado de datos ──
  const [checkins, setCheckins] = useState<Checkin[]>(initialCheckins);
  const [filtroEstado, setFiltroEstado] = useState<EstadoCheckin | ''>('');

  // ── Estado de UI ──
  const [checkinSeleccionado, setCheckinSeleccionado] = useState<Checkin | null>(null);
  const [checkinAAnular, setCheckinAAnular] = useState<Checkin | null>(null);
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [isActualizarOpen, setIsActualizarOpen] = useState(false);

  // ── Lookups precalculados para resolución O(1) ──
  const clienteMap = useMemo(
    () => new Map(clientes.map((c) => [c.id, c])),
    [clientes],
  );
  const reservaMap = useMemo(
    () => new Map(reservas.map((r) => [r.id, r])),
    [reservas],
  );

  // ── Check-ins con datos resueltos ──
  const checkinsConDatos = useMemo<CheckinConDatos[]>(
    () =>
      checkins.map((c) => ({
        checkin: c,
        cliente: clienteMap.get(c.clienteId),
        reserva: reservaMap.get(c.reservaId),
      })),
    [checkins, clienteMap, reservaMap],
  );

  // ── Filtrado ──
  const checkinsFiltrados = useMemo<CheckinConDatos[]>(() => {
    if (!filtroEstado) return checkinsConDatos;
    return checkinsConDatos.filter(({ checkin }) => checkin.estado === filtroEstado);
  }, [checkinsConDatos, filtroEstado]);

  // ── Contador de pendientes ──
  const pendientesHoy = useMemo(
    () => checkins.filter((c) => c.estado === 'pendiente').length,
    [checkins],
  );

  /**
   * Reservas elegibles para registrar check-in:
   * - Estado 'confirmada'
   * - Fecha de entrada dentro de ±1 día de hoy
   * - Sin check-in 'completado' previo para esa reserva
   */
  const reservasElegibles = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const reservaIdsCompletadas = new Set(
      checkins
        .filter((c) => c.estado === 'completado')
        .map((c) => c.reservaId),
    );
    return reservas.filter(
      (r) =>
        r.estado === 'confirmada' &&
        !reservaIdsCompletadas.has(r.id) &&
        diffDias(r.fechaEntrada, hoy) <= 1,
    );
  }, [checkins, reservas]);

  // ── CRUD ──

  /**
   * Registra el check-in de un huésped.
   *
   * @param reservaId - ID de la reserva a registrar
   * @param hoy       - Fecha de hoy en formato ISO (inyectable para tests)
   */
  function registrarCheckin(
    reservaId: string,
    hoy: string = new Date().toISOString().split('T')[0],
  ): { ok: boolean; error?: string; hora?: string } {
    const reserva = reservaMap.get(reservaId);

    // Validar que la reserva existe y está confirmada
    if (!reserva || reserva.estado !== 'confirmada') {
      return { ok: false, error: 'sinReserva' };
    }

    // Validar que la fecha de entrada es hoy ±1 día
    if (diffDias(reserva.fechaEntrada, hoy) > 1) {
      return { ok: false, error: 'sinReserva' };
    }

    // Validar que no existe ya un check-in completado para esta reserva
    const checkinPrevio = checkins.find(
      (c) => c.reservaId === reservaId && c.estado === 'completado',
    );
    if (checkinPrevio) {
      return {
        ok: false,
        error: 'yaRealizado',
        hora: checkinPrevio.fechaHoraCheckin ?? '',
      };
    }

    const nuevo: Checkin = {
      id: generarId(),
      reservaId,
      clienteId: reserva.clienteId,
      habitacionNumero: reserva.habitacionNumero,
      fechaHoraCheckin: new Date().toISOString(),
      fechaEsperadaCheckout: reserva.fechaSalida,
      numeroAcompanantes: 0,
      estado: 'completado',
    };

    setCheckins((prev) => [nuevo, ...prev]);
    storeCheckin(nuevo);
    return { ok: true };
  }

  /**
   * Actualiza datos editables de un check-in existente.
   * La fecha/hora de check-in (fechaHoraCheckin) es inmutable —
   * no se puede pasar en `data` por diseño del tipo CheckinUpdateData.
   */
  function actualizarCheckin(
    id: string,
    data: CheckinUpdateData,
  ): { ok: boolean } {
    const checkinActual = checkins.find((c) => c.id === id);
    setCheckins((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
    if (checkinActual) {
      storeCheckin({ ...checkinActual, ...data });
    }
    return { ok: true };
  }

  /**
   * Anula un check-in. El motivo es obligatorio.
   * Registra la fecha/hora de anulación para el historial.
   *
   * En Ciclo 2, esta acción también revertirá la reserva asociada
   * a estado 'confirmada' mediante la API del backend.
   */
  function anularCheckin(
    id: string,
    motivo: string,
  ): { ok: boolean; error?: string } {
    if (!motivo.trim()) {
      return { ok: false, error: 'motivoRequerido' };
    }

    const checkinActual = checkins.find((c) => c.id === id);
    const anulado: Checkin | null = checkinActual
      ? {
          ...checkinActual,
          estado: 'anulado' as EstadoCheckin,
          motivoAnulacion: motivo.trim(),
          fechaAnulacion: new Date().toISOString(),
        }
      : null;

    setCheckins((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              estado: 'anulado' as EstadoCheckin,
              motivoAnulacion: motivo.trim(),
              fechaAnulacion: new Date().toISOString(),
            }
          : c,
      ),
    );
    if (anulado) storeCheckin(anulado);
    return { ok: true };
  }

  // ── Controles de UI ──

  function abrirRegistrar() {
    setIsRegistrarOpen(true);
  }
  function cerrarRegistrar() {
    setIsRegistrarOpen(false);
  }

  function abrirActualizar(checkin: Checkin) {
    setCheckinSeleccionado(checkin);
    setIsActualizarOpen(true);
  }
  function cerrarActualizar() {
    setIsActualizarOpen(false);
    setCheckinSeleccionado(null);
  }

  function abrirAnular(checkin: Checkin) {
    setCheckinAAnular(checkin);
  }
  function cerrarAnular() {
    setCheckinAAnular(null);
  }

  return {
    // Datos
    checkins: checkinsFiltrados,
    totalCheckins: checkins.length,
    pendientesHoy,
    reservasElegibles,
    clientes,
    clienteMap,
    // Filtro
    filtroEstado,
    setFiltroEstado,
    // Estado UI
    checkinSeleccionado,
    checkinAAnular,
    isRegistrarOpen,
    isActualizarOpen,
    // Acciones de datos
    registrarCheckin,
    actualizarCheckin,
    anularCheckin,
    // Acciones de UI
    abrirRegistrar,
    cerrarRegistrar,
    abrirActualizar,
    cerrarActualizar,
    abrirAnular,
    cerrarAnular,
  };
}
