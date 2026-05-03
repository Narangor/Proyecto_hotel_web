'use client';

import { useState, useMemo } from 'react';
import { MOCK_CLIENTES, MOCK_RESERVAS } from '@/lib/mock-data';
import { storeCliente, deleteStoredCliente } from '@/lib/booking-store';
import type { Cliente, ClienteFormData, Reserva } from '@/types';

function generarId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * useClientes — hook central del módulo de Gestión de Clientes.
 *
 * Responsabilidades:
 * - Estado: lista de clientes, filtro, paginación, UI (modal/form abierto).
 * - CRUD: crearCliente, editarCliente, eliminarCliente.
 * - Validaciones de negocio:
 *     · Documento único en el sistema.
 *     · No eliminar cliente con reservas activas.
 *
 * Parámetros aceptados para facilitar el testing unitario:
 * @param initialClientes - Lista inicial de clientes (default: MOCK_CLIENTES)
 * @param reservas        - Lista de reservas para validar eliminación (default: MOCK_RESERVAS)
 *
 * En Ciclo 2 este hook reemplazará el mock data por llamadas a fetch().
 * La interfaz pública (valores y funciones retornadas) no cambiará.
 */
export function useClientes(
  initialClientes: Cliente[] = MOCK_CLIENTES,
  reservas: Reserva[] = MOCK_RESERVAS,
) {
  const ITEMS_POR_PAGINA = 10;

  // ── Estado de datos ──
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [filtro, setFiltro] = useState('');
  const [pagina, setPagina] = useState(1);

  // ── Estado de UI ──
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ── Filtrado (memoizado para no recalcular en cada render) ──
  const clientesFiltrados = useMemo(() => {
    if (!filtro.trim()) return clientes;
    const termino = filtro.toLowerCase().trim();
    return clientes.filter(
      (c) =>
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(termino) ||
        c.numeroDocumento.includes(termino),
    );
  }, [clientes, filtro]);

  // ── Paginación ──
  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / ITEMS_POR_PAGINA));
  const clientesPaginados = clientesFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  // ── Validaciones de negocio ──

  /** Verifica si el número de documento ya existe (excluye al cliente en edición) */
  function documentoExiste(doc: string, excludeId?: string): boolean {
    return clientes.some(
      (c) => c.numeroDocumento === doc && c.id !== excludeId,
    );
  }

  /**
   * Verifica si el cliente tiene reservas en estados que impiden eliminación.
   * Estados activos: pendiente, confirmada, en_curso.
   */
  function tieneReservasActivas(clienteId: string): boolean {
    return reservas.some(
      (r) =>
        r.clienteId === clienteId &&
        (['pendiente', 'confirmada', 'en_curso'] as const).includes(
          r.estado as 'pendiente' | 'confirmada' | 'en_curso',
        ),
    );
  }

  // ── CRUD ──

  function crearCliente(data: ClienteFormData): { ok: boolean; error?: string } {
    if (documentoExiste(data.numeroDocumento)) {
      return { ok: false, error: 'documentoDuplicado' };
    }
    const nuevo: Cliente = {
      ...data,
      id: generarId(),
      creadoEn: new Date().toISOString(),
    };
    setClientes((prev) => [nuevo, ...prev]);
    storeCliente(nuevo);
    setPagina(1); // Volver a la primera página para ver el nuevo cliente
    return { ok: true };
  }

  /**
   * Editar cliente. El numero de documento NO se puede cambiar
   * (es la clave de negocio del cliente).
   */
  function editarCliente(
    id: string,
    data: Omit<ClienteFormData, 'numeroDocumento'>,
  ): { ok: boolean } {
    const clienteActual = clientes.find((c) => c.id === id);
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
    if (clienteActual) {
      storeCliente({ ...clienteActual, ...data });
    }
    return { ok: true };
  }

  function eliminarCliente(id: string): { ok: boolean; error?: string } {
    if (tieneReservasActivas(id)) {
      return { ok: false, error: 'clienteConReservas' };
    }
    setClientes((prev) => prev.filter((c) => c.id !== id));
    deleteStoredCliente(id);
    return { ok: true };
  }

  // ── Controles de UI ──

  function abrirFormularioCrear() {
    setClienteSeleccionado(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(cliente: Cliente) {
    setClienteSeleccionado(cliente);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setClienteSeleccionado(null);
  }

  function abrirModalEliminar(cliente: Cliente) {
    setClienteAEliminar(cliente);
  }

  function cerrarModalEliminar() {
    setClienteAEliminar(null);
  }

  return {
    // Datos
    clientes: clientesPaginados,
    clientesFiltrados,
    totalClientes: clientes.length,
    // Filtro y paginación
    filtro,
    setFiltro,
    pagina,
    setPagina,
    totalPaginas,
    // Estado UI
    clienteSeleccionado,
    clienteAEliminar,
    isFormOpen,
    // Acciones de datos
    crearCliente,
    editarCliente,
    eliminarCliente,
    // Acciones de UI
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar,
    cerrarModalEliminar,
  };
}
