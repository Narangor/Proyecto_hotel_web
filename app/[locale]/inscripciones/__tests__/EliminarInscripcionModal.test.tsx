import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EliminarInscripcionModal } from "../components/EliminarInscripcionModal";
import type { Cliente, Inscripcion } from "@/types";

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

const cliente: Cliente = {
  id: "c-1",
  nombre: "Pedro",
  apellido: "Soto",
  tipoDocumento: "CC",
  numeroDocumento: "444",
  correo: "p@test.com",
  telefono: "+57",
  nacionalidad: "CO",
  fechaNacimiento: "1991-01-01",
  estado: "activo",
  creadoEn: "2025-01-01T00:00:00.000Z",
};

const inscripcion: Inscripcion = {
  id: "ins-del",
  categoria: "restaurante",
  nombreActividad: "Brunch",
  descripcion: "Desc",
  clienteId: "c-1",
  fechaEvento: "2026-05-01",
  horaInicio: "11:00",
  numeroPersonas: 2,
  estado: "pendiente",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

describe("EliminarInscripcionModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no renderiza si no hay inscripción", () => {
    const { container } = render(
      <EliminarInscripcionModal
        inscripcion={null}
        cliente={cliente}
        onConfirmar={jest.fn()}
        onCerrar={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("llama onConfirmar con el id al confirmar", async () => {
    const user = userEvent.setup();
    const onConfirmar = jest.fn().mockReturnValue({ ok: true });
    render(
      <EliminarInscripcionModal
        inscripcion={inscripcion}
        cliente={cliente}
        onConfirmar={onConfirmar}
        onCerrar={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "common.confirm" }));

    await waitFor(() => {
      expect(onConfirmar).toHaveBeenCalledWith("ins-del");
    });
  });
});
