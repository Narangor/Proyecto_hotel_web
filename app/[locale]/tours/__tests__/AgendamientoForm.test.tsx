import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendamientoForm } from "../components/AgendamientoForm";
import type {
  AgendamientoTour,
  Cliente,
  Reserva,
  TourCatalogo,
} from "@/types";

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
  nombre: "Nora",
  apellido: "Ruiz",
  tipoDocumento: "CC",
  numeroDocumento: "666",
  correo: "n@test.com",
  telefono: "+57",
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
  fechaSalida: "2026-04-05",
  numeroHuespedes: 2,
  total: 100000,
  estado: "confirmada",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const catalogo: TourCatalogo[] = [
  {
    id: "tour-a",
    nombre: "Mirador",
    duracionHoras: 2,
    descripcion: "Vistas",
  },
];

const agendamientoPendiente: AgendamientoTour = {
  id: "ag-e1",
  tourCatalogoId: "tour-a",
  clienteId: "c-1",
  fecha: "2026-07-01",
  horaSalida: "10:00",
  numeroParticipantes: 2,
  estado: "pendiente",
  puntoEncuentro: "Lobby",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  agendamientoInicial: null as AgendamientoTour | null,
  catalogo,
  clientes: [cliente],
  reservas: [reserva],
};

describe("AgendamientoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crea agendamiento con datos válidos", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<AgendamientoForm {...defaultProps} onSubmit={onSubmit} />);

    await user.selectOptions(
      screen.getByLabelText("tours.campos.cliente"),
      "c-1",
    );
    await user.type(
      screen.getByLabelText("tours.campos.puntoEncuentro"),
      "Entrada norte",
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          clienteId: "c-1",
          tourCatalogoId: "tour-a",
          puntoEncuentro: "Entrada norte",
          estado: "pendiente",
        }),
      );
    });
  });

  it("valida punto de encuentro vacío", async () => {
    const user = userEvent.setup();
    render(<AgendamientoForm {...defaultProps} />);

    await user.selectOptions(
      screen.getByLabelText("tours.campos.cliente"),
      "c-1",
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
  });

  it("edita agendamiento pendiente", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });
    render(
      <AgendamientoForm
        {...defaultProps}
        agendamientoInicial={agendamientoPendiente}
        onEdit={onEdit}
      />,
    );

    await user.clear(
      screen.getByLabelText("tours.campos.puntoEncuentro"),
    );
    await user.type(
      screen.getByLabelText("tours.campos.puntoEncuentro"),
      "Lobby sur",
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "ag-e1",
        expect.objectContaining({ puntoEncuentro: "Lobby sur" }),
      );
    });
  });
});
