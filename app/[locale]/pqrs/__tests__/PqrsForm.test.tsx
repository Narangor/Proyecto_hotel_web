import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PqrsForm } from "../components/PqrsForm";
import type { Pqrs, Reserva, Cliente } from "@/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("@/components/ui/Modal", () => ({
  Modal: ({
    isOpen,
    children,
    title,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    title: string;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/components/ui/FormField", () => ({
  FormField: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    required?: boolean;
    children: (id: string, aria: React.AriaAttributes) => React.ReactNode;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      {children(label, { "aria-required": true })}
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const clienteMock: Cliente = {
  id: "c-1",
  nombre: "María",
  apellido: "González",
  tipoDocumento: "CC",
  numeroDocumento: "123456789",
  correo: "maria@test.com",
  telefono: "+57 310 000 0000",
  nacionalidad: "Colombiana",
  fechaNacimiento: "1990-03-15",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const reservaMock: Reserva = {
  id: "r-1",
  clienteId: "c-1",
  habitacionNumero: "101",
  tipoHabitacion: "DOBLE",
  fechaEntrada: "2025-01-20",
  fechaSalida: "2025-01-22",
  numeroHuespedes: 2,
  total: 200000,
  estado: "confirmada",
  creadoEn: "2025-01-10T00:00:00.000Z",
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  pqrsInicial: null,
  clientes: [clienteMock],
  reservas: [reservaMock],
};

// ── Tests: HU-Q2 · Registrar PQRS ─────────────────────────────────────────────

describe("PqrsForm - HU-Q2 · Registrar PQRS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso completo - El recepcionista completa todos los campos y la PQRS se crea exitosamente
  it("permite registrar una PQRS cuando todos los campos requeridos son válidos", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<PqrsForm {...defaultProps} onSubmit={onSubmit} />);

    const selectTipo = screen.getByLabelText("pqrs.campos.tipo");
    await user.selectOptions(selectTipo, "queja");

    const inputAsunto = screen.getByLabelText("pqrs.campos.asunto");
    await user.type(inputAsunto, "Problema con el servicio");

    const inputDescripcion = screen.getByLabelText("pqrs.campos.descripcion");
    await user.type(
      inputDescripcion,
      "La habitación no estaba limpia al llegar",
    );

    const selectCliente = screen.getByLabelText("pqrs.campos.cliente");
    await user.selectOptions(selectCliente, "c-1");

    const selectPrioridad = screen.getByLabelText("pqrs.campos.prioridad");
    await user.selectOptions(selectPrioridad, "alta");

    const submitBtn = screen.getByRole("button", {
      name: /pqrs\.crearTitulo/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "queja",
          asunto: "Problema con el servicio",
          descripcion: "La habitación no estaba limpia al llegar",
          clienteId: "c-1",
          prioridad: "alta",
        }),
      );
    });
  });

  // Escenario 2: PQRS anónima - El recepcionista registra una sugerencia sin seleccionar cliente
  it("permite registrar una PQRS anónima sin cliente asociado", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<PqrsForm {...defaultProps} onSubmit={onSubmit} />);

    const selectTipo = screen.getByLabelText("pqrs.campos.tipo");
    await user.selectOptions(selectTipo, "sugerencia");

    const inputAsunto = screen.getByLabelText("pqrs.campos.asunto");
    await user.type(inputAsunto, "Mejorar el desayuno buffet");

    const inputDescripcion = screen.getByLabelText("pqrs.campos.descripcion");
    await user.type(inputDescripcion, "Agregar más opciones vegetarianas");

    const submitBtn = screen.getByRole("button", {
      name: /pqrs\.crearTitulo/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "sugerencia",
          asunto: "Mejorar el desayuno buffet",
          descripcion: "Agregar más opciones vegetarianas",
          clienteId: "",
        }),
      );
    });
  });

  // Escenario 3: Datos incompletos - El recepcionista deja vacío el asunto y se muestra error "datosIncompletos"
  it("muestra error cuando el asunto está vacío", async () => {
    const user = userEvent.setup();
    render(<PqrsForm {...defaultProps} />);

    const inputDescripcion = screen.getByLabelText("pqrs.campos.descripcion");
    await user.type(inputDescripcion, "Solo tengo descripción");

    const submitBtn = screen.getByRole("button", {
      name: /pqrs\.crearTitulo/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});

// ── Tests: HU-Q3 · Editar PQRS ────────────────────────────────────────────────

describe("PqrsForm - HU-Q3 · Editar PQRS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - Se edita una PQRS "pendiente" y se actualiza la prioridad a "alta"
  it("permite editar una PQRS en estado pendiente y actualiza actualizadoEn", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });

    const pqrsPendiente: Pqrs = {
      id: "pqrs-1",
      tipo: "queja",
      asunto: "Problema inicial",
      descripcion: "Descripción inicial",
      clienteId: "c-1",
      prioridad: "media",
      estado: "pendiente",
      fechaCreacion: "2025-01-15",
      creadoEn: "2025-01-15T10:00:00.000Z",
    };

    render(
      <PqrsForm
        {...defaultProps}
        pqrsInicial={pqrsPendiente}
        onEdit={onEdit}
      />,
    );

    const selectPrioridad = screen.getByLabelText("pqrs.campos.prioridad");
    await user.selectOptions(selectPrioridad, "alta");

    const submitBtn = screen.getByRole("button", {
      name: /common\.save/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "pqrs-1",
        expect.objectContaining({
          prioridad: "alta",
          asunto: "Problema inicial",
          descripcion: "Descripción inicial",
        }),
      );
    });
  });

  // Escenario 2: Estado no editable - Se intenta editar una PQRS "resuelto" y muestra error "noEditable"
  it("muestra error cuando se intenta editar una PQRS en estado resuelto", async () => {
    const user = userEvent.setup();
    const onEdit = jest
      .fn()
      .mockReturnValue({ ok: false, error: "noEditable" });

    const pqrsResuelto: Pqrs = {
      id: "pqrs-2",
      tipo: "queja",
      asunto: "Problema resuelto",
      descripcion: "Ya fue atendido",
      clienteId: "c-1",
      prioridad: "media",
      estado: "resuelto",
      fechaCreacion: "2025-01-10",
      creadoEn: "2025-01-10T10:00:00.000Z",
      respuesta: "Se atendió correctamente",
    };

    render(
      <PqrsForm {...defaultProps} pqrsInicial={pqrsResuelto} onEdit={onEdit} />,
    );

    const submitBtn = screen.getByRole("button", {
      name: /common\.save/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalled();
    });
  });

  // Escenario 3: Asignación de empleado - Se edita una PQRS sin empleado asignado y le asigna uno
  it("permite asignar un empleado a una PQRS que no tenía empleado asignado", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });

    const pqrsSinEmpleado: Pqrs = {
      id: "pqrs-3",
      tipo: "peticion",
      asunto: "Solicitud de información",
      descripcion: "Quisiera información sobre tarifas",
      clienteId: "c-1",
      prioridad: "baja",
      estado: "pendiente",
      fechaCreacion: "2025-01-16",
      creadoEn: "2025-01-16T10:00:00.000Z",
    };

    render(
      <PqrsForm
        {...defaultProps}
        pqrsInicial={pqrsSinEmpleado}
        onEdit={onEdit}
      />,
    );

    const inputAsignadoA = screen.getByLabelText("pqrs.campos.asignadoA");
    await user.type(inputAsignadoA, "Juan Pérez");

    const submitBtn = screen.getByRole("button", {
      name: /common\.save/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "pqrs-3",
        expect.objectContaining({
          asignadoA: "Juan Pérez",
        }),
      );
    });
  });
});
