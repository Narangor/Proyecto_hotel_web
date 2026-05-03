import { renderHook, act } from '@testing-library/react';
import { useReservas, calcularTotal } from '../hooks/useReservas';
import type { Reserva, Cliente } from '@/types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

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

const reservaConfirmada: Reserva = {
  id: 'r-001',
  clienteId: 'c-001',
  habitacionNumero: '201',
  tipoHabitacion: 'DOBLE',
  fechaEntrada: '2026-04-10',
  fechaSalida: '2026-04-13',
  numeroHuespedes: 2,
  estado: 'confirmada',
  total: 450000,
  creadoEn: '2026-03-01T00:00:00.000Z',
};

const reservaCancelada: Reserva = {
  ...reservaConfirmada,
  id: 'r-002',
  habitacionNumero: '202',
  estado: 'cancelada',
};

const reservaPendiente: Reserva = {
  ...reservaConfirmada,
  id: 'r-003',
  habitacionNumero: '203',
  fechaEntrada: '2026-05-01',
  fechaSalida: '2026-05-05',
  estado: 'pendiente',
};

const nuevaReservaData = {
  clienteId: 'c-001',
  habitacionNumero: '301',
  tipoHabitacion: 'SUITE' as const,
  fechaEntrada: '2026-06-01',
  fechaSalida: '2026-06-03',
  numeroHuespedes: 1,
  observaciones: '',
};

// ── HU-R1: Listar reservas ────────────────────────────────────────────────────

describe('HU-R1: Listar reservas', () => {
  /**
   * Escenario 1: Dado que existen reservas, todas aparecen en reservasFiltradas.
   */
  it('retorna todas las reservas ordenadas por fecha de entrada', () => {
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada, reservaPendiente], [clienteMock]),
    );

    expect(result.current.reservasFiltradas).toHaveLength(2);
    // Ordenadas por fechaEntrada: confirmada (abril) primero, pendiente (mayo) después
    expect(result.current.reservasFiltradas[0].reserva.id).toBe('r-001');
    expect(result.current.reservasFiltradas[1].reserva.id).toBe('r-003');
  });

  /**
   * Escenario 2: Filtrar por estado 'cancelada' muestra solo esas reservas.
   */
  it('filtra correctamente por estado', () => {
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada, reservaCancelada], [clienteMock]),
    );

    act(() => {
      result.current.setFiltroEstado('cancelada');
    });

    expect(result.current.reservasFiltradas).toHaveLength(1);
    expect(result.current.reservasFiltradas[0].reserva.estado).toBe('cancelada');
  });

  /**
   * Escenario 3: Lista vacía cuando no hay reservas que coincidan con el filtro.
   */
  it('retorna lista vacía cuando ninguna reserva coincide con el filtro de texto', () => {
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada], [clienteMock]),
    );

    act(() => {
      result.current.setFiltroTexto('huésped que no existe xyz');
    });

    expect(result.current.reservasFiltradas).toHaveLength(0);
  });
});

// ── HU-R2: Crear reserva ──────────────────────────────────────────────────────

describe('HU-R2: Crear reserva', () => {
  /**
   * Escenario 1: Habitación disponible + fechas válidas → reserva creada con estado 'pendiente'.
   */
  it('crea la reserva exitosamente con habitación disponible y fechas válidas', () => {
    const { result } = renderHook(() => useReservas([], [clienteMock]));

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.crearReserva(nuevaReservaData);
    });

    expect(respuesta.ok).toBe(true);
    expect(result.current.totalReservas).toBe(1);
    expect(result.current.reservasFiltradas[0].reserva.estado).toBe('pendiente');
  });

  /**
   * Escenario 2: Habitación ocupada en el mismo rango de fechas → error 'habitacionNoDisponible'.
   */
  it('retorna error habitacionNoDisponible cuando la habitación ya está ocupada en esas fechas', () => {
    // reservaConfirmada ocupa hab. 201 del 10 al 13 de abril
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.crearReserva({
        ...nuevaReservaData,
        habitacionNumero: '201', // misma habitación
        fechaEntrada: '2026-04-11', // se solapa
        fechaSalida: '2026-04-14',
      });
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('habitacionNoDisponible');
  });

  /**
   * Escenario 3: Fecha de salida anterior a la de entrada → error 'fechasInvalidas'.
   */
  it('retorna error fechasInvalidas cuando la fecha de salida es anterior a la de entrada', () => {
    const { result } = renderHook(() => useReservas([], [clienteMock]));

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.crearReserva({
        ...nuevaReservaData,
        fechaEntrada: '2026-06-10',
        fechaSalida: '2026-06-05', // salida < entrada
      });
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('fechasInvalidas');
  });
});

// ── HU-R3: Editar reserva ─────────────────────────────────────────────────────

