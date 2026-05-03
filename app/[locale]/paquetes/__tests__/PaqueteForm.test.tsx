import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaqueteForm } from "../components/PaqueteForm";
import type { PaquetePromocional } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock("@/components/ui/Modal", () => ({
  Modal: ({
    isOpen,
    children,
    title,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    title: string;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/components/ui/FormField", () => ({
  FormField: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    required?: boolean;
    children: (id: string, aria: React.AriaAttributes) => React.ReactNode;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      {children(label, { "aria-required": true })}
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

const paqueteBase: PaquetePromocional = {
  id: "pkg-e",
  nombre: "Romance",
  descripcion: "Desc larga",
  precioLista: 400000,
  precioPromocional: 350000,
  fechaInicioVigencia: "2026-04-01",
  fechaFinVigencia: "2026-04-30",
  cuposTotales: 15,
  cuposVendidos: 3,
  estado: "activo",
  incluye: "Cena y spa",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  paqueteInicial: null as PaquetePromocional | null,
};

describe("PaqueteForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crea un paquete con campos válidos", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockReturnValue({ ok: true });
    render(<PaqueteForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("paquetes.campos.nombre"), "Noche mágica");
    await user.type(
      screen.getByLabelText("paquetes.campos.descripcion"),
      "Descripción completa del paquete",
    );
    await user.clear(screen.getByLabelText("paquetes.campos.precioLista"));
    await user.type(screen.getByLabelText("paquetes.campos.precioLista"), "500000");
    await user.clear(screen.getByLabelText("paquetes.campos.precioPromocional"));
    await user.type(
      screen.getByLabelText("paquetes.campos.precioPromocional"),
      "450000",
    );
    await user.type(
      screen.getByLabelText("paquetes.campos.incluye"),
      "Todo incluido",
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Noche mágica",
          precioLista: 500000,
          precioPromocional: 450000,
          incluye: "Todo incluido",
        }),
      );
    });
  });

  it("muestra error de validación si el nombre está vacío", async () => {
    const user = userEvent.setup();
    render(<PaqueteForm {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "common.save" }));
    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
  });

  it("edita un paquete existente", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: true });
    render(
      <PaqueteForm
        {...defaultProps}
        paqueteInicial={paqueteBase}
        onEdit={onEdit}
      />,
    );

    await user.clear(screen.getByLabelText("paquetes.campos.nombre"));
    await user.type(screen.getByLabelText("paquetes.campos.nombre"), "Romance plus");
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(
        "pkg-e",
        expect.objectContaining({ nombre: "Romance plus" }),
      );
    });
  });

  it("muestra error de cupos inválidos al editar", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue({ ok: false, error: "cuposInvalidos" });
    render(
      <PaqueteForm
        {...defaultProps}
        paqueteInicial={paqueteBase}
        onEdit={onEdit}
      />,
    );

    await user.clear(screen.getByLabelText("paquetes.campos.cuposTotales"));
    await user.type(screen.getByLabelText("paquetes.campos.cuposTotales"), "1");
    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(
        screen.getByText("paquetes.errores.cuposMenosVendidos"),
      ).toBeInTheDocument();
    });
  });
});
