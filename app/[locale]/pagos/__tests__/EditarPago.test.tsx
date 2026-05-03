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

const pagoPendienteMock: Pago = {
  id: "p-1",
  reservaId: "r-1",
  monto: 200000,
  fecha: "2025-01-20",
  metodoPago: "EFECTIVO",
  estado: "pendiente",
  referencia: "REF-001",
  creadoEn: "2025-01-20T10:00:00.000Z",
};

const pagoCompletadoMock: Pago = {
  id: "p-2",
  reservaId: "r-1",
  monto: 200000,
  fecha: "2025-01-20",
  metodoPago: "TARJETA_CREDITO",
  estado: "completado",
  referencia: "REF-002",
  creadoEn: "2025-01-20T10:00:00.000Z",
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

// ── Tests: HU-P3 · Editar pago ────────────────────────────────────────────────

describe("PagoForm - HU-P3 · Editar pago", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - El contador edita el monto de un pago pendiente y los cambios se guardan correctamente
  it("permite editar el monto de un pago pendiente y guardar los cambios", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });
    render(
      <PagoForm
        {...defaultProps}
        pagoInicial={pagoPendienteMock}
        onEdit={onEdit}
      />,
    );

    const inputMonto = screen.getByLabelText("pagos.campos.monto");
    await user.clear(inputMonto);
    await user.type(inputMonto, "150000");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "p-1",
        expect.objectContaining({
          monto: 150000,
        }),
      );
    });
  });

  // Escenario 2: Pago no editable - El contador intenta editar un pago completado y se muestra error "noEditable"
  it("muestra error cuando se intenta editar un pago en estado completado", async () => {
    const user = userEvent.setup();
    const onEdit = jest
      .fn()
      .mockReturnValue({ ok: false, error: "noEditable" });
    render(
      <PagoForm
        {...defaultProps}
        pagoInicial={pagoCompletadoMock}
        onEdit={onEdit}
      />,
    );

    const inputMonto = screen.getByLabelText("pagos.campos.monto");
    await user.clear(inputMonto);
    await user.type(inputMonto, "150000");

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("pagos.errores.noEditable")).toBeInTheDocument();
    });
  });

  // Escenario 3: Validación de monto - El contador intenta cambiar el monto a 0 y se muestra error "montoInvalido"
  it("muestra error cuando el monto se cambia a 0", async () => {
    const user = userEvent.setup();
    render(<PagoForm {...defaultProps} pagoInicial={pagoPendienteMock} />);

    const inputMonto = screen.getByLabelText("pagos.campos.monto");
    await user.clear(inputMonto);

    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("pagos.errores.montoInvalido"),
      ).toBeInTheDocument();
    });

    expect(defaultProps.onEdit).not.toHaveBeenCalled();
  });
});