describe('HU-R3: Editar reserva', () => {
  /**
   * Escenario 1: Editar una reserva confirmada con fechas válidas actualiza el total.
   */
  it('edita la reserva y recalcula el total correctamente', () => {
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada], [clienteMock]),
    );

    act(() => {
      result.current.editarReserva(reservaConfirmada.id, {
        ...nuevaReservaData,
        habitacionNumero: '201',
        tipoHabitacion: 'DOBLE',
        fechaEntrada: '2026-04-10',
        fechaSalida: '2026-04-15', // 5 noches en lugar de 3
      });
    });

    const reservaEditada = result.current.reservasFiltradas.find(
      ({ reserva }) => reserva.id === reservaConfirmada.id,
    );
    expect(reservaEditada?.reserva.fechaSalida).toBe('2026-04-15');
    // DOBLE = 150.000 × 5 noches = 750.000
    expect(reservaEditada?.reserva.total).toBe(750000);
  });

  /**
   * Escenario 2: Al editar con nueva habitación no disponible, retorna error.
   */
  it('retorna error habitacionNoDisponible al editar con habitación ocupada', () => {
    const reservaOcupante: Reserva = {
      ...reservaConfirmada,
      id: 'r-ocupante',
      habitacionNumero: '202',
    };
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada, reservaOcupante], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.editarReserva(reservaConfirmada.id, {
        ...nuevaReservaData,
        habitacionNumero: '202', // ocupada por r-ocupante en las mismas fechas
        tipoHabitacion: 'DOBLE',
        fechaEntrada: '2026-04-10',
        fechaSalida: '2026-04-13',
      });
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('habitacionNoDisponible');
  });

  /**
   * Escenario 3: Cancelar el formulario (cerrarFormulario) no modifica la reserva.
   */
  it('no modifica la reserva al cerrar el formulario sin guardar', () => {
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada], [clienteMock]),
    );

    act(() => {
      result.current.abrirFormularioEditar(reservaConfirmada);
    });
    expect(result.current.isFormOpen).toBe(true);

    act(() => {
      result.current.cerrarFormulario();
    });
    expect(result.current.isFormOpen).toBe(false);

    const reservaSinCambios = result.current.reservasFiltradas[0];
    expect(reservaSinCambios.reserva.fechaSalida).toBe(reservaConfirmada.fechaSalida);
  });
});

// ── HU-R4: Cancelar reserva ───────────────────────────────────────────────────

describe('HU-R4: Cancelar reserva', () => {
  /**
   * Escenario 1: Cancelar una reserva confirmada cambia su estado a 'cancelada'.
   */
  it('cambia el estado de la reserva a cancelada exitosamente', () => {
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada], [clienteMock]),
    );

    act(() => {
      result.current.cancelarReserva(reservaConfirmada.id, 'Cambio de planes');
    });

    const reservaCancelada = result.current.reservasFiltradas.find(
      ({ reserva }) => reserva.id === reservaConfirmada.id,
    );
    expect(reservaCancelada?.reserva.estado).toBe('cancelada');
    expect(reservaCancelada?.reserva.motivoCancelacion).toBe('Cambio de planes');
  });

  /**
   * Escenario 2: Intentar cancelar una reserva ya cancelada retorna error 'noCancelable'.
   */
  it('retorna error noCancelable al intentar cancelar una reserva ya cancelada', () => {
    const { result } = renderHook(() =>
      useReservas([reservaCancelada], [clienteMock]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.cancelarReserva(reservaCancelada.id);
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('noCancelable');
  });

  /**
   * Escenario 3: Cerrar el modal de cancelación sin confirmar mantiene la reserva intacta.
   */
  it('mantiene la reserva en su estado original al cerrar el modal sin confirmar', () => {
    const { result } = renderHook(() =>
      useReservas([reservaConfirmada], [clienteMock]),
    );

    act(() => {
      result.current.abrirModalCancelar(reservaConfirmada);
    });
    expect(result.current.reservaACancelar?.id).toBe(reservaConfirmada.id);

    act(() => {
      result.current.cerrarModalCancelar();
    });
    expect(result.current.reservaACancelar).toBeNull();
    // Estado original intacto
    expect(result.current.reservasFiltradas[0].reserva.estado).toBe('confirmada');
  });
});

// ── Utilidad calcularTotal ────────────────────────────────────────────────────

describe('calcularTotal', () => {
  it('calcula correctamente el total para 3 noches en habitación DOBLE', () => {
    // DOBLE = 150.000/noche × 3 noches = 450.000
    expect(calcularTotal('DOBLE', '2026-04-10', '2026-04-13')).toBe(450000);
  });

  it('retorna 0 cuando las fechas son inválidas', () => {
    expect(calcularTotal('SUITE', '2026-04-13', '2026-04-10')).toBe(0);
  });
});
