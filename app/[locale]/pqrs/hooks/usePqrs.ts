"use client";

import { useState, useMemo } from "react";
import { MOCK_PQRS, MOCK_CLIENTES, MOCK_RESERVAS } from "@/lib/mock-data";
import type {
  Pqrs,
  PqrsFormData,
  EstadoPqrs,
  TipoPqrs,
  Cliente,
  Reserva,
} from "@/types";
import { PQRS_ESTADOS_EDITABLES, PQRS_ESTADOS_ELIMINABLES } from "@/types";

function generarId(): string {
  return `pqrs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface PqrsConRelaciones {
  pqrs: Pqrs;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
}

/**
 * usePqrs - hook central del módulo de Gestión de PQRS.
 *
 * Responsabilidades:
 * - Estado: lista de PQRS, filtros (texto + tipo + estado), paginación, UI
 * - CRUD: crearPqrs, editarPqrs, eliminarPqrs, cambiarEstado
 * - Validaciones de negocio:
 *     - El asunto y descripción son requeridos
 *     - Solo se pueden editar PQRS en estados pendiente o en_proceso
 *     - Solo se pueden eliminar PQRS en estado pendiente
 *
 * @param initialPqrs - Lista inicial (default: MOCK_PQRS)
 * @param clientes    - Clientes para resolución (default: MOCK_CLIENTES)
 * @param reservas    - Reservas para resolución (default: MOCK_RESERVAS)
 */
export function usePqrs(
  initialPqrs: Pqrs[] = MOCK_PQRS,
  clientes: Cliente[] = MOCK_CLIENTES,
  reservas: Reserva[] = MOCK_RESERVAS,
) {
  const ITEMS_POR_PAGINA = 10;

  // Estado de datos
  const [pqrs, setPqrs] = useState<Pqrs[]>(initialPqrs);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoPqrs | "">("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPqrs | "">("");
  const [pagina, setPagina] = useState(1);

  // Estado de UI
  const [pqrsSeleccionado, setPqrsSeleccionado] = useState<Pqrs | null>(null);
  const [pqrsAEliminar, setPqrsAEliminar] = useState<Pqrs | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Derivación: PQRS con datos de cliente y reserva resueltos
  const pqrsConRelaciones = useMemo<PqrsConRelaciones[]>(() => {
    const clienteMap = new Map(clientes.map((c) => [c.id, c]));
    const reservaMap = new Map(reservas.map((r) => [r.id, r]));
    return pqrs.map((p) => {
      const cliente = p.clienteId ? clienteMap.get(p.clienteId) : undefined;
      const reserva = p.reservaId ? reservaMap.get(p.reservaId) : undefined;
      return { pqrs: p, cliente, reserva };
    });
  }, [pqrs, clientes, reservas]);

  // Filtrado y ordenación
  const pqrsFiltrados = useMemo<PqrsConRelaciones[]>(() => {
    let resultado = pqrsConRelaciones;

    if (filtroTexto.trim()) {
      const termino = filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(({ pqrs, cliente, reserva }) => {
        const nombreCliente = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
          : "";
        const reservaId = reserva?.id.toLowerCase() ?? "";
        const habitacion = pqrs.habitacionNumero?.toLowerCase() ?? "";
        return (
          pqrs.asunto.toLowerCase().includes(termino) ||
          pqrs.descripcion.toLowerCase().includes(termino) ||
          nombreCliente.includes(termino) ||
          reservaId.includes(termino) ||
          habitacion.includes(termino) ||
          pqrs.id.toLowerCase().includes(termino) ||
          (pqrs.asignadoA?.toLowerCase().includes(termino) ?? false)
        );
      });
    }

    if (filtroTipo) {
      resultado = resultado.filter(({ pqrs }) => pqrs.tipo === filtroTipo);
    }

    if (filtroEstado) {
      resultado = resultado.filter(({ pqrs }) => pqrs.estado === filtroEstado);
    }

    // Ordenar por fecha de creación descendente (más recientes primero)
    return [...resultado].sort((a, b) =>
      b.pqrs.fechaCreacion.localeCompare(a.pqrs.fechaCreacion),
    );
  }, [pqrsConRelaciones, filtroTexto, filtroTipo, filtroEstado]);

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(pqrsFiltrados.length / ITEMS_POR_PAGINA),
  );
  const pqrsPaginados = pqrsFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  // Validaciones de negocio

  function datosValidos(data: PqrsFormData): boolean {
    return data.asunto.trim().length > 0 && data.descripcion.trim().length > 0;
  }

  // CRUD

  function crearPqrs(data: PqrsFormData): { ok: boolean; error?: string } {
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }

    const nuevo: Pqrs = {
      ...data,
      id: generarId(),
      creadoEn: new Date().toISOString(),
    };
    setPqrs((prev) => [nuevo, ...prev]);
    setPagina(1);
    return { ok: true };
  }

  function editarPqrs(
    id: string,
    data: PqrsFormData,
  ): { ok: boolean; error?: string } {
    const pqrsActual = pqrs.find((p) => p.id === id);
    if (!pqrsActual || !PQRS_ESTADOS_EDITABLES.includes(pqrsActual.estado)) {
      return { ok: false, error: "noEditable" };
    }
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }

    setPqrs((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...data, actualizadoEn: new Date().toISOString() }
          : p,
      ),
    );
    return { ok: true };
  }

  function eliminarPqrs(id: string): { ok: boolean; error?: string } {
    const pqrsActual = pqrs.find((p) => p.id === id);
    if (!pqrsActual || !PQRS_ESTADOS_ELIMINABLES.includes(pqrsActual.estado)) {
      return { ok: false, error: "noEliminable" };
    }

    setPqrs((prev) => prev.filter((p) => p.id !== id));
    return { ok: true };
  }

  function cambiarEstado(
    id: string,
    nuevoEstado: EstadoPqrs,
    respuesta?: string,
  ): { ok: boolean; error?: string } {
    const pqrsActual = pqrs.find((p) => p.id === id);
    if (!pqrsActual) {
      return { ok: false, error: "noEncontrado" };
    }

    const actualizacion: Partial<Pqrs> = {
      estado: nuevoEstado,
      actualizadoEn: new Date().toISOString(),
    };

    if (respuesta !== undefined) {
      actualizacion.respuesta = respuesta;
    }

    if (nuevoEstado === "resuelto" || nuevoEstado === "cerrado") {
      actualizacion.fechaCierre = new Date().toISOString();
    }

    setPqrs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...actualizacion } : p)),
    );
    return { ok: true };
  }

  // Controles UI

  function abrirFormularioCrear() {
    setPqrsSeleccionado(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(pqrs: Pqrs) {
    setPqrsSeleccionado(pqrs);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setPqrsSeleccionado(null);
  }

  function abrirModalEliminar(pqrs: Pqrs) {
    setPqrsAEliminar(pqrs);
  }

  function cerrarModalEliminar() {
    setPqrsAEliminar(null);
  }

  return {
    // Datos
    pqrs: pqrsPaginados,
    pqrsFiltrados,
    totalPqrs: pqrs.length,
    clientes,
    reservas,
    // Filtros y paginación
    filtroTexto,
    setFiltroTexto,
    filtroTipo,
    setFiltroTipo,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    // Estado UI
    pqrsSeleccionado,
    pqrsAEliminar,
    isFormOpen,
    // Acciones datos
    crearPqrs,
    editarPqrs,
    eliminarPqrs,
    cambiarEstado,
    // Acciones UI
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar,
    cerrarModalEliminar,
  };
}
