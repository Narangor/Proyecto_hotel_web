"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { Cliente } from "@/types";

interface ClienteRowProps {
  cliente: Cliente;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (cliente: Cliente) => void;
}

export function ClienteRow({ cliente, onEditar, onEliminar }: ClienteRowProps) {
  const t = useTranslations("clientes");
  const tCommon = useTranslations("common");

  const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;

  return (
    <div className="bg-white hover:bg-brown-50/50 border border-brown-100 rounded-xl transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-semibold text-brown-900 truncate">
              {nombreCompleto}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="h-3 w-3 text-brown-400 shrink-0" />
              <span className="text-xs text-brown-500">
                {cliente.nacionalidad}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={cliente.estado}
              label={
                cliente.estado === "activo"
                  ? tCommon("active")
                  : tCommon("inactive")
              }
            />
            <DropdownMenu ariaLabel={`Acciones para ${nombreCompleto}`}>
              <DropdownMenuItem onClick={() => onEditar(cliente)}>
                <span className="text-brown-700">{tCommon("edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEliminar(cliente)}>
                <span className="text-red-700">{tCommon("delete")}</span>
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-brown-700">
            <CreditCard className="h-4 w-4 text-brown-400 shrink-0" />
            <span className="text-xs text-brown-500">
              {cliente.tipoDocumento}
            </span>
            <span className="font-medium">{cliente.numeroDocumento}</span>
          </div>

          <div className="flex items-center gap-2 text-brown-700">
            <Calendar className="h-4 w-4 text-brown-400 shrink-0" />
            <span className="text-sm">
              {new Date(cliente.fechaNacimiento).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-brown-700">
            <Mail className="h-4 w-4 text-brown-400 shrink-0" />
            <span className="text-sm truncate">{cliente.correo}</span>
          </div>

          <div className="flex items-center gap-2 text-brown-700">
            <Phone className="h-4 w-4 text-brown-400 shrink-0" />
            <span className="text-sm">{cliente.telefono}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
