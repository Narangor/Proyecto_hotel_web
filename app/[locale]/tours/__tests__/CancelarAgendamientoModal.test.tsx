import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CancelarAgendamientoModal } from "../components/CancelarAgendamientoModal";
import type { AgendamientoTour, Cliente, Reserva, TourCatalogo } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("@/components/ui/Modal", () => ({
  Modal: ({
    isOpen,
    children,
    title,
    onClose,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    title: string;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

const cliente: Cliente = {
  id: "c-1",
  nombre: "Leo",
  apellido: "Paz",
  tipoDocumento: "CC",
  numeroDocumento: "777",
  correo: "l@test.com",
  telefono: "+57",
  nacionalidad: "CO",
  fechaNacimiento: "1990-01-01",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const reserva: Reserva = {
  id: "r-xyz99",
  clienteId: "c-1",
  habitacionNumero: "404",
  tipoHabitacion: "SUITE",
  fechaEntrada: "2026-05-01",
  fechaSalida: "2026-05-07",
  numeroHuespedes: 2,
  total: 300000,
  estado: "confirmada",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const tour: TourCatalogo = {
  id: "tour-t1",
  nombre: "Ruta verde",
  duracionHoras: 4,
  descripcion: "Naturaleza",
};

const agendamiento: AgendamientoTour = {
  id: "ag-can",
  tourCatalogoId: "tour-t1",
  clienteId: "c-1",
  fecha: "2026-08-01",
  horaSalida: "07:00",
  numeroParticipantes: 4,
  estado: "confirmado",
  puntoEncuentro: "Lobby",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const defaultProps = {
  agendamiento: null as AgendamientoTour | null,
  cliente,
  reserva,
  tour,
  onConfirmar: jest.fn().mockReturnValue({ ok: true }),
  onCerrar: jest.fn(),
};

describe("CancelarAgendamientoModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no renderiza sin agendamiento", () => {
    const { container } = render(
      <CancelarAgendamientoModal {...defaultProps} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("confirma cancelación con motivo", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest.fn().mockReturnValue({ ok: true });
    render(
      <CancelarAgendamientoModal
        {...defaultProps}
        agendamiento={agendamiento}
        onConfirmar={onConfirmar}
      />,
    );

    await user.type(
      screen.getByLabelText("tours.cancelar.motivo"),
      "Clima adverso",
    );
    await user.click(screen.getByRole("button", { name: "common.confirm" }));

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("ag-can", "Clima adverso");
    });
  });
});
