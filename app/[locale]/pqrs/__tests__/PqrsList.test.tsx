import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PqrsList } from "../components/PqrsList";
import type { Pqrs, Cliente, Reserva } from "@/types";
import type { PqrsConRelaciones } from "../hooks/usePqrs";

// Mocks de next-intl: devuelve la clave como texto para simplificar assertions
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock de componentes hijos que tienen sus propias dependencias
jest.mock("../components/PqrsKanbanBoard", () => ({
  PqrsKanbanBoard: ({
    pqrs,
    onEditar,
    onEliminar,
  }: {
    pqrs: PqrsConRelaciones[];
    onEditar: (p: Pqrs) => void;
    onEliminar: (p: Pqrs) => void;
  }) => (
    <div>
      {pqrs.map(({ pqrs: p }) => (
        <div key={p.id} data-testid={`pqrs-card-${p.id}`}>
          <button onClick={() => onEditar(p)}>edit</button>
          <button onClick={() => onEliminar(p)}>eliminar</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => (
    <div role="status">{message}</div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const pqrsMock: Pqrs = {
  id: "pqrs-1",
  tipo: "queja",
  asunto: "Problema con el servicio",
  descripcion: "La habitación no estaba limpia",
  clienteId: "c-1",
  habitacionNumero: "101",
  reservaId: "r-1",
  prioridad: "alta",
  estado: "pendiente",
  fechaCreacion: "2025-01-15",
  asignadoA: "Juan Pérez",
  creadoEn: "2025-01-15T10:00:00.000Z",
};

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

const pqrsConRelaciones: PqrsConRelaciones = {
  pqrs: pqrsMock,
  cliente: clienteMock,
  reserva: reservaMock,
};

const defaultProps = {
  pqrs: [pqrsConRelaciones],
  filtroTexto: "",
  onFiltroTextoChange: jest.fn(),
  filtroTipo: "" as const,
  onFiltroTipoChange: jest.fn(),
  filtroEstado: "" as const,
  onFiltroEstadoChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onEliminar: jest.fn(),
  onCambiarEstado: jest.fn(),
};

// ── Tests: HU-Q1 · Listar PQRS ────────────────────────────────────────────────

describe("PqrsList - HU-Q1 · Listar PQRS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - Muestra la lista con todos los campos correctamente
  it("muestra una fila por cada PQRS cuando existen PQRS registradas", () => {
    render(<PqrsList {...defaultProps} />);
    expect(screen.getByTestId("pqrs-card-pqrs-1")).toBeInTheDocument();
  });

  // Escenario 2: Lista vacía - Muestra mensaje "No hay solicitudes registradas"
  it("muestra el EmptyState cuando no hay PQRS registradas", () => {
    render(<PqrsList {...defaultProps} pqrs={[]} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("sinPqrs")).toBeInTheDocument();
  });

  // Escenario 3: Filtro por estado - Permite filtrar PQRS por estado
  it("llama onFiltroEstadoChange cuando el usuario selecciona un estado", async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PqrsList
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );

    const select = screen.getByLabelText("status");
    await user.selectOptions(select, "pendiente");

    expect(onFiltroEstadoChange).toHaveBeenCalledWith("pendiente");
  });
});

// ── Tests: HU-Q6 · Filtrar PQRS ───────────────────────────────────────────────

describe("PqrsList - HU-Q6 · Filtrar PQRS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Filtro por tipo - Filtra por "queja" y muestra solo quejas
  it("llama onFiltroTipoChange cuando el usuario selecciona un tipo", async () => {
    const onFiltroTipoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PqrsList {...defaultProps} onFiltroTipoChange={onFiltroTipoChange} />,
    );

    const tipoSelect = screen.getByLabelText("campos.tipo");
    await user.selectOptions(tipoSelect, "queja");

    expect(onFiltroTipoChange).toHaveBeenCalledWith("queja");
  });

  // Escenario 2: Filtros combinados - Aplica tipo "reclamo" y estado "pendiente"
  it("permite aplicar filtros combinados de tipo y estado", async () => {
    const onFiltroTipoChange = jest.fn();
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PqrsList
        {...defaultProps}
        onFiltroTipoChange={onFiltroTipoChange}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );

    const tipoSelect = screen.getByLabelText("campos.tipo");
    const estadoSelect = screen.getByLabelText("status");

    await user.selectOptions(tipoSelect, "reclamo");
    await user.selectOptions(estadoSelect, "pendiente");

    expect(onFiltroTipoChange).toHaveBeenCalledWith("reclamo");
    expect(onFiltroEstadoChange).toHaveBeenCalledWith("pendiente");
  });

  // Escenario 3: Sin resultados - Muestra mensaje cuando no hay coincidencias
  it("muestra mensaje de sin resultados cuando no hay PQRS que coincidan", () => {
    render(<PqrsList {...defaultProps} pqrs={[]} filtroTexto="xyz123abc" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("sinPqrs")).toBeInTheDocument();
  });
});
