import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CancelarInscripcionModal } from "../components/CancelarInscripcionModal";
import type { Cliente, Inscripcion, Reserva } from "@/types";

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
  nombre: "María",
  apellido: "Díaz",
  tipoDocumento: "CC",
  numeroDocumento: "333",
  correo: "m@test.com",
  telefono: "+57",
  nacionalidad: "CO",
  fechaNacimiento: "1991-01-01",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const reserva: Reserva = {
  id: "r-abc12",
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

const inscripcion: Inscripcion = {
  id: "ins-1",
  categoria: "evento",
  nombreActividad: "Tour",
  descripcion: "Desc",
  clienteId: "c-1",
  fechaEvento: "2026-05-01",
  horaInicio: "09:00",
  numeroPersonas: 1,
  estado: "pendiente",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const defaultProps = {
  inscripcion: null as Inscripcion | null,
  cliente,
  reserva,
  onConfirmar: jest.fn().mockReturnValue({ ok: true }),
  onCerrar: jest.fn(),
};

describe("CancelarInscripcionModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no renderiza nada si no hay inscripción", () => {
    const { container } = render(<CancelarInscripcionModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("confirma cancelación con motivo", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest.fn().mockReturnValue({ ok: true });
    render(
      <CancelarInscripcionModal
        {...defaultProps}
        inscripcion={inscripcion}
        onConfirmar={onConfirmar}
      />,
    );

    await user.type(
      screen.getByLabelText("inscripciones.cancelar.motivo"),
      "Cliente canceló",
    );
    await user.click(screen.getByRole("button", { name: "common.confirm" }));

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("ins-1", "Cliente canceló");
    });
  });
});
