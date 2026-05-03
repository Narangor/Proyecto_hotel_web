import { renderHook, act } from "@testing-library/react";
import { useAgendamientosTour } from "../hooks/useAgendamientosTour";
import type {
  AgendamientoTour,
  AgendamientoTourFormData,
  Cliente,
  Reserva,
  TourCatalogo,
} from "@/types";

const cliente: Cliente = {
  id: "c-1",
  nombre: "Eva",
  apellido: "Mesa",
  tipoDocumento: "CC",
  numeroDocumento: "555",
  correo: "e@test.com",
  telefono: "+57",
  nacionalidad: "CO",
  fechaNacimiento: "1990-01-01",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const reserva: Reserva = {
  id: "r-1",
  clienteId: "c-1",
  habitacionNumero: "303",
  tipoHabitacion: "DOBLE",
  fechaEntrada: "2026-05-01",
  fechaSalida: "2026-05-05",
  numeroHuespedes: 2,
  total: 200000,
  estado: "confirmada",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const tourCat: TourCatalogo = {
  id: "tour-c1",
  nombre: "City tour",
  duracionHoras: 3,
  descripcion: "Centro histórico",
};

const agPendiente: AgendamientoTour = {
  id: "ag-1",
  tourCatalogoId: "tour-c1",
  clienteId: "c-1",
  fecha: "2026-06-01",
  horaSalida: "08:00",
  numeroParticipantes: 2,
  estado: "pendiente",
  puntoEncuentro: "Lobby",
  creadoEn: "2026-03-01T12:00:00.000Z",
};

const agRealizado: AgendamientoTour = {
  ...agPendiente,
  id: "ag-2",
  estado: "realizado",
  creadoEn: "2026-02-01T12:00:00.000Z",
};

const datosValidos: AgendamientoTourFormData = {
  tourCatalogoId: "tour-c1",
  clienteId: "c-1",
  reservaId: "r-1",
  fecha: "2026-08-01",
  horaSalida: "09:00",
  numeroParticipantes: 3,
  estado: "pendiente",
  puntoEncuentro: "Puerta principal",
  guiaAsignado: "Guía 1",
};

describe("useAgendamientosTour", () => {
  it("expone filas con tour y cliente", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([agPendiente], [tourCat], [cliente], [reserva]),
    );
    expect(result.current.filas).toHaveLength(1);
    expect(result.current.filas[0].tour?.nombre).toBe("City tour");
    expect(result.current.filas[0].cliente?.nombre).toBe("Eva");
  });

  it("crea un agendamiento válido", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([], [tourCat], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.crearAgendamiento(datosValidos);
    });
    expect(resp.ok).toBe(true);
    expect(result.current.totalAgendamientos).toBe(1);
  });

  it("rechaza datos incompletos", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([], [tourCat], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.crearAgendamiento({
        ...datosValidos,
        puntoEncuentro: "   ",
      });
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("datosIncompletos");
  });

  it("edita en estado editable", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([agPendiente], [tourCat], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.editarAgendamiento(agPendiente.id, {
        ...datosValidos,
        puntoEncuentro: "Nuevo punto",
      });
    });
    expect(resp.ok).toBe(true);
    expect(result.current.filas[0].agendamiento.puntoEncuentro).toBe("Nuevo punto");
  });

  it("no edita en estado no editable", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([agRealizado], [tourCat], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.editarAgendamiento(agRealizado.id, datosValidos);
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("noEditable");
  });

  it("cancela agendamientos cancelables", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([agPendiente], [tourCat], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.cancelarAgendamiento(agPendiente.id, "Lluvia");
    });
    expect(resp.ok).toBe(true);
    expect(result.current.filas[0].agendamiento.estado).toBe("cancelado");
  });

  it("no cancela si el estado no es cancelable", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([agRealizado], [tourCat], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.cancelarAgendamiento(agRealizado.id);
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("noCancelable");
  });

  it("filtra por texto en punto de encuentro", () => {
    const otro: AgendamientoTour = {
      ...agPendiente,
      id: "ag-3",
      puntoEncuentro: "Otro lugar",
      creadoEn: "2026-01-01T12:00:00.000Z",
    };
    const { result } = renderHook(() =>
      useAgendamientosTour([otro, agPendiente], [tourCat], [cliente], [reserva]),
    );
    act(() => {
      result.current.setFiltroTexto("Lobby");
    });
    expect(result.current.filas).toHaveLength(1);
    expect(result.current.filas[0].agendamiento.id).toBe(agPendiente.id);
  });

  it("cambia estado cuando existe el id", () => {
    const { result } = renderHook(() =>
      useAgendamientosTour([agPendiente], [tourCat], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.cambiarEstado(agPendiente.id, "confirmado");
    });
    expect(resp.ok).toBe(true);
    expect(result.current.filas[0].agendamiento.estado).toBe("confirmado");
  });
});
