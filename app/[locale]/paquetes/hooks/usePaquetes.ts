"use client";

import { useState, useMemo } from "react";
import { MOCK_PAQUETES } from "@/lib/mock-data";
import type { PaquetePromocional, PaqueteFormData, EstadoPaquete } from "@/types";
import { PAQUETE_ESTADOS_ELIMINABLES } from "@/types";

function generarId(): string {
  return `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function usePaquetes(initial: PaquetePromocional[] = MOCK_PAQUETES) {
  const ITEMS_POR_PAGINA = 10;

  const [paquetes, setPaquetes] = useState<PaquetePromocional[]>(initial);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPaquete | "">("");
  const [pagina, setPagina] = useState(1);

  const [seleccionado, setSeleccionado] = useState<PaquetePromocional | null>(
    null,
  );
  const [aEliminar, setAEliminar] = useState<PaquetePromocional | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtrados = useMemo(() => {
    let r = paquetes;
    if (filtroTexto.trim()) {
      const q = filtroTexto.toLowerCase().trim();
      r = r.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }
    if (filtroEstado) {
      r = r.filter((p) => p.estado === filtroEstado);
    }
    return [...r].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  }, [paquetes, filtroTexto, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginados = filtrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA,
  );

  function datosValidos(data: PaqueteFormData): boolean {
    if (data.precioLista < 0 || data.precioPromocional < 0) return false;
    if (data.cuposTotales < 1) return false;
    if (data.fechaFinVigencia < data.fechaInicioVigencia) return false;
    return (
      data.nombre.trim().length > 0 &&
      data.descripcion.trim().length > 0 &&
      data.incluye.trim().length > 0
    );
  }

  function crearPaquete(
    data: PaqueteFormData,
  ): { ok: boolean; error?: string } {
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }
    const nuevo: PaquetePromocional = {
      ...data,
      id: generarId(),
      cuposVendidos: 0,
      creadoEn: new Date().toISOString(),
    };
    setPaquetes((prev) => [nuevo, ...prev]);
    setPagina(1);
    return { ok: true };
  }

  function editarPaquete(
    id: string,
    data: PaqueteFormData,
  ): { ok: boolean; error?: string } {
    const actual = paquetes.find((p) => p.id === id);
    if (!actual) {
      return { ok: false, error: "noEncontrado" };
    }
    if (!datosValidos(data)) {
      return { ok: false, error: "datosIncompletos" };
    }
    if (data.cuposTotales < actual.cuposVendidos) {
      return { ok: false, error: "cuposInvalidos" };
    }
    setPaquetes((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...data,
              cuposVendidos: p.cuposVendidos,
              actualizadoEn: new Date().toISOString(),
            }
          : p,
      ),
    );
    return { ok: true };
  }

  function eliminarPaquete(id: string): { ok: boolean; error?: string } {
    const actual = paquetes.find((p) => p.id === id);
    if (!actual || !PAQUETE_ESTADOS_ELIMINABLES.includes(actual.estado)) {
      return { ok: false, error: "noEliminable" };
    }
    setPaquetes((prev) => prev.filter((p) => p.id !== id));
    return { ok: true };
  }

  function abrirFormularioCrear() {
    setSeleccionado(null);
    setIsFormOpen(true);
  }

  function abrirFormularioEditar(p: PaquetePromocional) {
    setSeleccionado(p);
    setIsFormOpen(true);
  }

  function cerrarFormulario() {
    setIsFormOpen(false);
    setSeleccionado(null);
  }

  return {
    paquetes: paginados,
    totalPaquetes: paquetes.length,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    seleccionado,
    aEliminar,
    isFormOpen,
    crearPaquete,
    editarPaquete,
    eliminarPaquete,
    abrirFormularioCrear,
    abrirFormularioEditar,
    cerrarFormulario,
    abrirModalEliminar: setAEliminar,
    cerrarModalEliminar: () => setAEliminar(null),
  };
}
