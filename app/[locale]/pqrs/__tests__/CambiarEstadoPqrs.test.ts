import { renderHook, act } from "@testing-library/react";
import { usePqrs } from "../hooks/usePqrs";
import type { Pqrs } from "@/types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const pqrsPendiente: Pqrs = {
  id: "pqrs-test-1",
  tipo: "queja",
  asunto: "Problema con el servicio",
  descripcion: "La habitación no estaba limpia",
  clienteId: "c-1",
  habitacionNumero: "101",
  reservaId: "r-1",
  prioridad: "alta",
  estado: "pendiente",
  fechaCreacion: "2025-01-15",
  asignadoA: "Juan Pérez",
  creadoEn: "2025-01-15T10:00:00.000Z",
};

const pqrsEnProceso: Pqrs = {
  ...pqrsPendiente,
  id: "pqrs-test-2",
  estado: "en_proceso",
  asunto: "Solicitud de cambio de habitación",
};

// ── HU-Q4: Cambiar estado de PQRS ────────────────────────────────────────────

describe("HU-Q4: Cambiar estado de PQRS", () => {
  // Escenario 1: Inicio de gestión - Dado que existe una PQRS "pendiente", cuando el empleado la cambia a "en_proceso" el estado se actualiza correctamente
  it("cambia el estado de pendiente a en_proceso correctamente", () => {
    const { result } = renderHook(() => usePqrs([pqrsPendiente], [], []));

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.cambiarEstado(pqrsPendiente.id, "en_proceso");
    });

    expect(respuesta.ok).toBe(true);
    const pqrsActualizado = result.current.pqrsFiltrados.find(
      ({ pqrs }) => pqrs.id === pqrsPendiente.id,
    );
    expect(pqrsActualizado?.pqrs.estado).toBe("en_proceso");
    expect(pqrsActualizado?.pqrs.actualizadoEn).toBeDefined();
  });

  // Escenario 2: Resolución con respuesta - Dado que una PQRS está "en_proceso", cuando el empleado la cambia a "resuelto" agregando una respuesta se guarda el estado, la respuesta y la fecha de cierre
  it("cambia a resuelto con respuesta y registra fecha de cierre", () => {
    const { result } = renderHook(() => usePqrs([pqrsEnProceso], [], []));

    const respuestaTexto = "Se resolvio el problema satisfactoriamente";
    let respuesta!: { ok: boolean; error?: string };

    act(() => {
      respuesta = result.current.cambiarEstado(
        pqrsEnProceso.id,
        "resuelto",
        respuestaTexto,
      );
    });

    expect(respuesta.ok).toBe(true);
    const pqrsActualizado = result.current.pqrsFiltrados.find(
      ({ pqrs }) => pqrs.id === pqrsEnProceso.id,
    );
    expect(pqrsActualizado?.pqrs.estado).toBe("resuelto");
    expect(pqrsActualizado?.pqrs.respuesta).toBe(respuestaTexto);
    expect(pqrsActualizado?.pqrs.fechaCierre).toBeDefined();
    expect(pqrsActualizado?.pqrs.actualizadoEn).toBeDefined();
  });

  // Escenario 3: Cierre de PQRS - Dado que una PQRS está en cualquier estado, cuando se cambia a "cerrado" se registra la fecha de cierre
  it("cambia a cerrado y registra fecha de cierre desde cualquier estado", () => {
    const { result } = renderHook(() => usePqrs([pqrsPendiente], [], []));

    let respuesta!: { ok: boolean; error?: string };
    act(() => {
      respuesta = result.current.cambiarEstado(pqrsPendiente.id, "cerrado");
    });

    expect(respuesta.ok).toBe(true);
    const pqrsActualizado = result.current.pqrsFiltrados.find(
      ({ pqrs }) => pqrs.id === pqrsPendiente.id,
    );
    expect(pqrsActualizado?.pqrs.estado).toBe("cerrado");
    expect(pqrsActualizado?.pqrs.fechaCierre).toBeDefined();
    expect(pqrsActualizado?.pqrs.actualizadoEn).toBeDefined();
  });
});
