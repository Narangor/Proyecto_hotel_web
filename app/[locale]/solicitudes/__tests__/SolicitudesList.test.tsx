import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolicitudesList } from "../components/SolicitudesList";
import type { Solicitud, Reserva, Cliente } from "@/types";
import type { SolicitudConRelaciones } from "../hooks/useSolicitudes";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => (
    <div role="status">{message}</div>
  ),
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

const solicitudMock: Solicitud = {
  id: "s-1",
  reservaId: "r-1",
  tipo: "limpieza",
  descripcion: "Solicitud de limpieza urgente",
  habitacionNumero: "101",
  prioridad: "alta",
  estado: "pendiente",
  empleadoAsignado: "Juan Pérez",
  fechaSolicitud: "2025-01-15T10:00:00.000Z",
  creadoEn: "2025-01-15T10:00:00.000Z",
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
  numeroDocumento: "987654",
  correo: "carlos@test.com",
  telefono: "+57 310 000 0000",
  nacionalidad: "Colombiana",
  fechaNacimiento: "1985-05-15",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const solicitudConRelaciones: SolicitudConRelaciones = {
  solicitud: solicitudMock,
  reserva: reservaMock,
  cliente: clienteMock,
};

const defaultProps = {
  solicitudes: [solicitudConRelaciones],
  filtroTexto: "",
  onFiltroTextoChange: jest.fn(),
  filtroEstado: "" as const,
  onFiltroEstadoChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onCambiarEstado: jest.fn(),
  onCancelar: jest.fn(),
};

// ── Tests: HU-S1 · Listar solicitudes de servicio ────────────────────────────

describe("SolicitudesList - HU-S1 · Listar solicitudes de servicio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - Muestra la lista con todos los campos correctamente
  it("muestra una fila por cada solicitud cuando existen solicitudes registradas", () => {
    render(<SolicitudesList {...defaultProps} />);
    expect(
      screen.getByText("Solicitud de limpieza urgente"),
    ).toBeInTheDocument();
    expect(screen.getByText("101")).toBeInTheDocument();
  });

  // Escenario 2: Lista vacía - Muestra mensaje "no hay solicitudes registradas"
  it("muestra el EmptyState cuando no hay solicitudes registradas", () => {
    render(<SolicitudesList {...defaultProps} solicitudes={[]} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("sinSolicitudes")).toBeInTheDocument();
  });

  // Escenario 3: Filtro por estado - Permite filtrar solicitudes por estado
  it("llama onFiltroEstadoChange cuando el usuario selecciona un estado", async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <SolicitudesList
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );

    const select = screen.getByLabelText("status");
    await user.selectOptions(select, "pendiente");

    expect(onFiltroEstadoChange).toHaveBeenCalledWith("pendiente");
  });
});

// ── Tests: HU-S6 · Filtrar solicitudes de servicio ───────────────────────────

describe("SolicitudesList - HU-S6 · Filtrar solicitudes de servicio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Filtro por estado - Filtra por "pendiente" y muestra solo solicitudes pendientes
  it("llama onFiltroEstadoChange cuando el supervisor filtra por estado pendiente", async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <SolicitudesList
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );

    const select = screen.getByLabelText("status");
    await user.selectOptions(select, "pendiente");

    expect(onFiltroEstadoChange).toHaveBeenCalledWith("pendiente");
  });

  // Escenario 2: Filtros combinados - Aplica texto "limpieza" y estado "en_proceso"
  it("permite aplicar filtros combinados de texto y estado", async () => {
    const onFiltroTextoChange = jest.fn();
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <SolicitudesList
        {...defaultProps}
        onFiltroTextoChange={onFiltroTextoChange}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );

    const searchInput = screen.getByLabelText("search");
    const statusSelect = screen.getByLabelText("status");

    await user.type(searchInput, "limpieza");
    await user.selectOptions(statusSelect, "en_proceso");

    expect(onFiltroTextoChange).toHaveBeenCalled();
    expect(onFiltroEstadoChange).toHaveBeenCalledWith("en_proceso");
  });

  // Escenario 3: Sin resultados - Muestra mensaje cuando no hay coincidencias
  it("muestra mensaje de sin resultados cuando no hay solicitudes que coincidan", () => {
    render(
      <SolicitudesList
        {...defaultProps}
        solicitudes={[]}
        filtroTexto="asdfghjklñ"
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("sinSolicitudes")).toBeInTheDocument();
  });
});
