"use client";

import { useState, useMemo } from "react";
import {
  MOCK_SOLICITUDES,
  MOCK_RESERVAS,
  MOCK_CLIENTES,
} from "@/lib/mock-data";
import type {
  Solicitud,
  SolicitudFormData,
  EstadoSolicitud,
  Reserva,
  Cliente,
} from "@/types";
import {
  SOLICITUD_ESTADOS_EDITABLES,
  SOLICITUD_ESTADOS_CANCELABLES,
} from "@/types";

function generarId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface SolicitudConRelaciones {
  solicitud: Solicitud;
  reserva: Reserva | undefined;
  cliente: Cliente | undefined;
}

/**
 * useSolicitudes - hook central del módulo de Gestión de Solicitudes.
 *
 * Responsabilidades:
 * - Estado: lista de solicitudes, filtros (texto + estado), paginación, UI
 * - CRUD: crearSolicitud, editarSolicitud, completarSolicitud, cancelarSolicitud
 * - Validaciones de negocio:
 *     - La descripción es requerida
 *     - Solo se pueden editar solicitudes en estado pendiente
 *     - Solo se pueden cancelar solicitudes en estados cancelables
 *     - Solo se pueden completar solicitudes en estado en_proceso
 *
 * @param initialSolicitudes  - Lista inicial (default: MOCK_SOLICITUDES)
 * @param reservas      - Reservas para resolución (default: MOCK_RESERVAS)
 * @param clientes      - Clientes para resolución (default: MOCK_CLIENTES)
 */
