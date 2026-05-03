"use client";

import { useState, useMemo } from "react";
import {
  MOCK_AGENDAMIENTOS_TOUR,
  MOCK_TOURS_CATALOGO,
  MOCK_CLIENTES,
  MOCK_RESERVAS,
} from "@/lib/mock-data";
import type {
  AgendamientoTour,
  AgendamientoTourFormData,
  EstadoAgendamientoTour,
  Cliente,
  Reserva,
  TourCatalogo,
} from "@/types";
import {
  AGENDAMIENTO_ESTADOS_EDITABLES,
  AGENDAMIENTO_ESTADOS_CANCELABLES,
} from "@/types";

function generarId(): string {
  return `agt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface AgendamientoConRelaciones {
  agendamiento: AgendamientoTour;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
  tour: TourCatalogo | undefined;
}

export function useAgendamientosTour(
  initial: AgendamientoTour[] = MOCK_AGENDAMIENTOS_TOUR,
  catalogo: TourCatalogo[] = MOCK_TOURS_CATALOGO,
  clientes: Cliente[] = MOCK_CLIENTES,
  reservas: Reserva[] = MOCK_RESERVAS,
) {
  const ITEMS_POR_PAGINA = 10;

  const [items, setItems] = useState<AgendamientoTour[]>(initial);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoAgendamientoTour | "">(
    "",
  );
  const [pagina, setPagina] = useState(1);

  const [seleccionado, setSeleccionado] = useState<AgendamientoTour | null>(
    null,
  );
  const [aCancelar, setACancelar] = useState<AgendamientoTour | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const conRelaciones = useMemo<AgendamientoConRelaciones[]>(() => {
    const clienteMap = new Map(clientes.map((c) => [c.id, c]));
    const reservaMap = new Map(reservas.map((r) => [r.id, r]));
    const tourMap = new Map(catalogo.map((t) => [t.id, t]));
    return items.map((a) => ({
      agendamiento: a,
      cliente: clienteMap.get(a.clienteId),
      reserva: a.reservaId ? reservaMap.get(a.reservaId) : undefined,
      tour: tourMap.get(a.tourCatalogoId),
    }));
  }, [items, clientes, reservas, catalogo]);

  const filtrados = useMemo(() => {
    let r = conRelaciones;
    if (filtroTexto.trim()) {
      const q = filtroTexto.toLowerCase().trim();
      r = r.filter(({ agendamiento, cliente, tour }) => {
        const nombre = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
          : "";
        const tourNombre = tour?.nombre.toLowerCase() ?? "";
        return (
          nombre.includes(q) ||
          tourNombre.includes(q) ||
          agendamiento.id.toLowerCase().includes(q) ||
          agendamiento.puntoEncuentro.toLowerCase().includes(q)
        );
      });
    }
    if (filtroEstado) {
      r = r.filter(({ agendamiento }) => agendamiento.estado === filtroEstado);
    }
    return [...r].sort((a, b) =>
      b.agendamiento.creadoEn.localeCompare(a.agendamiento.creadoEn),
    );
  }, [conRelaciones, filtroTexto, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginados = filtrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  function datosValidos(data: AgendamientoTourFormData): boolean {
    return (
      data.clienteId.length > 0 &&
      data.tourCatalogoId.length > 0 &&
      data.puntoEncuentro.trim().length > 0 &&
      data.numeroParticipantes > 0
    );
  }

  function crearAgendamiento(
    data: AgendamientoTourFormData,
  ): { ok: boolean; error?: string } {
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }
    const nuevo: AgendamientoTour = {
      ...data,
      id: generarId(),
      reservaId: data.reservaId || undefined,
      creadoEn: new Date().toISOString(),
    };
    setItems((prev) => [nuevo, ...prev]);
    setPagina(1);
    return { ok: true };
  }

  function editarAgendamiento(
    id: string,
    data: AgendamientoTourFormData,
  ): { ok: boolean; error?: string } {
    const actual = items.find((x) => x.id === id);
    if (!actual || !AGENDAMIENTO_ESTADOS_EDITABLES.includes(actual.estado)) {
      return { ok: false, error: "noEditable" };
    }
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              ...data,
              reservaId: data.reservaId || undefined,
              actualizadoEn: new Date().toISOString(),
            }
          : x,
      ),
    );
    return { ok: true };
  }

  function cancelarAgendamiento(
    id: string,
    motivo?: string,
  ): { ok: boolean; error?: string } {
    const actual = items.find((x) => x.id === id);
    if (
      !actual ||
      !AGENDAMIENTO_ESTADOS_CANCELABLES.includes(actual.estado)
    ) {
      return { ok: false, error: "noCancelable" };
    }
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              estado: "cancelado" as const,
              motivoCancelacion: motivo,
              actualizadoEn: new Date().toISOString(),
            }
          : x,
      ),
    );
    return { ok: true };
  }

  function cambiarEstado(
    id: string,
    estado: EstadoAgendamientoTour,
  ): { ok: boolean; error?: string } {
    const actual = items.find((x) => x.id === id);
    if (!actual) {
      return { ok: false, error: "noEncontrado" };
    }
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, estado, actualizadoEn: new Date().toISOString() }
          : x,
      ),
    );
    return { ok: true };
  }

  function abrirFormularioCrear() {
    setSeleccionado(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(a: AgendamientoTour) {
    setSeleccionado(a);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setSeleccionado(null);
  }

  return {
    filas: paginados,
    totalAgendamientos: items.length,
    catalogo,
    clientes,
    reservas,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    seleccionado,
    aCancelar,
    isFormOpen,
    crearAgendamiento,
    editarAgendamiento,
    cancelarAgendamiento,
    cambiarEstado,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalCancelar: setACancelar,
    cerrarModalCancelar: () => setACancelar(null),
  };
}
