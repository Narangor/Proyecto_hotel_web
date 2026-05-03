import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendamientosList } from "../components/AgendamientosList";
import type { AgendamientoTour } from "@/types";
import type { AgendamientoConRelaciones } from "../hooks/useAgendamientosTour";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("../components/AgendamientoRow", () => ({
  AgendamientoRow: ({
    fila,
    onEditar,
  }: {
    fila: AgendamientoConRelaciones;
    onEditar: (a: AgendamientoTour) => void;
  }) => (
    <tr data-testid={`row-${fila.agendamiento.id}`}>
      <td>{fila.agendamiento.puntoEncuentro}</td>
      <td>
        <button type="button" onClick={() => onEditar(fila.agendamiento)}>
          edit
        </button>
      </td>
    </tr>
  ),
}));

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({ message }: { message: string }) => (
    <div role="status">{message}</div>
  ),
}));

const ag: AgendamientoTour = {
  id: "ag-1",
  tourCatalogoId: "t1",
  clienteId: "c-1",
  fecha: "2026-06-01",
  horaSalida: "09:00",
  numeroParticipantes: 2,
  estado: "pendiente",
  puntoEncuentro: "Lobby",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const fila: AgendamientoConRelaciones = {
  agendamiento: ag,
  cliente: undefined,
  reserva: undefined,
  tour: undefined,
};

const defaultProps = {
  filas: [fila],
  filtroTexto: "",
  onFiltroTextoChange: jest.fn(),
  filtroEstado: "" as const,
  onFiltroEstadoChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onCancelar: jest.fn(),
  onCambiarEstado: jest.fn().mockReturnValue({ ok: true }),
};

describe("AgendamientosList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza filas", () => {
    render(<AgendamientosList {...defaultProps} />);
    expect(screen.getByTestId("row-ag-1")).toBeInTheDocument();
  });

  it("lista vacía", () => {
    render(<AgendamientosList {...defaultProps} filas={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "tours.sinAgendamientos",
    );
  });

  it("cambia filtro de estado", async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <AgendamientosList
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "confirmado");
    expect(onFiltroEstadoChange).toHaveBeenCalledWith("confirmado");
  });

  it("buscador notifica cambios", async () => {
    const onFiltroTextoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <AgendamientosList
        {...defaultProps}
        onFiltroTextoChange={onFiltroTextoChange}
      />,
    );
    await user.type(screen.getByLabelText("common.search"), "lobby");
    expect(onFiltroTextoChange).toHaveBeenCalled();
  });
});