export function useSolicitudes(
  initialSolicitudes: Solicitud[] = MOCK_SOLICITUDES,
  reservas: Reserva[] = MOCK_RESERVAS,
  clientes: Cliente[] = MOCK_CLIENTES,
) {
  const ITEMS_POR_PAGINA = 10;

  // Estado de datos
  const [solicitudes, setSolicitudes] =
    useState<Solicitud[]>(initialSolicitudes);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | "">("");
  const [pagina, setPagina] = useState(1);

  // Estado de UI
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<Solicitud | null>(null);
  const [solicitudACancelar, setSolicitudACancelar] =
    useState<Solicitud | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Derivación: solicitudes con datos de reserva y cliente resueltos
  const solicitudesConRelaciones = useMemo<SolicitudConRelaciones[]>(() => {
    const reservaMap = new Map(reservas.map((r) => [r.id, r]));
    const clienteMap = new Map(clientes.map((c) => [c.id, c]));
    return solicitudes.map((s) => {
      const reserva = reservaMap.get(s.reservaId);
      const cliente = reserva ? clienteMap.get(reserva.clienteId) : undefined;
      return { solicitud: s, reserva, cliente };
    });
  }, [solicitudes, reservas, clientes]);

  // Filtrado y ordenación
  const solicitudesFiltradas = useMemo<SolicitudConRelaciones[]>(() => {
    let resultado = solicitudesConRelaciones;

    if (filtroTexto.trim()) {
      const termino = filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(({ solicitud, reserva, cliente }) => {
        const nombreCliente = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
          : "";
        const reservaId = reserva?.id.toLowerCase() ?? "";
        const habitacion = solicitud.habitacionNumero.toLowerCase();
        const descripcion = solicitud.descripcion.toLowerCase();
        return (
          nombreCliente.includes(termino) ||
          reservaId.includes(termino) ||
          habitacion.includes(termino) ||
          descripcion.includes(termino) ||
          solicitud.id.toLowerCase().includes(termino) ||
          (solicitud.empleadoAsignado?.toLowerCase().includes(termino) ?? false)
        );
      });
    }

    if (filtroEstado) {
      resultado = resultado.filter(
        ({ solicitud }) => solicitud.estado === filtroEstado,
      );
    }

    return [...resultado].sort((a, b) =>
      b.solicitud.fechaSolicitud.localeCompare(a.solicitud.fechaSolicitud),
    );
  }, [solicitudesConRelaciones, filtroTexto, filtroEstado]);

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA),
  );
  const solicitudesPaginadas = solicitudesFiltradas.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  // Validaciones de negocio

  function descripcionValida(descripcion: string): boolean {
    return typeof descripcion === "string" && descripcion.trim().length > 0;
  }

  // CRUD

  function crearSolicitud(data: SolicitudFormData): {
    ok: boolean;
    error?: string;
  } {
    if (!data.reservaId) {
      return { ok: false, error: "reservaRequerida" };
    }
    if (!descripcionValida(data.descripcion)) {
      return { ok: false, error: "descripcionRequerida" };
    }
    if (!data.habitacionNumero) {
      return { ok: false, error: "habitacionRequerida" };
    }

    const nueva: Solicitud = {
      ...data,
      id: generarId(),
      estado: "pendiente",
      fechaSolicitud: new Date().toISOString(),
      creadoEn: new Date().toISOString(),
    };
    setSolicitudes((prev) => [nueva, ...prev]);
    setPagina(1);
    return { ok: true };
  }

  function editarSolicitud(
    id: string,
    data: SolicitudFormData,
  ): { ok: boolean; error?: string } {
    const solicitudActual = solicitudes.find((s) => s.id === id);
    if (
      !solicitudActual ||
      !SOLICITUD_ESTADOS_EDITABLES.includes(solicitudActual.estado)
    ) {
      return { ok: false, error: "noEditable" };
    }
    if (!descripcionValida(data.descripcion)) {
      return { ok: false, error: "descripcionRequerida" };
    }

    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    );
    return { ok: true };
  }

  function completarSolicitud(id: string): { ok: boolean; error?: string } {
    const solicitudActual = solicitudes.find((s) => s.id === id);
    if (!solicitudActual) {
      return { ok: false, error: "solicitudNoEncontrada" };
    }
    if (solicitudActual.estado !== "en_proceso") {
      return { ok: false, error: "noCompletable" };
    }

    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: "completada",
              fechaCompletada: new Date().toISOString(),
            }
          : s,
      ),
    );
    return { ok: true };
  }

  function cambiarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
  ): { ok: boolean; error?: string } {
    const solicitudActual = solicitudes.find((s) => s.id === id);
    if (!solicitudActual) {
      return { ok: false, error: "solicitudNoEncontrada" };
    }

    // Validar transiciones de estado válidas
    if (
      nuevoEstado === "completada" &&
      solicitudActual.estado !== "en_proceso"
    ) {
      return { ok: false, error: "noCompletable" };
    }

    const actualizado: Partial<Solicitud> = { estado: nuevoEstado };
    if (nuevoEstado === "completada") {
      actualizado.fechaCompletada = new Date().toISOString();
    }

    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...actualizado } : s)),
    );
    return { ok: true };
  }

  function cancelarSolicitud(
    id: string,
    motivo?: string,
  ): { ok: boolean; error?: string } {
    const solicitudActual = solicitudes.find((s) => s.id === id);
    if (
      !solicitudActual ||
      !SOLICITUD_ESTADOS_CANCELABLES.includes(solicitudActual.estado)
    ) {
      return { ok: false, error: "noCancelable" };
    }

    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, estado: "cancelada", motivoCancelacion: motivo ?? "" }
          : s,
      ),
    );
    return { ok: true };
  }

  // Controles de UI

  function abrirFormularioCrear() {
    setSolicitudSeleccionada(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(solicitud: Solicitud) {
    setSolicitudSeleccionada(solicitud);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setSolicitudSeleccionada(null);
  }

  function abrirModalCancelar(solicitud: Solicitud) {
    setSolicitudACancelar(solicitud);
  }

  function cerrarModalCancelar() {
    setSolicitudACancelar(null);
  }

  return {
    // Datos
    solicitudes: solicitudesPaginadas,
    solicitudesFiltradas,
    totalSolicitudes: solicitudes.length,
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
    solicitudSeleccionada,
    solicitudACancelar,
    isFormOpen,
    // Acciones datos
    crearSolicitud,
    editarSolicitud,
    completarSolicitud,
    cambiarEstado,
    cancelarSolicitud,
    // Acciones UI
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalCancelar,
    cerrarModalCancelar,
  };
}
