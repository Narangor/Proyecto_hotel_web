"use client";

import { useTranslations } from "next-intl";
import { Calendar, Users, DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Reserva, Cliente, EstadoReserva, TipoHabitacion } from "@/types";
import {
  RESERVA_ESTADOS_EDITABLES,
  RESERVA_ESTADOS_CANCELABLES,
} from "@/types";

interface ReservaRowProps {
  reserva: Reserva;
  cliente: Cliente | undefined;
  onEditar: (reserva: Reserva) => void;
  onCancelar: (reserva: Reserva) => void;
}

/** Asigna imagen según tipo de habitación */
function getImagenHabitacion(tipo: TipoHabitacion): string {
  const imagenes: Record<TipoHabitacion, string> = {
    SENCILLA: "https://blog.artonemfg.com/hubfs/Arlo.jpg",
    DOBLE:
      "https://www.mayfairhotel.com.au/wp-content/uploads/2022/06/Mayfair-Hotel-Deluxe-Twin-Room-1-scaled.jpg",
    SUITE:
      "https://cdn.marriottnetwork.com/uploads/sites/24/2021/02/canyon-suites-scottsdale-luxury-collection-king-bedroom.jpg",
    FAMILIAR:
      "https://image-tc.galaxy.tf/wijpeg-7e6uprnh1y2xrek4eiavsw65e/family-room-suites-overview-2.jpg",
  };
  return imagenes[tipo];
}

/** Formatea un precio COP sin decimales con separador de miles. */
function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

/** Formatea una fecha ISO a DD/MM/AAAA. */
function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function ReservaRow({
  reserva,
  cliente,
  onEditar,
  onCancelar,
}: ReservaRowProps) {
  const t = useTranslations("reservas");
  const tCommon = useTranslations("common");

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : `ID: ${reserva.clienteId}`;

  const puedeEditar = RESERVA_ESTADOS_EDITABLES.includes(reserva.estado);
  const puedeCancelar = RESERVA_ESTADOS_CANCELABLES.includes(reserva.estado);

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm border border-brown-100 overflow-hidden hover:shadow-lg hover:border-gold-200 transition-all duration-300"
      role="listitem"
      data-testid={`row-${reserva.id}`}
    >
      {/* Imagen de la habitación */}
      <div className="relative h-52 overflow-hidden bg-brown-100">
        <img
          src={getImagenHabitacion(reserva.tipoHabitacion)}
          alt={t(`tiposHabitacion.${reserva.tipoHabitacion}`)}
          className="h-full w-full object-cover"
        />
        {/* Badge de estado */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant={reserva.estado as EstadoReserva}
            label={t(`estados.${reserva.estado}`)}
          />
        </div>
        {/* Overlay con info de habitación */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-lg tracking-wide">
            {t(`tiposHabitacion.${reserva.tipoHabitacion}`)}
          </p>
          <p className="text-white/95 text-sm flex items-center gap-1.5 mt-1">
            <DoorOpen className="h-4 w-4" />
            {t("campos.habitacion")} {reserva.habitacionNumero}
          </p>
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="p-5 space-y-4">
        {/* ID y Cliente */}
        <div className="pb-3 border-b border-brown-100">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-semibold text-brown-900 text-lg">
              {nombreCliente}
            </h3>
            <span className="text-xs font-mono text-brown-400 bg-brown-50 px-2 py-0.5 rounded">
              #{reserva.id.slice(-5).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Detalles de la reserva */}
        <div className="space-y-3">
          {/* Fechas */}
          <div className="flex items-start gap-2.5 text-sm">
            <div className="mt-0.5">
              <Calendar className="h-4 w-4 text-gold-600" />
            </div>
            <div className="flex-1">
              <div className="text-brown-700">
                <span className="font-semibold">
                  {formatFecha(reserva.fechaEntrada)}
                </span>
                <span className="text-gold-500 mx-2 font-bold">→</span>
                <span className="font-semibold">
                  {formatFecha(reserva.fechaSalida)}
                </span>
              </div>
            </div>
          </div>

          {/* Huéspedes */}
          <div className="flex items-center gap-2.5 text-sm text-brown-700">
            <div>
              <Users className="h-4 w-4 text-brown-500" />
            </div>
            <span className="font-medium">
              {reserva.numeroHuespedes}{" "}
              {reserva.numeroHuespedes === 1 ? "huésped" : "huéspedes"}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 pb-2">
          <div className="flex items-baseline justify-between px-4 py-3 rounded-xl bg-gradient-to-br from-gold-50 to-brown-50">
            <span className="text-sm font-medium text-brown-700">
              Total de reserva
            </span>
            <span className="text-2xl font-bold text-brown-900">
              {formatCOP(reserva.total)}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => onEditar(reserva)}
            disabled={!puedeEditar}
            aria-label={`${tCommon("edit")} reserva de ${nombreCliente}`}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-brown-700 bg-white border-2 border-brown-300 hover:bg-brown-50 hover:border-brown-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-brown-300 transition-all shadow-sm hover:shadow"
          >
            {tCommon("edit")}
          </button>
          <button
            onClick={() => onCancelar(reserva)}
            disabled={!puedeCancelar}
            aria-label={`Cancelar reserva de ${nombreCliente}`}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-brown-600 hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brown-600 transition-all shadow-sm hover:shadow"
          >
            {t("cancelar.titulo")}
          </button>
        </div>
      </div>
    </div>
  );
}
