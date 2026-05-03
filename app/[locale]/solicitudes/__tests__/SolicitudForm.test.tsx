import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolicitudForm } from "../components/SolicitudForm";
import type { Reserva, Cliente, Solicitud } from "@/types";

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
  nombre: "Juan",
  apellido: "Pérez",
  tipoDocumento: "CC",
  numeroDocumento: "123456789",
  correo: "juan@test.com",
  telefono: "+57 310 000 0000",
  nacionalidad: "Colombiana",
  fechaNacimiento: "1990-01-01",
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

const solicitudPendienteMock: Solicitud = {
  id: "s-1",
  reservaId: "r-1",
  tipo: "limpieza",
  descripcion: "Limpieza de habitación",
  habitacionNumero: "101",
  prioridad: "media",
  estado: "pendiente",
  fechaSolicitud: "2025-01-20T10:00:00.000Z",
  creadoEn: "2025-01-20T10:00:00.000Z",
};

const solicitudEnProcesoMock: Solicitud = {
  id: "s-2",
  reservaId: "r-1",
  tipo: "comida",
  descripcion: "Servicio de habitación",
  habitacionNumero: "101",
  prioridad: "alta",
  estado: "en_proceso",
  empleadoAsignado: "Juan García",
  fechaSolicitud: "2025-01-20T11:00:00.000Z",
  creadoEn: "2025-01-20T11:00:00.000Z",
};

const solicitudSinEmpleadoMock: Solicitud = {
  id: "s-3",
  reservaId: "r-1",
  tipo: "mantenimiento",
  descripcion: "Reparación de aire acondicionado",
  habitacionNumero: "101",
  prioridad: "baja",
  estado: "pendiente",
  fechaSolicitud: "2025-01-20T12:00:00.000Z",
  creadoEn: "2025-01-20T12:00:00.000Z",
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  solicitudInicial: null,
  reservas: [reservaMock],
  clientes: [clienteMock],
};

// ── Tests: HU-S2 · Registrar solicitud de servicio ────────────────────────────

describe("SolicitudForm - HU-S2 · Registrar solicitud de servicio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso completo - El recepcionista completa todos los campos y la solicitud se crea en estado "pendiente"
  it("permite registrar una solicitud cuando todos los campos requeridos son válidos", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<SolicitudForm {...defaultProps} onSubmit={onSubmit} />);

    const selectReserva = screen.getByLabelText("solicitudes.campos.reserva");
    await user.selectOptions(selectReserva, "r-1");

    const selectTipo = screen.getByLabelText("solicitudes.campos.tipo");
    await user.selectOptions(selectTipo, "limpieza");

    const inputDescripcion = screen.getByLabelText(
      "solicitudes.campos.descripcion",
    );
    await user.type(inputDescripcion, "Solicitud de limpieza urgente");

    const selectPrioridad = screen.getByLabelText(
      "solicitudes.campos.prioridad",
    );
    await user.selectOptions(selectPrioridad, "alta");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          reservaId: "r-1",
          tipo: "limpieza",
          descripcion: "Solicitud de limpieza urgente",
          habitacionNumero: "101",
          prioridad: "alta",
        }),
      );
    });
  });

  // Escenario 2: Descripción faltante - El recepcionista no ingresa descripcion y se muestra el error "descripcionRequerida"
  it("muestra error cuando la descripción está vacía", async () => {
    const user = userEvent.setup();
    render(<SolicitudForm {...defaultProps} />);

    const selectReserva = screen.getByLabelText("solicitudes.campos.reserva");
    await user.selectOptions(selectReserva, "r-1");

    const selectTipo = screen.getByLabelText("solicitudes.campos.tipo");
    await user.selectOptions(selectTipo, "comida");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // Escenario 3: Con asignación inmediata - Se registra la solicitud asignando un empleado desde el inicio
  it("permite registrar solicitud con empleado asignado", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<SolicitudForm {...defaultProps} onSubmit={onSubmit} />);

    const selectReserva = screen.getByLabelText("solicitudes.campos.reserva");
    await user.selectOptions(selectReserva, "r-1");

    const selectTipo = screen.getByLabelText("solicitudes.campos.tipo");
    await user.selectOptions(selectTipo, "mantenimiento");

    const inputDescripcion = screen.getByLabelText(
      "solicitudes.campos.descripcion",
    );
    await user.type(inputDescripcion, "Reparacion de aire acondicionado");

    const inputEmpleado = screen.getByLabelText(
      "solicitudes.campos.empleadoAsignado",
    );
    await user.type(inputEmpleado, "Carlos Martínez");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          reservaId: "r-1",
          tipo: "mantenimiento",
          descripcion: "Reparacion de aire acondicionado",
          empleadoAsignado: "Carlos Martínez",
        }),
      );
    });
  });
});

// ── Tests: HU-S3 · Editar solicitud de servicio ───────────────────────────────

describe("SolicitudForm - HU-S3 · Editar solicitud de servicio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - Dado que existe una solicitud "pendiente", cuando se actualiza la prioridad a "alta" entonces los cambios se guardan correctamente
  it("permite editar la prioridad de una solicitud pendiente y guardar los cambios", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });
    render(
      <SolicitudForm
        {...defaultProps}
        solicitudInicial={solicitudPendienteMock}
        onEdit={onEdit}
      />,
    );

    const selectPrioridad = screen.getByLabelText(
      "solicitudes.campos.prioridad",
    );
    await user.selectOptions(selectPrioridad, "alta");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "s-1",
        expect.objectContaining({
          prioridad: "alta",
        }),
      );
    });
  });

  // Escenario 2: Estado no editable - Dado que existe una solicitud "en_proceso", cuando se intenta editar entonces se muestra error "noEditable"
  it("muestra error cuando se intenta editar una solicitud en estado en_proceso", async () => {
    const user = userEvent.setup();
    const onEdit = jest
      .fn()
      .mockReturnValue({ ok: false, error: "noEditable" });
    render(
      <SolicitudForm
        {...defaultProps}
        solicitudInicial={solicitudEnProcesoMock}
        onEdit={onEdit}
      />,
    );

    const selectPrioridad = screen.getByLabelText(
      "solicitudes.campos.prioridad",
    );
    await user.selectOptions(selectPrioridad, "urgente");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("solicitudes.errores.noEditable"),
      ).toBeInTheDocument();
    });
  });

  // Escenario 3: Asignación de empleado - Dado una solicitud sin empleado, cuando se edita y se asigna uno entonces se guarda la asignación
  it("permite asignar un empleado al editar una solicitud sin empleado", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });
    render(
      <SolicitudForm
        {...defaultProps}
        solicitudInicial={solicitudSinEmpleadoMock}
        onEdit={onEdit}
      />,
    );

    const inputEmpleado = screen.getByLabelText(
      "solicitudes.campos.empleadoAsignado",
    );
    await user.type(inputEmpleado, "María López");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "s-3",
        expect.objectContaining({
          empleadoAsignado: "María López",
        }),
      );
    });
  });
});
