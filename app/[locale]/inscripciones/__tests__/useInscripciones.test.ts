import { renderHook, act } from "@testing-library/react";
import { useInscripciones } from "../hooks/useInscripciones";
import type { Cliente, Inscripcion, InscripcionFormData, Reserva } from "@/types";

const cliente: Cliente = {
  id: "c-1",
  nombre: "Ana",
  apellido: "López",
  tipoDocumento: "CC",
  numeroDocumento: "111",
  correo: "ana@test.com",
  telefono: "+57 310",
  nacionalidad: "CO",
  fechaNacimiento: "1990-01-01",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const reserva: Reserva = {
  id: "r-1",
  clienteId: "c-1",
  habitacionNumero: "101",
  tipoHabitacion: "DOBLE",
  fechaEntrada: "2026-04-01",
  fechaSalida: "2026-04-03",
  numeroHuespedes: 2,
  total: 100000,
  estado: "confirmada",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const insPendiente: Inscripcion = {
  id: "ins-p1",
  categoria: "evento",
  nombreActividad: "Cena gala",
  descripcion: "Evento formal",
  clienteId: "c-1",
  reservaId: "r-1",
  fechaEvento: "2026-05-01",
  horaInicio: "19:00",
  numeroPersonas: 2,
  estado: "pendiente",
  creadoEn: "2026-03-01T12:00:00.000Z",
};

const insConfirmada: Inscripcion = {
  ...insPendiente,
  id: "ins-c1",
  estado: "confirmada",
  creadoEn: "2026-03-02T12:00:00.000Z",
};

const datosValidos: InscripcionFormData = {
  categoria: "restaurante",
  nombreActividad: "Brunch",
  descripcion: "Mesa para cuatro",
  clienteId: "c-1",
  reservaId: "r-1",
  fechaEvento: "2026-06-01",
  horaInicio: "11:00",
  numeroPersonas: 4,
  estado: "pendiente",
};

describe("useInscripciones", () => {
  it("expone filas con relaciones cliente y reserva", () => {
    const { result } = renderHook(() =>
      useInscripciones([insPendiente], [cliente], [reserva]),
    );
    expect(result.current.inscripciones).toHaveLength(1);
    expect(result.current.inscripciones[0].cliente?.nombre).toBe("Ana");
    expect(result.current.inscripciones[0].reserva?.id).toBe("r-1");
  });

  it("crea una inscripción válida y reinicia a la página 1", () => {
    const { result } = renderHook(() =>
      useInscripciones([], [cliente], [reserva]),
    );
    act(() => {
      result.current.setPagina(2);
    });
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.crearInscripcion(datosValidos);
    });
    expect(resp.ok).toBe(true);
    expect(result.current.totalInscripciones).toBe(1);
    expect(result.current.pagina).toBe(1);
  });

  it("rechaza crear con datos incompletos", () => {
    const { result } = renderHook(() =>
      useInscripciones([], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.crearInscripcion({
        ...datosValidos,
        nombreActividad: "   ",
      });
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("datosIncompletos");
  });

  it("edita una inscripción en estado editable", () => {
    const { result } = renderHook(() =>
      useInscripciones([insPendiente], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.editarInscripcion(insPendiente.id, {
        ...datosValidos,
        nombreActividad: "Cena actualizada",
      });
    });
    expect(resp.ok).toBe(true);
    expect(
      result.current.inscripciones.find(
        (x) => x.inscripcion.id === insPendiente.id,
      )?.inscripcion.nombreActividad,
    ).toBe("Cena actualizada");
  });

  it("no edita cuando el estado no es editable", () => {
    const completada: Inscripcion = { ...insPendiente, id: "ins-x", estado: "completada" };
    const { result } = renderHook(() =>
      useInscripciones([completada], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.editarInscripcion(completada.id, datosValidos);
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("noEditable");
  });

  it("elimina solo inscripciones en estado eliminable", () => {
    const { result } = renderHook(() =>
      useInscripciones([insPendiente], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.eliminarInscripcion(insPendiente.id);
    });
    expect(resp.ok).toBe(true);
    expect(result.current.totalInscripciones).toBe(0);
  });

  it("no elimina cuando el estado no es eliminable", () => {
    const { result } = renderHook(() =>
      useInscripciones([insConfirmada], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.eliminarInscripcion(insConfirmada.id);
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("noEliminable");
  });

  it("cancela una inscripción editable", () => {
    const { result } = renderHook(() =>
      useInscripciones([insPendiente], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.cancelarInscripcion(insPendiente.id, "Cambio de planes");
    });
    expect(resp.ok).toBe(true);
    expect(
      result.current.inscripciones[0].inscripcion.estado,
    ).toBe("cancelada");
    expect(
      result.current.inscripciones[0].inscripcion.motivoCancelacion,
    ).toBe("Cambio de planes");
  });

  it("filtra por texto en nombre de actividad", () => {
    const otra: Inscripcion = {
      ...insPendiente,
      id: "ins-2",
      nombreActividad: "Otro evento",
      creadoEn: "2026-02-01T12:00:00.000Z",
    };
    const { result } = renderHook(() =>
      useInscripciones([otra, insPendiente], [cliente], [reserva]),
    );
    act(() => {
      result.current.setFiltroTexto("gala");
    });
    expect(result.current.inscripciones).toHaveLength(1);
    expect(result.current.inscripciones[0].inscripcion.id).toBe(insPendiente.id);
  });

  it("cambia estado cuando el registro existe", () => {
    const { result } = renderHook(() =>
      useInscripciones([insPendiente], [cliente], [reserva]),
    );
    let resp!: { ok: boolean; error?: string };
    act(() => {
      resp = result.current.cambiarEstado(insPendiente.id, "confirmada");
    });
    expect(resp.ok).toBe(true);
    expect(result.current.inscripciones[0].inscripcion.estado).toBe("confirmada");
  });
});
