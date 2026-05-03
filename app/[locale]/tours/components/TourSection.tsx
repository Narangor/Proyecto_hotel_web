"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Clock, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import type { TourCatalogo, AgendamientoTour, Cliente } from "@/types";
import { BookingItem } from "./BookingItem";
import { TOUR_IMAGES, DEFAULT_TOUR_IMAGE } from "./tourImages";
import type { EstadoAgendamientoTour } from "@/types";

interface TourSectionProps {
  tour: TourCatalogo;
  bookings: Array<{
    agendamiento: AgendamientoTour;
    cliente: Cliente | undefined;
  }>;
  onEditar: (a: AgendamientoTour) => void;
  onCancelar: (a: AgendamientoTour) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoAgendamientoTour,
  ) => { ok: boolean; error?: string };
}

export function TourSection({
  tour,
  bookings,
  onEditar,
  onCancelar,
  onCambiarEstado,
}: TourSectionProps) {
  const t = useTranslations("tours");
  const [isExpanded, setIsExpanded] = useState(bookings.length > 0);
  const imageUrl = TOUR_IMAGES[tour.id] || DEFAULT_TOUR_IMAGE;

  const pendingCount = bookings.filter(
    (b) => b.agendamiento.estado === "pendiente",
  ).length;
  const confirmedCount = bookings.filter(
    (b) => b.agendamiento.estado === "confirmado",
  ).length;

  return (
    <div className="rounded-xl border border-brown-200 bg-white shadow-sm">
      <div className="relative">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={tour.nombre}
            width={800}
            height={300}
            className="h-full w-full object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-r from-brown-900/90 via-brown-900/60 to-transparent" />

          <div className="absolute inset-0 flex items-center px-6">
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-bold text-white mb-2">
                {tour.nombre}
              </h2>
              <p className="text-sm text-cream/90 line-clamp-2 max-w-2xl">
                {tour.descripcion}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-cream/90 text-sm">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{tour.duracionHoras}h</span>
                </div>
                {bookings.length > 0 && (
                  <div className="flex items-center gap-1.5 text-cream/90 text-sm">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {bookings.length}{" "}
                      {bookings.length === 1
                        ? t("contadorUno")
                        : t("contadorVarios")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {bookings.length > 0 && (
              <div className="flex gap-3">
                {pendingCount > 0 && (
                  <div className="bg-brown-100/90 backdrop-blur-sm px-3 py-2 rounded-lg text-center">
                    <div className="text-2xl font-bold text-brown-900">
                      {pendingCount}
                    </div>
                    <div className="text-xs text-brown-600 uppercase tracking-wide">
                      {t("estados.pendiente")}
                    </div>
                  </div>
                )}
                {confirmedCount > 0 && (
                  <div className="bg-gold-100/90 backdrop-blur-sm px-3 py-2 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gold-900">
                      {confirmedCount}
                    </div>
                    <div className="text-xs text-gold-700 uppercase tracking-wide">
                      {t("estados.confirmado")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {bookings.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-0 right-0 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-tl-lg border-l border-t border-brown-200 hover:bg-gold-50 transition-colors flex items-center gap-2 text-sm font-medium text-brown-700"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>{t("ocultarAgendamientos")}</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>
                  {t("mostrarAgendamientos")} {bookings.length}{" "}
                  {bookings.length === 1
                    ? t("contadorUno")
                    : t("contadorVarios")}
                </span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {isExpanded && bookings.length > 0 && (
        <div className="p-4 bg-brown-50/30 space-y-2">
          {bookings.map(({ agendamiento, cliente }) => (
            <BookingItem
              key={agendamiento.id}
              agendamiento={agendamiento}
              cliente={cliente}
              onEditar={onEditar}
              onCancelar={onCancelar}
              onCambiarEstado={onCambiarEstado}
            />
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <div className="px-6 py-4 text-center text-sm text-brown-500 bg-brown-50/30 border-t border-brown-100">
          {t("sinAgendamientosTour")}
        </div>
      )}
    </div>
  );
}
