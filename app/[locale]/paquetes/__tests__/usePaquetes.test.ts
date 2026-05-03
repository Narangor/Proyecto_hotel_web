import { renderHook, act } from "@testing-library/react";
import { usePaquetes } from "../hooks/usePaquetes";
import type { PaqueteFormData, PaquetePromocional } from "@/types";

const paqueteInactivo: PaquetePromocional = {
  id: "pkg-1",
  nombre: "Fin de semana",
  descripcion: "Desc",
  precioLista: 500000,
  precioPromocional: 400000,
  fechaInicioVigencia: "2026-01-01",
  fechaFinVigencia: "2026-12-31",
  cuposTotales: 20,
  cuposVendidos: 0,
  estado: "inactivo",
  incluye: "Desayuno",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const paqueteActivo: PaquetePromocional = {
  ...paqueteInactivo,
  id: "pkg-2",
  estado: "activo",
  cuposVendidos: 5,
  creadoEn: "2026-02-01T00:00:00.000Z",
};

const datosValidos: PaqueteFormData = {
  nombre: "Nuevo paquete",
  descripcion: "Descripción larga",
  precioLista: 300000,
  precioPromocional: 250000,
  fechaInicioVigencia: "2026-03-01",
  fechaFinVigencia: "2026-03-31",
  cuposTotales: 10,
  estado: "activo",
  incluye: "Todo incluido",
};

describe("usePaquetes", () => {
  it("lista paquetes paginados", () => {
    const { result } = renderHook(() => usePaquetes([paqueteActivo]));
    expect(result.current.paquetes).toHaveLength(1);
    expect(result.current.totalPaquetes).toBe(1);
  });

  it("crea un paquete válido", () => {
    const { result } = renderHook(() => usePaquetes([]));
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.crearPaquete(datosValidos);
    });
    expect(resp.ok).toBe(true);
    expect(result.current.totalPaquetes).toBe(1);
    expect(result.current.paquetes[0].cuposVendidos).toBe(0);
  });

  it("rechaza datos inválidos al crear", () => {
    const { result } = renderHook(() => usePaquetes([]));
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.crearPaquete({
        ...datosValidos,
        nombre: "",
      });
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("datosIncompletos");
  });

  it("edita un paquete existente", () => {
    const { result } = renderHook(() => usePaquetes([paqueteActivo]));
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.editarPaquete(paqueteActivo.id, {
        ...datosValidos,
        nombre: "Actualizado",
      });
    });
    expect(resp.ok).toBe(true);
    expect(result.current.paquetes[0].nombre).toBe("Actualizado");
  });

  it("no permite cupos totales menores a vendidos", () => {
    const { result } = renderHook(() => usePaquetes([paqueteActivo]));
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.editarPaquete(paqueteActivo.id, {
        ...datosValidos,
        nombre: paqueteActivo.nombre,
        descripcion: paqueteActivo.descripcion,
        precioLista: paqueteActivo.precioLista,
        precioPromocional: paqueteActivo.precioPromocional,
        fechaInicioVigencia: paqueteActivo.fechaInicioVigencia,
        fechaFinVigencia: paqueteActivo.fechaFinVigencia,
        cuposTotales: 2,
        estado: paqueteActivo.estado,
        incluye: paqueteActivo.incluye,
      });
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("cuposInvalidos");
  });

  it("elimina solo paquetes en estado eliminable", () => {
    const { result } = renderHook(() => usePaquetes([paqueteInactivo]));
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.eliminarPaquete(paqueteInactivo.id);
    });
    expect(resp.ok).toBe(true);
    expect(result.current.totalPaquetes).toBe(0);
  });

  it("no elimina paquete activo", () => {
    const { result } = renderHook(() => usePaquetes([paqueteActivo]));
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.eliminarPaquete(paqueteActivo.id);
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("noEliminable");
  });

  it("filtra por texto en el nombre", () => {
    const otro: PaquetePromocional = {
      ...paqueteInactivo,
      id: "pkg-3",
      nombre: "Otro nombre",
      creadoEn: "2025-12-01T00:00:00.000Z",
    };
    const { result } = renderHook(() =>
      usePaquetes([otro, paqueteInactivo]),
    );
    act(() => {
      result.current.setFiltroTexto("Fin de");
    });
    expect(result.current.paquetes).toHaveLength(1);
    expect(result.current.paquetes[0].nombre).toBe("Fin de semana");
  });
});
