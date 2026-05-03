import { renderHook, act } from '@testing-library/react';
import { useClientes } from '../hooks/useClientes';
import type { Cliente, Reserva } from '@/types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const clienteBase: Cliente = {
  id: 'c-test-1',
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

const otroCliente: Cliente = {
  ...clienteBase,
  id: 'c-test-2',
  nombre: 'James',
  apellido: 'Carter',
  numeroDocumento: 'A1234567',
  correo: 'james@test.com',
};

const nuevoClienteData = {
  nombre: 'Sofía',
  apellido: 'Martínez',
  tipoDocumento: 'CC' as const,
  numeroDocumento: '9998887776',
  correo: 'sofia@test.com',
  telefono: '+57 315 000 0000',
  nacionalidad: 'Colombiana',
  fechaNacimiento: '1998-07-22',
  estado: 'activo' as const,
};

const reservaActiva: Reserva = {
  id: 'r-test-1',
  clienteId: 'c-test-1',
  habitacionNumero: '201',
  tipoHabitacion: 'DOBLE',
  fechaEntrada: '2026-03-21',
  fechaSalida: '2026-03-24',
  numeroHuespedes: 1,
  estado: 'confirmada',
  total: 450000,
  creadoEn: '2026-03-10T00:00:00.000Z',
};

// ── HU-C1: Listar clientes ────────────────────────────────────────────────────

describe('HU-C1: Listar clientes', () => {
  /**
   * Escenario 1: Dado que existen clientes registrados,
   * cuando el recepcionista accede al módulo,
   * entonces se muestran todos los clientes en clientesFiltrados.
   */
  it('retorna todos los clientes cuando no hay filtro activo', () => {
    const { result } = renderHook(() =>
      useClientes([clienteBase, otroCliente], []),
    );

    expect(result.current.clientesFiltrados).toHaveLength(2);
    expect(result.current.totalClientes).toBe(2);
  });

  /**
   * Escenario 2: Dado que no hay clientes registrados,
   * cuando el recepcionista accede al módulo,
   * entonces clientesFiltrados está vacío y totalClientes es 0.
   */
  it('muestra lista vacía cuando no hay clientes registrados', () => {
    const { result } = renderHook(() => useClientes([], []));

    expect(result.current.clientesFiltrados).toHaveLength(0);
    expect(result.current.totalClientes).toBe(0);
  });

  /**
   * Escenario 3: Dado una lista de clientes con nombres distintos,
   * cuando el recepcionista escribe un nombre en el buscador,
   * entonces solo aparecen los clientes cuyo nombre coincide.
   */
  it('filtra clientes por nombre correctamente', () => {
    const { result } = renderHook(() =>
      useClientes([clienteBase, otroCliente], []),
    );

    act(() => {
      result.current.setFiltro('valentina');
    });

    expect(result.current.clientesFiltrados).toHaveLength(1);
    expect(result.current.clientesFiltrados[0].nombre).toBe('Valentina');
  });
});

// ── HU-C2: Crear cliente ──────────────────────────────────────────────────────

describe('HU-C2: Crear cliente', () => {
  /**
   * Escenario 1: Dado un formulario con datos válidos y documento único,
   * cuando el recepcionista guarda,
   * entonces el cliente aparece en la lista y totalClientes aumenta.
   */
  it('crea un cliente exitosamente cuando el documento es único', () => {
    const { result } = renderHook(() => useClientes([], []));

    act(() => {
      result.current.crearCliente(nuevoClienteData);
    });

    expect(result.current.totalClientes).toBe(1);
    expect(result.current.clientesFiltrados[0].nombre).toBe('Sofía');
  });

  /**
   * Escenario 2: Dado que ya existe un cliente con un número de documento,
   * cuando se intenta registrar otro con el mismo documento,
   * entonces el hook retorna error 'documentoDuplicado'.
   */
  it('retorna error documentoDuplicado cuando el número de documento ya existe', () => {
    const { result } = renderHook(() => useClientes([clienteBase], []));

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.crearCliente({
        ...nuevoClienteData,
        numeroDocumento: clienteBase.numeroDocumento, // duplicado
      });
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('documentoDuplicado');
  });

  /**
   * Escenario 3: Cuando crearCliente recibe datos válidos con documento único,
   * el cliente NO se agrega a la lista (integridad) si hay duplicado.
   */
  it('no modifica la lista cuando hay documento duplicado', () => {
    const { result } = renderHook(() => useClientes([clienteBase], []));

    act(() => {
      result.current.crearCliente({
        ...nuevoClienteData,
        numeroDocumento: clienteBase.numeroDocumento,
      });
    });

    expect(result.current.totalClientes).toBe(1); // sin cambios
  });
});

