import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InscripcionesList } from "../components/InscripcionesList";
import type { Inscripcion } from "@/types";
import type { InscripcionConRelaciones } from "../hooks/useInscripciones";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("../components/InscripcionRow", () => ({
  InscripcionRow: ({
    inscripcion,
    onEditar,
  }: {
    inscripcion: Inscripcion;
    onEditar: (i: Inscripcion) => void;
  }) => (
    <tr data-testid={`row-${inscripcion.id}`}>
      <td>{inscripcion.nombreActividad}</td>
      <td>
        <button type="button" onClick={() => onEditar(inscripcion)}>
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

const inscripcion: Inscripcion = {
  id: "ins-1",
  categoria: "evento",
  nombreActividad: "Gala",
  descripcion: "Desc",
  clienteId: "c-1",
  fechaEvento: "2026-05-01",
  horaInicio: "19:00",
  numeroPersonas: 2,
  estado: "pendiente",
  creadoEn: "2026-03-01T12:00:00.000Z",
};

const fila: InscripcionConRelaciones = {
  inscripcion,
  cliente: undefined,
  reserva: undefined,
};

const defaultProps = {
  filas: [fila],
  filtroTexto: "",
  onFiltroTextoChange: jest.fn(),
  filtroCategoria: "" as const,
  onFiltroCategoriaChange: jest.fn(),
  filtroEstado: "" as const,
  onFiltroEstadoChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onEliminar: jest.fn(),
  onCancelar: jest.fn(),
  onCambiarEstado: jest.fn().mockReturnValue({ ok: true }),
};

describe("InscripcionesList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza una fila por inscripción", () => {
    render(<InscripcionesList {...defaultProps} />);
    expect(screen.getByTestId("row-ins-1")).toBeInTheDocument();
  });

  it("muestra EmptyState cuando no hay filas", () => {
    render(<InscripcionesList {...defaultProps} filas={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "inscripciones.sinInscripciones",
    );
  });

  it("notifica cambio de filtro de estado", async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <InscripcionesList
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[1], "confirmada");
    expect(onFiltroEstadoChange).toHaveBeenCalledWith("confirmada");
  });

  it("notifica cambio de categoría", async () => {
    const onFiltroCategoriaChange = jest.fn();
    const user = userEvent.setup();
    render(
      <InscripcionesList
        {...defaultProps}
        onFiltroCategoriaChange={onFiltroCategoriaChange}
      />,
    );
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "restaurante");
    expect(onFiltroCategoriaChange).toHaveBeenCalledWith("restaurante");
  });

  it("actualiza el buscador al escribir", async () => {
    const onFiltroTextoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <InscripcionesList
        {...defaultProps}
        onFiltroTextoChange={onFiltroTextoChange}
      />,
    );
    await user.type(screen.getByLabelText("common.search"), "gala");
    expect(onFiltroTextoChange).toHaveBeenCalled();
  });
});
