import { renderHook, act } from '@testing-library/react';
import { useCheckin } from '../hooks/useCheckin';
import type { Checkin, Reserva, Cliente } from '@/types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const HOY = '2026-03-21';

const clienteMock: Cliente = {
  id: 'c-001',
  nombre: 'Valentina',
  apellido: 'Gómez',
  tipoDocumento: 'CC',
  numeroDocumento: '1020345678',
  correo: 'valentina@test.com',
  telefono: '+57 310 000 0000',
  nacionalidad: 'Colombiana',
  fechaNacimiento: '1992-04-15',
  estado: 'activo',
  creadoEn: '2025-01-01T00:00:00.000Z',
};

/**
 * Reserva elegible para check-in:
 * - estado 'confirmada'
 * - fechaEntrada == HOY (dentro de ±1 día)
 */
const reservaElegible: Reserva = {
  id: 'r-test-001',
  clienteId: 'c-001',
  habitacionNumero: '201',
  tipoHabitacion: 'DOBLE',
  fechaEntrada: HOY,
  fechaSalida: '2026-03-24',
  numeroHuespedes: 2,
  estado: 'confirmada',
  total: 450000,
  creadoEn: '2026-03-01T00:00:00.000Z',
};

const reservaNoElegible: Reserva = {
  ...reservaElegible,
  id: 'r-test-002',
  habitacionNumero: '202',
  estado: 'pendiente', // no confirmada → no elegible
};

const checkinCompletado: Checkin = {
  id: 'k-001',
  reservaId: 'r-test-001',
  clienteId: 'c-001',
  habitacionNumero: '201',
  fechaHoraCheckin: '2026-03-21T14:00:00.000Z',
  fechaEsperadaCheckout: '2026-03-24',
  numeroAcompanantes: 1,
  estado: 'completado',
};

const checkinPendiente: Checkin = {
  ...checkinCompletado,
  id: 'k-002',
  reservaId: 'r-test-002',
  habitacionNumero: '202',
  fechaHoraCheckin: null,
  estado: 'pendiente',
};

const checkinAnulado: Checkin = {
  ...checkinCompletado,
  id: 'k-003',
  reservaId: 'r-test-003',
  habitacionNumero: '203',
  estado: 'anulado',
  motivoAnulacion: 'Error previo',
  fechaAnulacion: '2026-03-21T15:00:00.000Z',
};

// ── HU-K1: Listar check-ins ───────────────────────────────────────────────────

describe('HU-K1: Listar check-ins', () => {
  /**
   * Escenario 1: Con tres check-ins y sin filtro activo, se devuelven todos.
   */
  it('retorna todos los check-ins cuando no hay filtro activo', () => {
    const { result } = renderHook(() =>
      useCheckin(
        [checkinCompletado, checkinPendiente, checkinAnulado],
        [reservaElegible],
        [clienteMock],
      ),
    );

    expect(result.current.checkins).toHaveLength(3);
    expect(result.current.totalCheckins).toBe(3);
  });

  /**
   * Escenario 2: Al filtrar por 'completado', solo aparecen los completados.
   */
  it('filtra correctamente por estado completado', () => {
    const { result } = renderHook(() =>
      useCheckin(
        [checkinCompletado, checkinPendiente, checkinAnulado],
        [reservaElegible],
        [clienteMock],
      ),
    );

    act(() => {
      result.current.setFiltroEstado('completado');
    });

    expect(result.current.checkins).toHaveLength(1);
    expect(result.current.checkins[0].checkin.estado).toBe('completado');
  });

  /**
   * Escenario 3: pendientesHoy cuenta únicamente los check-ins en estado 'pendiente'.
   */
  it('pendientesHoy cuenta solo los check-ins en estado pendiente', () => {
    const { result } = renderHook(() =>
      useCheckin(
        [checkinCompletado, checkinPendiente, checkinAnulado],
        [],
        [],
      ),
    );

    expect(result.current.pendientesHoy).toBe(1);
  });
});

// ── HU-K2: Registrar check-in ─────────────────────────────────────────────────

