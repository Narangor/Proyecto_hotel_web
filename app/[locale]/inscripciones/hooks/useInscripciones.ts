"use client";

import { useState, useMemo } from "react";
import {
  MOCK_INSCRIPCIONES,
  MOCK_CLIENTES,
  MOCK_RESERVAS,
} from "@/lib/mock-data";
import type {
  Inscripcion,
  InscripcionFormData,
  EstadoInscripcion,
  CategoriaInscripcion,
  Cliente,
  Reserva,
} from "@/types";
import {
  INSCRIPCION_ESTADOS_EDITABLES,
  INSCRIPCION_ESTADOS_ELIMINABLES,
} from "@/types";

function generarId(): string {
  return `ins-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface InscripcionConRelaciones {
  inscripcion: Inscripcion;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
}

export function useInscripciones(
  initial: Inscripcion[] = MOCK_INSCRIPCIONES,
  clientes: Cliente[] = MOCK_CLIENTES,
  reservas: Reserva[] = MOCK_RESERVAS,
) {
  const ITEMS_POR_PAGINA = 10;

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>(initial);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<
    CategoriaInscripcion | ""
  >("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoInscripcion | "">("");
  const [pagina, setPagina] = useState(1);

  const [seleccionada, setSeleccionada] = useState<Inscripcion | null>(null);
  const [aEliminar, setAEliminar] = useState<Inscripcion | null>(null);
  const [aCancelar, setACancelar] = useState<Inscripcion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const conRelaciones = useMemo<InscripcionConRelaciones[]>(() => {
    const clienteMap = new Map(clientes.map((c) => [c.id, c]));
    const reservaMap = new Map(reservas.map((r) => [r.id, r]));
    return inscripciones.map((i) => ({
      inscripcion: i,
      cliente: clienteMap.get(i.clienteId),
      reserva: i.reservaId ? reservaMap.get(i.reservaId) : undefined,
    }));
  }, [inscripciones, clientes, reservas]);

  const filtrados = useMemo(() => {
    let resultado = conRelaciones;
    if (filtroTexto.trim()) {
      const q = filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(({ inscripcion, cliente }) => {
        const nombre = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
          : "";
        return (
          inscripcion.nombreActividad.toLowerCase().includes(q) ||
          inscripcion.descripcion.toLowerCase().includes(q) ||
          nombre.includes(q) ||
          inscripcion.id.toLowerCase().includes(q)
        );
      });
    }
    if (filtroCategoria) {
      resultado = resultado.filter(
        ({ inscripcion }) => inscripcion.categoria === filtroCategoria,
      );
    }
    if (filtroEstado) {
      resultado = resultado.filter(
        ({ inscripcion }) => inscripcion.estado === filtroEstado,
      );
    }
    return [...resultado].sort((a, b) =>
      b.inscripcion.creadoEn.localeCompare(a.inscripcion.creadoEn),
    );
  }, [conRelaciones, filtroTexto, filtroCategoria, filtroEstado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / ITEMS_POR_PAGINA),
  );
  const paginados = filtrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  function datosValidos(data: InscripcionFormData): boolean {
    return (
      data.nombreActividad.trim().length > 0 &&
      data.descripcion.trim().length > 0 &&
      data.clienteId.length > 0 &&
      data.numeroPersonas > 0
    );
  }

  function crearInscripcion(
    data: InscripcionFormData,
  ): { ok: boolean; error?: string } {
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }
    const nuevo: Inscripcion = {
      ...data,
      id: generarId(),
      creadoEn: new Date().toISOString(),
    };
    setInscripciones((prev) => [nuevo, ...prev]);
    setPagina(1);
    return { ok: true };
  }

  function editarInscripcion(
    id: string,
    data: InscripcionFormData,
  ): { ok: boolean; error?: string } {
    const actual = inscripciones.find((i) => i.id === id);
    if (!actual || !INSCRIPCION_ESTADOS_EDITABLES.includes(actual.estado)) {
      return { ok: false, error: "noEditable" };
    }
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }
    setInscripciones((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, ...data, actualizadoEn: new Date().toISOString() }
          : i,
      ),
    );
    return { ok: true };
  }

  function eliminarInscripcion(id: string): { ok: boolean; error?: string } {
    const actual = inscripciones.find((i) => i.id === id);
    if (!actual || !INSCRIPCION_ESTADOS_ELIMINABLES.includes(actual.estado)) {
      return { ok: false, error: "noEliminable" };
    }
    setInscripciones((prev) => prev.filter((i) => i.id !== id));
    return { ok: true };
  }

  function cancelarInscripcion(
    id: string,
    motivo?: string,
  ): { ok: boolean; error?: string } {
    const actual = inscripciones.find((i) => i.id === id);
    if (!actual || !INSCRIPCION_ESTADOS_EDITABLES.includes(actual.estado)) {
      return { ok: false, error: "noCancelable" };
    }
    setInscripciones((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              estado: "cancelada" as const,
              motivoCancelacion: motivo,
              actualizadoEn: new Date().toISOString(),
            }
          : i,
      ),
    );
    return { ok: true };
  }

  function cambiarEstado(
    id: string,
    estado: EstadoInscripcion,
  ): { ok: boolean; error?: string } {
    const actual = inscripciones.find((i) => i.id === id);
    if (!actual) {
      return { ok: false, error: "noEncontrado" };
    }
    setInscripciones((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, estado, actualizadoEn: new Date().toISOString() }
          : i,
      ),
    );
    return { ok: true };
  }

  function abrirFormularioCrear() {
    setSeleccionada(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(ins: Inscripcion) {
    setSeleccionada(ins);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setSeleccionada(null);
  }

  return {
    inscripciones: paginados,
    totalInscripciones: inscripciones.length,
    clientes,
    reservas,
    filtroTexto,
    setFiltroTexto,
    filtroCategoria,
    setFiltroCategoria,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    seleccionada,
    aEliminar,
    aCancelar,
    isFormOpen,
    crearInscripcion,
    editarInscripcion,
    eliminarInscripcion,
    cancelarInscripcion,
    cambiarEstado,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar: setAEliminar,
    cerrarModalEliminar: () => setAEliminar(null),
    abrirModalCancelar: setACancelar,
    cerrarModalCancelar: () => setACancelar(null),
  };
}
