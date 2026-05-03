import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservasList } from "../components/ReservasList";
import type { ReservaConCliente } from "../hooks/useReservas";
import type { Reserva, Cliente } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("../components/ReservaRow", () => ({
  ReservaRow: ({ reserva }: { reserva: Reserva }) => (
    <div role="listitem" data-testid={`row-${reserva.id}`}>
      <span>{reserva.id}</span>
    </div>
  ),
}));

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => (
    <div role="status">{message}</div>
  ),
}));

const clienteMock: Cliente = {
  id: "c-1",
  nombre: "Ana",
  apellido: "López",
  tipoDocumento: "CC",
  numeroDocumento: "123",
  correo: "ana@test.com",
  telefono: "+57 300 0",
  nacionalidad: "Colombiana",
  fechaNacimiento: "1990-01-01",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const reservaMock: Reserva = {
  id: "r-1",
  clienteId: "c-1",
  habitacionNumero: "201",
  tipoHabitacion: "DOBLE",
  fechaEntrada: "2026-04-10",
  fechaSalida: "2026-04-13",
  numeroHuespedes: 2,
  estado: "confirmada",
  total: 450000,
  creadoEn: "2026-03-01T00:00:00.000Z",
};

const reservaConCliente: ReservaConCliente = {
  reserva: reservaMock,
  cliente: clienteMock,
};

const defaultProps = {
  reservas: [reservaConCliente],
  filtroTexto: "",
  onFiltroTextoChange: jest.fn(),
  filtroEstado: "" as const,
  onFiltroEstadoChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onCancelar: jest.fn(),
};

describe("ReservasList — renderizado", () => {
  beforeEach(() => jest.clearAllMocks());

  it("muestra una fila por cada reserva en la lista", () => {
    render(<ReservasList {...defaultProps} />);
    expect(screen.getByTestId("row-r-1")).toBeInTheDocument();
  });

  it("muestra EmptyState cuando la lista está vacía", () => {
    render(<ReservasList {...defaultProps} reservas={[]} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("llama onFiltroTextoChange al escribir en el buscador", async () => {
    const onFiltroTextoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <ReservasList
        {...defaultProps}
        onFiltroTextoChange={onFiltroTextoChange}
      />,
    );

    const input = screen.getByRole("searchbox");
    await user.type(input, "Ana");

    expect(onFiltroTextoChange).toHaveBeenCalled();
  });
});
