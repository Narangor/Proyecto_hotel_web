import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnularPagoModal } from "../components/AnularPagoModal";
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
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
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

const pagoCompletadoMock: Pago = {
  id: "p-1",
  reservaId: "r-1",
  monto: 200000,
  fecha: "2025-01-20",
  metodoPago: "TARJETA_CREDITO",
  estado: "completado",
  referencia: "REF-001",
  creadoEn: "2025-01-20T10:00:00.000Z",
};

const pagoAnuladoMock: Pago = {
  id: "p-2",
  reservaId: "r-1",
  monto: 150000,
  fecha: "2025-01-19",
  metodoPago: "EFECTIVO",
  estado: "anulado",
  motivoAnulacion: "Pago duplicado anterior",
  creadoEn: "2025-01-19T09:00:00.000Z",
};

const defaultProps = {
  pago: null,
  reserva: reservaMock,
  cliente: clienteMock,
  onConfirmar: jest.fn().mockReturnValue({ ok: true }),
  onCerrar: jest.fn(),
};

// ── Tests: HU-P4 · Anular pago ────────────────────────────────────────────────

describe("AnularPagoModal - HU-P4 · Anular pago", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso con motivo - Dado que existe un pago "completado", cuando el administrador lo anula ingresando motivo "Cobro duplicado" entonces el pago cambia a "anulado" y se guarda el motivo
  it("permite anular un pago completado con motivo y cambia su estado a anulado", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest.fn().mockReturnValue({ ok: true });
    render(
      <AnularPagoModal
        {...defaultProps}
        pago={pagoCompletadoMock}
        onConfirmar={onConfirmar}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("pagos.anular.titulo")).toBeInTheDocument();

    const motivoTextarea = screen.getByLabelText("pagos.anular.motivo");
    await user.type(motivoTextarea, "Cobro duplicado");

    const confirmarBtn = screen.getByRole("button", {
      name: /Confirmar anulación de pago de Juan Pérez/i,
    });
    await user.click(confirmarBtn);

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("p-1", "Cobro duplicado");
    });
  });

  // Escenario 2: Pago no anulable - Dado que existe un pago en estado "anulado", cuando el administrador intenta anularlo nuevamente entonces se muestra error "noAnulable"
  it("muestra error cuando se intenta anular un pago ya anulado", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest
      .fn()
      .mockReturnValue({ ok: false, error: "noAnulable" });
    render(
      <AnularPagoModal
        {...defaultProps}
        pago={pagoAnuladoMock}
        onConfirmar={onConfirmar}
      />,
    );

    const confirmarBtn = screen.getByRole("button", {
      name: /Confirmar anulación de pago de Juan Pérez/i,
    });
    await user.click(confirmarBtn);

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("p-2", undefined);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("pagos.errores.noAnulable")).toBeInTheDocument();
    });
  });

  // Escenario 3: Confirmación requerida - Dado que el administrador intenta anular un pago, cuando presiona el botón anular entonces se muestra modal de confirmación antes de seguir
  it("muestra modal de confirmación con detalles del pago antes de anular", () => {
    render(<AnularPagoModal {...defaultProps} pago={pagoCompletadoMock} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("pagos.anular.titulo")).toBeInTheDocument();

    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /common\.cancel/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Confirmar anulación de pago de Juan Pérez/i,
      }),
    ).toBeInTheDocument();
  });
});
