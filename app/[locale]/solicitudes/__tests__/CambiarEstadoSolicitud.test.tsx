import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolicitudRow } from "../components/SolicitudRow";
import type { Solicitud, Reserva, Cliente } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("@/components/ui/Badge", () => ({
  Badge: ({ label }: { label: string }) => <span>{label}</span>,
}));

jest.mock("@/components/ui/DropdownMenu", () => ({
  DropdownMenu: ({
    children,
    ariaLabel,
  }: {
    children: React.ReactNode;
    ariaLabel: string;
  }) => (
    <div role="menu" aria-label={ariaLabel}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => <button onClick={onClick}>{children}</button>,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const solicitudPendienteMock: Solicitud = {
  id: "s-pendiente",
  reservaId: "r-1",
  tipo: "limpieza",
  descripcion: "Solicitud de limpieza",
  habitacionNumero: "101",
  prioridad: "media",
  estado: "pendiente",
  fechaSolicitud: "2025-01-15T10:00:00.000Z",
  creadoEn: "2025-01-15T10:00:00.000Z",
};

const solicitudEnProcesoMock: Solicitud = {
  id: "s-en-proceso",
  reservaId: "r-2",
  tipo: "comida",
  descripcion: "Solicitud de servicio a la habitación",
  habitacionNumero: "202",
  prioridad: "alta",
  estado: "en_proceso",
  empleadoAsignado: "María López",
  fechaSolicitud: "2025-01-15T11:00:00.000Z",
  creadoEn: "2025-01-15T11:00:00.000Z",
};

const reservaMock: Reserva = {
  id: "r-1",
  clienteId: "c-1",
  habitacionNumero: "101",
  tipoHabitacion: "DOBLE",
  fechaEntrada: "2025-01-15",
  fechaSalida: "2025-01-17",
  numeroHuespedes: 2,
  total: 150000,
  estado: "confirmada",
  creadoEn: "2025-01-10T00:00:00.000Z",
};

const clienteMock: Cliente = {
  id: "c-1",
  nombre: "Carlos",
  apellido: "Pérez",
  tipoDocumento: "CC",
  numeroDocumento: "123456",
  correo: "carlos@test.com",
  telefono: "+57 310 000 0000",
  nacionalidad: "Colombiana",
  fechaNacimiento: "1985-05-15",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

// ── Tests: HU-S4 · Cambiar estado de solicitud ───────────────────────────────

describe("SolicitudRow - HU-S4 · Cambiar estado de solicitud", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Inicio de atención - Dado que existe una solicitud "pendiente", cuando el empleado la cambia a "en_proceso" entonces el estado se actualiza correctamente
  it("cambia una solicitud de pendiente a en_proceso correctamente", async () => {
    const user = userEvent.setup();
    const onCambiarEstado = jest.fn().mockReturnValue({ ok: true });
    render(
      <table>
        <tbody>
          <SolicitudRow
            solicitud={solicitudPendienteMock}
            reserva={reservaMock}
            cliente={clienteMock}
            onEditar={jest.fn()}
            onCambiarEstado={onCambiarEstado}
            onCancelar={jest.fn()}
          />
        </tbody>
      </table>,
    );

    const startButton = screen.getByRole("button", {
      name: /solicitudes\.start/i,
    });
    await user.click(startButton);

    await waitFor(() => {
      expect(onCambiarEstado).toHaveBeenCalledWith("s-pendiente", "en_proceso");
    });
  });

  // Escenario 2: Completar solicitud - Dado que una solicitud está "en_proceso", cuando el empleado la cambia a "completada" entonces se actualiza el estado y se registra fechaCompletada
  it("cambia una solicitud de en_proceso a completada y registra fechaCompletada", async () => {
    const user = userEvent.setup();
    const onCambiarEstado = jest.fn().mockReturnValue({ ok: true });
    render(
      <table>
        <tbody>
          <SolicitudRow
            solicitud={solicitudEnProcesoMock}
            reserva={reservaMock}
            cliente={clienteMock}
            onEditar={jest.fn()}
            onCambiarEstado={onCambiarEstado}
            onCancelar={jest.fn()}
          />
        </tbody>
      </table>,
    );

    const completeButton = screen.getByRole("button", {
      name: /solicitudes\.complete/i,
    });
    await user.click(completeButton);

    await waitFor(() => {
      expect(onCambiarEstado).toHaveBeenCalledWith(
        "s-en-proceso",
        "completada",
      );
    });
  });

  // Escenario 3: Solo en_proceso completable - Dado que una solicitud está "pendiente", cuando se intenta cambiar directamente a "completada" entonces se muestra error "noCompletable"
  it("no permite cambiar de pendiente a completada directamente y muestra error noCompletable", () => {
    render(
      <table>
        <tbody>
          <SolicitudRow
            solicitud={solicitudPendienteMock}
            reserva={reservaMock}
            cliente={clienteMock}
            onEditar={jest.fn()}
            onCambiarEstado={jest.fn()}
            onCancelar={jest.fn()}
          />
        </tbody>
      </table>,
    );

    const completeButton = screen.queryByRole("button", {
      name: /solicitudes\.complete/i,
    });
    expect(completeButton).not.toBeInTheDocument();
  });
});
