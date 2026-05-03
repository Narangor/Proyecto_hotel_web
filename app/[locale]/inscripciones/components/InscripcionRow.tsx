"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { Inscripcion, Cliente, EstadoInscripcion } from "@/types";
import {
  INSCRIPCION_ESTADOS_EDITABLES,
  INSCRIPCION_ESTADOS_ELIMINABLES,
} from "@/types";

interface InscripcionRowProps {
  inscripcion: Inscripcion;
  cliente: Cliente | undefined;
  onEditar: (i: Inscripcion) => void;
  onEliminar: (i: Inscripcion) => void;
  onCancelar: (i: Inscripcion) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoInscripcion,
  ) => { ok: boolean; error?: string };
}

const ESTADO_VARIANT: Record<string, BadgeVariant> = {
  pendiente: "pendiente",
  confirmada: "en_proceso",
  cancelada: "rechazado",
  completada: "completado",
};

function formatFecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function InscripcionRow({
  inscripcion,
  cliente,
  onEditar,
  onEliminar,
  onCancelar,
  onCambiarEstado,
}: InscripcionRowProps) {
  const t = useTranslations("inscripciones");
  const tCommon = useTranslations("common");

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : "—";

  const puedeEditar = INSCRIPCION_ESTADOS_EDITABLES.includes(
    inscripcion.estado,
  );
  const puedeEliminar = INSCRIPCION_ESTADOS_ELIMINABLES.includes(
    inscripcion.estado,
  );
  const puedeCancelar = INSCRIPCION_ESTADOS_EDITABLES.includes(
    inscripcion.estado,
  );
  const puedeMarcarCompletada = inscripcion.estado === "confirmada";

  const hayAccionesDisponibles =
    puedeEditar ||
    puedeEliminar ||
    puedeCancelar ||
    puedeMarcarCompletada;

  return (
    <tr className="border-b border-brown-100 hover:bg-brown-50 transition-colors">
      <td className="px-4 py-3 text-xs font-mono text-brown-400">
        #{inscripcion.id.slice(-5).toUpperCase()}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-brown-100 px-2 py-0.5 text-xs font-medium text-brown-700">
          {t(`categorias.${inscripcion.categoria}`)}
        </span>
      </td>
      <td className="px-4 py-3 max-w-xs">
        <div className="font-medium text-brown-900 truncate">
          {inscripcion.nombreActividad}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-brown-900">{nombreCliente}</td>
      <td className="px-4 py-3 text-sm text-brown-700">
        {formatFecha(inscripcion.fechaEvento)} {inscripcion.horaInicio}
      </td>
      <td className="px-4 py-3 text-sm text-brown-700">
        {inscripcion.numeroPersonas}
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={ESTADO_VARIANT[inscripcion.estado] ?? "pendiente"}
          label={t(`estados.${inscripcion.estado}`)}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <DropdownMenu
            ariaLabel={`${tCommon("actions")}: ${inscripcion.nombreActividad}`}
          >
            {!hayAccionesDisponibles ? (
              <div className="px-4 py-2 text-sm text-brown-400 italic">
                {tCommon("noActionsAvailable")}
              </div>
            ) : (
              <>
                {puedeEditar && (
                  <DropdownMenuItem onClick={() => onEditar(inscripcion)}>
                    <span className="text-brown-700">{tCommon("edit")}</span>
                  </DropdownMenuItem>
                )}
                {puedeMarcarCompletada && (
                  <DropdownMenuItem
                    onClick={() =>
                      onCambiarEstado(inscripcion.id, "completada")
                    }
                  >
                    <span className="text-green-700">
                      {t("acciones.marcarCompletada")}
                    </span>
                  </DropdownMenuItem>
                )}
                {puedeCancelar && (
                  <DropdownMenuItem onClick={() => onCancelar(inscripcion)}>
                    <span className="text-brown-600">{t("acciones.cancelar")}</span>
                  </DropdownMenuItem>
                )}
                {puedeEliminar && (
                  <DropdownMenuItem onClick={() => onEliminar(inscripcion)}>
                    <span className="text-red-700">{tCommon("delete")}</span>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
