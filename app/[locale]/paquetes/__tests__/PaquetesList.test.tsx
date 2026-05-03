import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaquetesList } from "../components/PaquetesList";
import type { PaquetePromocional } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("../components/PaqueteRow", () => ({
  PaqueteRow: ({
    paquete,
    onEditar,
  }: {
    paquete: PaquetePromocional;
    onEditar: (p: PaquetePromocional) => void;
  }) => (
    <tr data-testid={`row-${paquete.id}`}>
      <td>{paquete.nombre}</td>
      <td>
        <button type="button" onClick={() => onEditar(paquete)}>
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

const paquete: PaquetePromocional = {
  id: "pkg-1",
  nombre: "Spa",
  descripcion: "D",
  precioLista: 100,
  precioPromocional: 80,
  fechaInicioVigencia: "2026-01-01",
  fechaFinVigencia: "2026-12-31",
  cuposTotales: 5,
  cuposVendidos: 0,
  estado: "activo",
  incluye: "Masaje",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const defaultProps = {
  paquetes: [paquete],
  filtroTexto: "",
  onFiltroTextoChange: jest.fn(),
  filtroEstado: "" as const,
  onFiltroEstadoChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onEliminar: jest.fn(),
};

describe("PaquetesList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza filas", () => {
    render(<PaquetesList {...defaultProps} />);
    expect(screen.getByTestId("row-pkg-1")).toBeInTheDocument();
  });

  it("muestra vacío sin paquetes", () => {
    render(<PaquetesList {...defaultProps} paquetes={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "paquetes.sinPaquetes",
    );
  });

  it("cambia filtro de estado", async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PaquetesList
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />,
    );
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "inactivo");
    expect(onFiltroEstadoChange).toHaveBeenCalledWith("inactivo");
  });

  it("propaga texto de búsqueda", async () => {
    const onFiltroTextoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PaquetesList
        {...defaultProps}
        onFiltroTextoChange={onFiltroTextoChange}
      />,
    );
    await user.type(screen.getByLabelText("common.search"), "spa");
    expect(onFiltroTextoChange).toHaveBeenCalled();
  });
});
