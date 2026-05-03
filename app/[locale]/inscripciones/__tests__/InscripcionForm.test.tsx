import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InscripcionForm } from "../components/InscripcionForm";
import type { Cliente, Inscripcion, Reserva } from "@/types";

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

const cliente: Cliente = {
  id: "c-1",
  nombre: "Luis",
  apellido: "Ruiz",
  tipoDocumento: "CC",
  numeroDocumento: "222",
  correo: "luis@test.com",
  telefono: "+57",
  nacionalidad: "CO",
  fechaNacimiento: "1991-01-01",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const reserva: Reserva = {
  id: "r-1",
  clienteId: "c-1",
  habitacionNumero: "202",
  tipoHabitacion: "SUITE",
  fechaEntrada: "2026-04-01",
  fechaSalida: "2026-04-05",
  numeroHuespedes: 2,
  total: 150000,
  estado: "confirmada",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const inscripcionPendiente: Inscripcion = {
  id: "ins-e1",
  categoria: "evento",
  nombreActividad: "Título",
  descripcion: "Detalle",
  clienteId: "c-1",
  fechaEvento: "2026-07-01",
  horaInicio: "10:00",
  numeroPersonas: 2,
  estado: "pendiente",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  inscripcionInicial: null as Inscripcion | null,
  clientes: [cliente],
  reservas: [reserva],
};

describe("InscripcionForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("envía una nueva inscripción con datos válidos", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<InscripcionForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText("inscripciones.campos.nombreActividad"),
      "Degustación",
    );
    await user.type(
      screen.getByLabelText("inscripciones.campos.descripcion"),
      "Menú degustación",
    );
    await user.selectOptions(
      screen.getByLabelText("inscripciones.campos.cliente"),
      "c-1",
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreActividad: "Degustación",
          descripcion: "Menú degustación",
          clienteId: "c-1",
          estado: "pendiente",
        }),
      );
    });
  });

  it("muestra error si falta la descripción", async () => {
    const user = userEvent.setup();
    render(<InscripcionForm {...defaultProps} />);

    await user.type(
      screen.getByLabelText("inscripciones.campos.nombreActividad"),
      "Solo nombre",
    );
    await user.selectOptions(
      screen.getByLabelText("inscripciones.campos.cliente"),
      "c-1",
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
  });

  it("edita una inscripción pendiente", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });
    render(
      <InscripcionForm
        {...defaultProps}
        inscripcionInicial={inscripcionPendiente}
        onEdit={onEdit}
      />,
    );

    await user.clear(
      screen.getByLabelText("inscripciones.campos.nombreActividad"),
    );
    await user.type(
      screen.getByLabelText("inscripciones.campos.nombreActividad"),
      "Título nuevo",
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "ins-e1",
        expect.objectContaining({ nombreActividad: "Título nuevo" }),
      );
    });
  });
});