// ── HU-C3: Editar cliente ─────────────────────────────────────────────────────

describe('HU-C3: Editar cliente', () => {
  /**
   * Escenario 1: Dado un cliente existente,
   * cuando el recepcionista actualiza el teléfono y guarda,
   * entonces el nuevo valor aparece en el cliente actualizado.
   */
  it('actualiza el campo editado del cliente correctamente', () => {
    const { result } = renderHook(() => useClientes([clienteBase], []));

    act(() => {
      result.current.editarCliente(clienteBase.id, {
        ...clienteBase,
        telefono: '+57 999 999 9999',
      });
    });

    const clienteActualizado = result.current.clientesFiltrados.find(
      (c) => c.id === clienteBase.id,
    );
    expect(clienteActualizado?.telefono).toBe('+57 999 999 9999');
  });

  /**
   * Escenario 2: Al editar un cliente, los demás clientes no se modifican.
   */
  it('no modifica otros clientes al editar uno específico', () => {
    const { result } = renderHook(() =>
      useClientes([clienteBase, otroCliente], []),
    );

    act(() => {
      result.current.editarCliente(clienteBase.id, {
        ...clienteBase,
        nombre: 'Valentina Editada',
      });
    });

    const clienteNoEditado = result.current.clientesFiltrados.find(
      (c) => c.id === otroCliente.id,
    );
    expect(clienteNoEditado?.nombre).toBe(otroCliente.nombre);
  });

  /**
   * Escenario 3 (cancelar): Al cancelar la edición (cerrarFormulario),
   * el estado de UI se resetea sin modificar los datos del cliente.
   */
  it('resetea el estado de UI al cancelar sin modificar datos', () => {
    const { result } = renderHook(() => useClientes([clienteBase], []));

    act(() => {
      result.current.abrirFormularioEditar(clienteBase);
    });
    expect(result.current.isFormOpen).toBe(true);
    expect(result.current.clienteSeleccionado?.id).toBe(clienteBase.id);

    act(() => {
      result.current.cerrarFormulario();
    });
    expect(result.current.isFormOpen).toBe(false);
    expect(result.current.clienteSeleccionado).toBeNull();
    // Datos del cliente intactos
    expect(result.current.clientesFiltrados[0].nombre).toBe('Valentina');
  });
});

// ── HU-C4: Eliminar cliente ───────────────────────────────────────────────────

describe('HU-C4: Eliminar cliente', () => {
  /**
   * Escenario 1: Dado un cliente sin reservas activas,
   * cuando el administrador confirma la eliminación,
   * entonces el cliente ya no aparece en la lista.
   */
  it('elimina al cliente de la lista cuando no tiene reservas activas', () => {
    const { result } = renderHook(() =>
      useClientes([clienteBase, otroCliente], []), // sin reservas
    );

    act(() => {
      result.current.eliminarCliente(clienteBase.id);
    });

    expect(result.current.totalClientes).toBe(1);
    expect(
      result.current.clientesFiltrados.find((c) => c.id === clienteBase.id),
    ).toBeUndefined();
  });

  /**
   * Escenario 2: Dado un cliente con una reserva en estado 'confirmada',
   * cuando se intenta eliminar,
   * entonces el hook retorna error 'clienteConReservas'.
   */
  it('retorna error clienteConReservas cuando el cliente tiene reservas activas', () => {
    const { result } = renderHook(() =>
      useClientes([clienteBase], [reservaActiva]),
    );

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.eliminarCliente(clienteBase.id);
    });

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toBe('clienteConReservas');
  });

  /**
   * Escenario 3: Dado el modal de confirmación abierto,
   * cuando se cancela, el cliente permanece en la lista intacto.
   */
  it('mantiene al cliente en la lista al cancelar el modal de eliminación', () => {
    const { result } = renderHook(() =>
      useClientes([clienteBase], [reservaActiva]),
    );

    act(() => {
      result.current.abrirModalEliminar(clienteBase);
    });
    expect(result.current.clienteAEliminar?.id).toBe(clienteBase.id);

    act(() => {
      result.current.cerrarModalEliminar();
    });
    expect(result.current.clienteAEliminar).toBeNull();
    expect(result.current.totalClientes).toBe(1); // cliente intacto
  });
});
