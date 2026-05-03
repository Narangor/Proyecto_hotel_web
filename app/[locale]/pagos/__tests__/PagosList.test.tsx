import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PagosList } from "../components/PagosList";
import type { Pago, Reserva, Cliente } from "@/types";
import type { PagoConRelaciones } from "../hooks/usePagos";

// Mocks de next-intl: devuelve la clave como texto para simplificar assertions
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock de componentes hijos que tienen sus propias dependencias
jest.mock("../components/PagoRow", () => ({
  PagoRow: ({
    pago,
    onEditar,
    onAnular,
  }: {
    pago: Pago;
    onEditar: (p: Pago) => void;
    onAnular: (p: Pago) => void;
  }) => (
    <div data-testid={`row-${pago.id}`}>
      <span>{pago.id}</span>
      <button onClick={() => onEditar(pago)}>edit</button>
      <button onClick={() => onAnular(pago)}>anular</button>
    </div>
  ),
}));

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => (
    <div role="status">{message}</div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const pagoMock: Pago = {
  id: "p-1",
  reservaId: "r-1",
  monto: 150000,
  fecha: "2025-01-15",
  metodoPago: "TARJETA_CREDITO",
  estado: "completado",
  referencia: "REF-001",
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

const pagoConRelaciones: PagoConRelaciones = {
  pago: pagoMock,
  reserva: reservaMock,
  cliente: clienteMock,
};

const defaultProps = {
  pagos: [pagoConRelaciones],
  filtroTexto: "",
  onFiltroTextoChange: jest.fn(),
  filtroEstado: "" as const,
  onFiltroEstadoChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onAnular: jest.fn(),
};

// ── Tests: HU-P1 · Listar pagos ───────────────────────────────────────────────

describe("PagosList - HU-P1 · Listar pagos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Caso exitoso - muestra la lista con todos los campos correctamente
  it("muestra una fila por cada pago cuando existen pagos registrados", () => {
    render(<PagosList {...defaultProps} />);
    expect(screen.getByTestId("row-p-1")).toBeInTheDocument();
  });

  // Escenario 2: Lista vacía - muestra mensaje "No hay pagos registrados"
  it("muestra el EmptyState cuando no hay pagos registrados", () => {
    render(<PagosList {...defaultProps} pagos={[]} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("sinPagos")).toBeInTheDocument();
  });

  // Escenario 3: Filtro por estado - permite filtrar pagos por estado
  it("llama onFiltroEstadoChange cuando el usuario selecciona un estado", async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PagosList
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );

    const select = screen.getByLabelText("status");
    await user.selectOptions(select, "pendiente");

    expect(onFiltroEstadoChange).toHaveBeenCalledWith("pendiente");
  });
});

// ── Tests: HU-P5 · Filtrar pagos ──────────────────────────────────────────────

describe("PagosList - HU-P5 · Filtrar pagos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Escenario 1: Filtro por texto - Busca "Juan" y muestra solo pagos de Juan
  it("llama onFiltroTextoChange cuando el usuario busca por texto", async () => {
    const onFiltroTextoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PagosList {...defaultProps} onFiltroTextoChange={onFiltroTextoChange} />,
    );

    const searchInput = screen.getByLabelText("search");
    await user.type(searchInput, "Juan");

    expect(onFiltroTextoChange).toHaveBeenCalled();
    expect(onFiltroTextoChange).toHaveBeenCalledTimes(4);
  });

  // Escenario 2: Filtros combinados - Aplica texto "Suite" y estado "pendiente"
  it("permite aplicar filtros combinados de texto y estado", async () => {
    const onFiltroTextoChange = jest.fn();
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PagosList
        {...defaultProps}
        onFiltroTextoChange={onFiltroTextoChange}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );

    const searchInput = screen.getByLabelText("search");
    const statusSelect = screen.getByLabelText("status");

    await user.type(searchInput, "Suite");
    await user.selectOptions(statusSelect, "pendiente");

    expect(onFiltroTextoChange).toHaveBeenCalled();
    expect(onFiltroEstadoChange).toHaveBeenCalledWith("pendiente");
  });

  // Escenario 3: Sin resultados - Muestra mensaje cuando no hay coincidencias
  it("muestra mensaje de sin resultados cuando no hay pagos que coincidan", () => {
    render(<PagosList {...defaultProps} pagos={[]} filtroTexto="asdfghjklñ" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("sinPagos")).toBeInTheDocument();
  });
});
