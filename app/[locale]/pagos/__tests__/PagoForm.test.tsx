import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PagoForm } from "../components/PagoForm";
import type { Pago, Reserva, Cliente } from "@/types";

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

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  pagoInicial: null,
  reservas: [reservaMock],
  clientes: [clienteMock],
};

// ── Tests: HU-P2 · Registrar pago ─────────────────────────────────────────────

describe("PagoForm - HU-P2 · Registrar pago", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - El recepcionista completa todos los campos requeridos correctamente y el pago se crea con estado pendiente
  it("permite registrar un pago cuando todos los campos requeridos son válidos", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<PagoForm {...defaultProps} onSubmit={onSubmit} />);

    const selectReserva = screen.getByLabelText("pagos.campos.reserva");
    await user.selectOptions(selectReserva, "r-1");

    const selectMetodo = screen.getByLabelText("pagos.campos.metodoPago");
    await user.selectOptions(selectMetodo, "TARJETA_CREDITO");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          reservaId: "r-1",
          metodoPago: "TARJETA_CREDITO",
        }),
      );
    });
  });

  // Escenario 2: Monto inválido - El recepcionista intenta registrar un pago con monto 0 o negativo y se muestra el error "montoInvalido"
  it("muestra error cuando el monto es 0 o inválido", async () => {
    const user = userEvent.setup();
    render(<PagoForm {...defaultProps} />);

    const selectReserva = screen.getByLabelText("pagos.campos.reserva");
    await user.selectOptions(selectReserva, "r-1");

    const inputMonto = screen.getByLabelText("pagos.campos.monto");
    await user.clear(inputMonto);

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // Escenario 3: Reserva faltante - El recepcionista no selecciona una reserva y se muestra el error "reservaRequerida"

  it("muestra error cuando no se selecciona una reserva", async () => {
    const user = userEvent.setup();
    render(<PagoForm {...defaultProps} />);

    const inputMonto = screen.getByLabelText("pagos.campos.monto");
    await user.clear(inputMonto);
    await user.type(inputMonto, "100000");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("pagos.errores.reservaRequerida"),
      ).toBeInTheDocument();
    });

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
