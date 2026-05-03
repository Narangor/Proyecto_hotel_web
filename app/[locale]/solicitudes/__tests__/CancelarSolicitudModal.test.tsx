import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CancelarSolicitudModal } from "../components/CancelarSolicitudModal";
import type { Solicitud, Reserva, Cliente } from "@/types";

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
  apellido: "García",
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
  habitacionNumero: "305",
  tipoHabitacion: "DOBLE",
  fechaEntrada: "2025-01-20",
  fechaSalida: "2025-01-22",
  numeroHuespedes: 2,
  total: 200000,
  estado: "confirmada",
  creadoEn: "2025-01-10T00:00:00.000Z",
};

const solicitudEnProcesoMock: Solicitud = {
  id: "s-1",
  reservaId: "r-1",
  tipo: "comida",
  descripcion: "Servicio de desayuno a la habitación",
  habitacionNumero: "305",
  prioridad: "media",
  estado: "en_proceso",
  empleadoAsignado: "María López",
  fechaSolicitud: "2025-01-20T08:00:00.000Z",
  creadoEn: "2025-01-20T08:00:00.000Z",
};

const solicitudCompletadaMock: Solicitud = {
  id: "s-2",
  reservaId: "r-1",
  tipo: "limpieza",
  descripcion: "Limpieza de habitación",
  habitacionNumero: "305",
  prioridad: "baja",
  estado: "completada",
  fechaSolicitud: "2025-01-19T10:00:00.000Z",
  fechaCompletada: "2025-01-19T12:00:00.000Z",
  creadoEn: "2025-01-19T10:00:00.000Z",
};

const defaultProps = {
  solicitud: null,
  reserva: reservaMock,
  cliente: clienteMock,
  onConfirmar: jest.fn().mockReturnValue({ ok: true }),
  onCerrar: jest.fn(),
};

// ── Tests: HU-S5 · Cancelar solicitud de servicio ─────────────────────────────

describe("CancelarSolicitudModal - HU-S5 · Cancelar solicitud de servicio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso con motivo - Dado que existe una solicitud "en_proceso", cuando el supervisor la cancela con motivo "Huesped se retiró", entonces se cambia a "cancelada" y se guarda el motivo
  it("permite cancelar una solicitud en_proceso con motivo y cambia su estado a cancelada", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest.fn().mockReturnValue({ ok: true });
    render(
      <CancelarSolicitudModal
        {...defaultProps}
        solicitud={solicitudEnProcesoMock}
        onConfirmar={onConfirmar}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("solicitudes.cancelar.titulo")).toBeInTheDocument();

    const motivoTextarea = screen.getByLabelText("solicitudes.cancelar.motivo");
    await user.type(motivoTextarea, "Huésped se retiró");

    const confirmarBtn = screen.getByRole("button", {
      name: /Confirmar cancelación de solicitud de Juan García/i,
    });
    await user.click(confirmarBtn);

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("s-1", "Huésped se retiró");
    });
  });

  // Escenario 2: No cancelable - Dado que existe una solicitud "completada", cuando se intenta cancelar, entonces se muestra error "noCancelable"
  it("muestra error cuando se intenta cancelar una solicitud completada", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest
      .fn()
      .mockReturnValue({ ok: false, error: "noCancelable" });
    render(
      <CancelarSolicitudModal
        {...defaultProps}
        solicitud={solicitudCompletadaMock}
        onConfirmar={onConfirmar}
      />,
    );

    const confirmarBtn = screen.getByRole("button", {
      name: /Confirmar cancelación de solicitud de Juan García/i,
    });
    await user.click(confirmarBtn);

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("s-2", undefined);
      expect(onConfirmar).toHaveReturnedWith({
        ok: false,
        error: "noCancelable",
      });
    });
  });

  // Escenario 3: Confirmación requerida - Dado que se intenta cancelar una solicitud, cuando se presiona cancelar, entonces se muestra modal de confirmación
  it("muestra el modal de confirmación al intentar cancelar una solicitud", () => {
    render(
      <CancelarSolicitudModal
        {...defaultProps}
        solicitud={solicitudEnProcesoMock}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("solicitudes.cancelar.titulo")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirmar/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument();
  });
});
