import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EliminarPqrsModal } from "../components/EliminarPqrsModal";
import type { Pqrs, Cliente } from "@/types";

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
  nombre: "María",
  apellido: "González",
  tipoDocumento: "CC",
  numeroDocumento: "123456",
  correo: "maria@test.com",
  telefono: "+57 310 000 0000",
  nacionalidad: "Colombiana",
  fechaNacimiento: "1990-03-15",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const pqrsPendienteMock: Pqrs = {
  id: "pqrs-1",
  tipo: "queja",
  asunto: "PQRS registrada por error",
  descripcion: "Esta PQRS fue registrada por error",
  clienteId: "c-1",
  habitacionNumero: "101",
  reservaId: "r-1",
  prioridad: "baja",
  estado: "pendiente",
  fechaCreacion: "2025-01-15",
  asignadoA: "Juan Pérez",
  creadoEn: "2025-01-15T10:00:00.000Z",
};

const pqrsEnProcesoMock: Pqrs = {
  id: "pqrs-2",
  tipo: "reclamo",
  asunto: "PQRS en gestión",
  descripcion: "Esta PQRS está siendo gestionada",
  clienteId: "c-1",
  habitacionNumero: "102",
  prioridad: "alta",
  estado: "en_proceso",
  fechaCreacion: "2025-01-14",
  asignadoA: "Pedro López",
  creadoEn: "2025-01-14T09:00:00.000Z",
};

const defaultProps = {
  pqrs: null,
  cliente: clienteMock,
  onConfirmar: jest.fn().mockReturnValue({ ok: true }),
  onCerrar: jest.fn(),
};

// ── Tests: HU-Q5 · Eliminar PQRS ──────────────────────────────────────────────

describe("EliminarPqrsModal - HU-Q5 · Eliminar PQRS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - Dado que existe una PQRS "pendiente" registrada por error, cuando el administrador confirma la eliminación la PQRS se elimina permanentemente
  it("permite eliminar una PQRS pendiente cuando el administrador confirma", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest.fn().mockReturnValue({ ok: true });
    render(
      <EliminarPqrsModal
        {...defaultProps}
        pqrs={pqrsPendienteMock}
        onConfirmar={onConfirmar}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("pqrs.eliminar.titulo")).toBeInTheDocument();

    const confirmarBtn = screen.getByRole("button", {
      name: /common\.confirm/i,
    });
    await user.click(confirmarBtn);

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("pqrs-1");
    });
  });

  // Escenario 2: Estado no eliminable - Dado que existe una PQRS "en_proceso", cuando el administrador intenta eliminarla se muestra error "noEliminable"
  it("muestra error cuando se intenta eliminar una PQRS en estado no eliminable", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest
      .fn()
      .mockReturnValue({ ok: false, error: "noEliminable" });
    render(
      <EliminarPqrsModal
        {...defaultProps}
        pqrs={pqrsEnProcesoMock}
        onConfirmar={onConfirmar}
      />,
    );

    const confirmarBtn = screen.getByRole("button", {
      name: /common\.confirm/i,
    });
    await user.click(confirmarBtn);

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("pqrs-2");
      expect(onConfirmar).toHaveReturnedWith({
        ok: false,
        error: "noEliminable",
      });
    });
  });

  // Escenario 3: Confirmación requerida - Dado que el administrador intenta eliminar una PQRS, cuando presiona eliminar se muestra modal de confirmación
  it("muestra modal de confirmación con detalles de la PQRS antes de eliminar", () => {
    render(<EliminarPqrsModal {...defaultProps} pqrs={pqrsPendienteMock} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("pqrs.eliminar.titulo")).toBeInTheDocument();

    expect(screen.getByText(/María González/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /common\.cancel/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /common\.confirm/i }),
    ).toBeInTheDocument();
  });
});
