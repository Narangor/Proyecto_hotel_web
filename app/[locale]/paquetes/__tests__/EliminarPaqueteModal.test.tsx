import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EliminarPaqueteModal } from "../components/EliminarPaqueteModal";
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

const paquete: PaquetePromocional = {
  id: "pkg-del",
  nombre: "Eliminar test",
  descripcion: "D",
  precioLista: 100,
  precioPromocional: 90,
  fechaInicioVigencia: "2026-01-01",
  fechaFinVigencia: "2026-12-31",
  cuposTotales: 5,
  cuposVendidos: 0,
  estado: "inactivo",
  incluye: "X",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

describe("EliminarPaqueteModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no renderiza sin paquete", () => {
    const { container } = render(
      <EliminarPaqueteModal
        paquete={null}
        onConfirmar={jest.fn()}
        onCerrar={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("confirma eliminación", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest.fn().mockReturnValue({ ok: true });
    render(
      <EliminarPaqueteModal
        paquete={paquete}
        onConfirmar={onConfirmar}
        onCerrar={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "common.confirm" }));

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("pkg-del");
    });
  });
});