describe('HU-K2: Registrar check-in', () => {
  /**
   * Escenario 1: Reserva confirmada con fecha de hoy → check-in registrado exitosamente.
   */
  it('registra el check-in exitosamente para una reserva elegible', () => {
    const { result } = renderHook(() =>
      useCheckin([], [reservaElegible], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.registrarCheckin(reservaElegible.id, HOY);
    });

    expect(respuesta.ok).toBe(true);
    expect(result.current.totalCheckins).toBe(1);
    expect(result.current.checkins[0].checkin.estado).toBe('completado');
    expect(result.current.checkins[0].checkin.habitacionNumero).toBe('201');
  });

  /**
   * Escenario 2: Ya existe un check-in completado para esa reserva → error 'yaRealizado'.
   */
  it('retorna error yaRealizado cuando ya existe un check-in completado para esa reserva', () => {
    const { result } = renderHook(() =>
      useCheckin([checkinCompletado], [reservaElegible], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string; hora?: string };
    act(() => {
      respuesta = result.current.registrarCheckin(reservaElegible.id, HOY);
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('yaRealizado');
    expect(respuesta.hora).toBe('2026-03-21T14:00:00.000Z');
  });

  /**
   * Escenario 3: La reserva no está confirmada → error 'sinReserva'.
   */
  it('retorna error sinReserva cuando la reserva no está en estado confirmada', () => {
    const { result } = renderHook(() =>
      useCheckin([], [reservaNoElegible], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.registrarCheckin(reservaNoElegible.id, HOY);
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('sinReserva');
  });
});

// ── HU-K3: Actualizar check-in ────────────────────────────────────────────────

describe('HU-K3: Actualizar check-in', () => {
  /**
   * Escenario 1: Actualizar observaciones modifica el campo correctamente.
   */
  it('actualiza las observaciones del check-in exitosamente', () => {
    const { result } = renderHook(() =>
      useCheckin([checkinCompletado], [reservaElegible], [clienteMock]),
    );

    act(() => {
      result.current.actualizarCheckin(checkinCompletado.id, {
        observaciones: 'Huésped VIP — atención prioritaria',
        numeroAcompanantes: checkinCompletado.numeroAcompanantes,
        habitacionNumero: checkinCompletado.habitacionNumero,
      });
    });

    const actualizado = result.current.checkins[0].checkin;
    expect(actualizado.observaciones).toBe('Huésped VIP — atención prioritaria');
    // fechaHoraCheckin no debe modificarse (es inmutable)
    expect(actualizado.fechaHoraCheckin).toBe(checkinCompletado.fechaHoraCheckin);
  });

  /**
   * Escenario 2: Actualizar el número de acompañantes cambia solo ese campo.
   */
  it('actualiza el número de acompañantes sin modificar otros campos', () => {
    const { result } = renderHook(() =>
      useCheckin([checkinCompletado], [reservaElegible], [clienteMock]),
    );

    act(() => {
      result.current.actualizarCheckin(checkinCompletado.id, {
        observaciones: checkinCompletado.observaciones ?? '',
        numeroAcompanantes: 3,
        habitacionNumero: checkinCompletado.habitacionNumero,
      });
    });

    const actualizado = result.current.checkins[0].checkin;
    expect(actualizado.numeroAcompanantes).toBe(3);
    expect(actualizado.habitacionNumero).toBe('201'); // sin cambios
  });

  /**
   * Escenario 3: Abrir y cerrar el formulario sin guardar no modifica el check-in.
   */
  it('no modifica el check-in al cerrar el formulario sin guardar', () => {
    const { result } = renderHook(() =>
      useCheckin([checkinCompletado], [reservaElegible], [clienteMock]),
    );

    act(() => {
      result.current.abrirActualizar(checkinCompletado);
    });
    expect(result.current.isActualizarOpen).toBe(true);
    expect(result.current.checkinSeleccionado?.id).toBe(checkinCompletado.id);

    act(() => {
      result.current.cerrarActualizar();
    });
    expect(result.current.isActualizarOpen).toBe(false);
    expect(result.current.checkinSeleccionado).toBeNull();
    // Estado original intacto
    expect(result.current.checkins[0].checkin.numeroAcompanantes).toBe(1);
  });
});

// ── HU-K4: Anular check-in ────────────────────────────────────────────────────

describe('HU-K4: Anular check-in', () => {
  /**
   * Escenario 1: Anular con motivo válido cambia el estado a 'anulado' y registra el motivo.
   */
  it('anula el check-in correctamente cuando el motivo no está vacío', () => {
    const { result } = renderHook(() =>
      useCheckin([checkinCompletado], [reservaElegible], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.anularCheckin(
        checkinCompletado.id,
        'Error de registro — el huésped ingresó por otra recepción',
      );
    });

    expect(respuesta.ok).toBe(true);
    const anulado = result.current.checkins[0].checkin;
    expect(anulado.estado).toBe('anulado');
    expect(anulado.motivoAnulacion).toBe(
      'Error de registro — el huésped ingresó por otra recepción',
    );
    expect(anulado.fechaAnulacion).toBeDefined();
  });

  /**
   * Escenario 2: Intentar anular sin motivo retorna error 'motivoRequerido'.
   */
  it('retorna error motivoRequerido cuando el motivo está vacío', () => {
    const { result } = renderHook(() =>
      useCheckin([checkinCompletado], [reservaElegible], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.anularCheckin(checkinCompletado.id, '   ');
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('motivoRequerido');
    // Estado original intacto
    expect(result.current.checkins[0].checkin.estado).toBe('completado');
  });

  /**
   * Escenario 3: Abrir y cerrar el modal de anulación sin confirmar no modifica el check-in.
   */
  it('mantiene el check-in en su estado original al cancelar la anulación', () => {
    const { result } = renderHook(() =>
      useCheckin([checkinCompletado], [reservaElegible], [clienteMock]),
    );

    act(() => {
      result.current.abrirAnular(checkinCompletado);
    });
    expect(result.current.checkinAAnular?.id).toBe(checkinCompletado.id);

    act(() => {
      result.current.cerrarAnular();
    });
    expect(result.current.checkinAAnular).toBeNull();
    // Estado original intacto
    expect(result.current.checkins[0].checkin.estado).toBe('completado');
  });
});
