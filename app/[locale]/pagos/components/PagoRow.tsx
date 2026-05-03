"use client";

import { useTranslations } from "next-intl";
import {
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Building2,
  Calendar,
  User,
  Receipt,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { Pago, Reserva, Cliente, EstadoPago, MetodoPago } from "@/types";
import { PAGO_ESTADOS_EDITABLES, PAGO_ESTADOS_ANULABLES } from "@/types";

interface PagoRowProps {
  pago: Pago;
  reserva: Reserva | undefined;
  cliente: Cliente | undefined;
  onEditar: (pago: Pago) => void;
  onAnular: (pago: Pago) => void;
}

// Formatea un precio COP sin decimales con separador de miles
function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

// Formatea fecha ISO a DD/MM/AAAA
function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

// Mapeo de iconos para metodos de pago
function getPaymentMethodIcon(metodo: MetodoPago) {
  switch (metodo) {
    case "EFECTIVO":
      return <Banknote className="h-5 w-5" />;
    case "TARJETA_CREDITO":
    case "TARJETA_DEBITO":
      return <CreditCard className="h-5 w-5" />;
    case "TRANSFERENCIA":
      return <ArrowLeftRight className="h-5 w-5" />;
    case "PSE":
      return <Building2 className="h-5 w-5" />;
    default:
      return <Receipt className="h-5 w-5" />;
  }
}

// Mapeo de colores para metodos de pago
function getPaymentMethodColor(metodo: MetodoPago): string {
  switch (metodo) {
    case "EFECTIVO":
      return "bg-green-50 text-green-700 border-green-200";
    case "TARJETA_CREDITO":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "TARJETA_DEBITO":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "TRANSFERENCIA":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "PSE":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function PagoRow({
  pago,
  reserva,
  cliente,
  onEditar,
  onAnular,
}: PagoRowProps) {
  const t = useTranslations("pagos");
  const tCommon = useTranslations("common");

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : (reserva?.clienteId ?? "—");

  const puedeEditar = PAGO_ESTADOS_EDITABLES.includes(pago.estado);
  const puedeAnular = PAGO_ESTADOS_ANULABLES.includes(pago.estado);

  const hayAccionesDisponibles = puedeEditar || puedeAnular;

  return (
    <div className="bg-white rounded-2xl border border-brown-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              <div
                className={`shrink-0 p-3 rounded-xl border ${getPaymentMethodColor(pago.metodoPago)}`}
              >
                {getPaymentMethodIcon(pago.metodoPago)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-brown-900">
                    {formatCOP(pago.monto)}
                  </h3>
                  <Badge
                    variant={pago.estado as EstadoPago}
                    label={t(`estados.${pago.estado}`)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-brown-700">
                    <User className="h-4 w-4 text-brown-400 shrink-0" />
                    <span className="font-medium truncate">
                      {nombreCliente}
                    </span>
                  </div>

                  {reserva && (
                    <div className="flex items-center gap-2 text-brown-600">
                      <Receipt className="h-4 w-4 text-brown-400 shrink-0" />
                      <span>
                        {t("campos.reserva")} #
                        {reserva.id.slice(-5).toUpperCase()} •{" "}
                        {tCommon("roomAbbrev")} {reserva.habitacionNumero}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-brown-600">
                    <Calendar className="h-4 w-4 text-brown-400 shrink-0" />
                    <span>{formatFecha(pago.fecha)}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-brown-500">
                    {t(`metodosPago.${pago.metodoPago}`)}
                  </span>
                  {pago.referencia && (
                    <>
                      <span className="text-brown-300">•</span>
                      <span className="text-brown-400 font-mono text-xs">
                        {pago.referencia}
                      </span>
                    </>
                  )}
                  <span className="text-brown-300 hidden sm:inline">•</span>
                  <span className="text-brown-400 text-xs font-mono hidden sm:inline">
                    #{pago.id.slice(-5).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <DropdownMenu ariaLabel={`Acciones para pago de ${nombreCliente}`}>
              {!hayAccionesDisponibles ? (
                <div className="px-4 py-2 text-sm text-brown-400 italic">
                  {tCommon("noActionsAvailable")}
                </div>
              ) : (
                <>
                  {puedeEditar && (
                    <DropdownMenuItem onClick={() => onEditar(pago)}>
                      <span className="text-brown-700">{tCommon("edit")}</span>
                    </DropdownMenuItem>
                  )}

                  {puedeAnular && (
                    <DropdownMenuItem onClick={() => onAnular(pago)}>
                      <span className="text-brown-600">
                        {t("anular.titulo")}
                      </span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
