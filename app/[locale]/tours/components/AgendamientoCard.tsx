"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  CheckCircle2,
} from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type {
  AgendamientoTour,
  EstadoAgendamientoTour,
  TourCatalogo,
  Cliente,
  Reserva,
} from "@/types";
import {
  AGENDAMIENTO_ESTADOS_EDITABLES,
  AGENDAMIENTO_ESTADOS_CANCELABLES,
} from "@/types";

interface AgendamientoCardProps {
  agendamiento: AgendamientoTour;
  tour: TourCatalogo | undefined;
  cliente: Cliente | undefined;
  reserva: Reserva | undefined;
  onEditar: (a: AgendamientoTour) => void;
  onCancelar: (a: AgendamientoTour) => void;
  onCambiarEstado: (
    id: string,
    estado: EstadoAgendamientoTour,
  ) => { ok: boolean; error?: string };
}

const TOUR_IMAGES: Record<string, string> = {
  "tour-001":
    "https://blog.urbansa.co/hs-fs/hubfs/Fachadas%20coloridas%20%E2%80%93%20La%20Candelaria%20%E2%80%93%20La%20Candelaria%20en%20el%20centro%20de%20Bogot%C3%A1%20-%E2%80%AFLa%20Candelaria%20Bogot%C3%A1%20%E2%80%93%20Beneficios%20de%20vivir%20en%20el%20centro%20de%20Bogot%C3%A1%E2%80%AF.jpg?width=1400&name=Fachadas%20coloridas%20%E2%80%93%20La%20Candelaria%20%E2%80%93%20La%20Candelaria%20en%20el%20centro%20de%20Bogot%C3%A1%20-%E2%80%AFLa%20Candelaria%20Bogot%C3%A1%20%E2%80%93%20Beneficios%20de%20vivir%20en%20el%20centro%20de%20Bogot%C3%A1%E2%80%AF.jpg",
  "tour-002":
    "https://monserrate.co/uploads/site/home/gallery/landscape/photo-19-2x.jpg",
  "tour-003":
    "https://cam.libertadores.edu.co/wp-content/uploads/2024/07/cande.jpeg",
};

// Estado variants para badges
const ESTADO_VARIANTS: Record<EstadoAgendamientoTour, BadgeVariant> = {
  pendiente: "pendiente",
  confirmado: "confirmada",
  cancelado: "cancelada",
  realizado: "completada",
};

// Formatea fecha ISO a DD/MM/YYYY
function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function AgendamientoCard({
  agendamiento,
  tour,
  cliente,
  onEditar,
  onCancelar,
  onCambiarEstado,
}: AgendamientoCardProps) {
  const t = useTranslations("tours");
  const tCommon = useTranslations("common");

  const puedeEditar = AGENDAMIENTO_ESTADOS_EDITABLES.includes(
    agendamiento.estado,
  );
  const puedeCancelar = AGENDAMIENTO_ESTADOS_CANCELABLES.includes(
    agendamiento.estado,
  );
  const puedeConfirmar = agendamiento.estado === "pendiente";
  const puedeRealizar = agendamiento.estado === "confirmado";

  const hayAcciones =
    puedeEditar || puedeCancelar || puedeConfirmar || puedeRealizar;

  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`
    : agendamiento.clienteId;

  const imageUrl = tour
    ? TOUR_IMAGES[tour.id] ||
      "https://placehold.co/600x400/A67C52/FFFFFF?text=Tour"
    : "https://placehold.co/600x400/A67C52/FFFFFF?text=Tour";

  const handleCambiarEstado = (estado: EstadoAgendamientoTour) => {
    onCambiarEstado(agendamiento.id, estado);
  };

  return (
    <div className="group relative rounded-xl bg-white shadow-md transition-all duration-200 hover:shadow-lg border border-brown-100">
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={tour?.nombre || "Tour"}
          width={600}
          height={400}
          className="h-full w-full object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-brown-900/80 to-brown-900/20" />

        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="font-serif text-lg font-bold text-white line-clamp-1">
            {tour?.nombre || "Tour desconocido"}
          </h3>
        </div>

        <div className="absolute right-3 top-3">
          <Badge
            variant={ESTADO_VARIANTS[agendamiento.estado]}
            label={t(`estados.${agendamiento.estado}`)}
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User
              className="h-4 w-4 shrink-0 text-brown-500"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-brown-900 truncate">
                {nombreCliente}
              </p>
              <p className="text-xs text-brown-500 font-mono">
                #{agendamiento.id.slice(-5).toUpperCase()}
              </p>
            </div>
          </div>

          {hayAcciones && (
            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <DropdownMenu
                ariaLabel={`${tCommon("actions")} - ${nombreCliente}`}
              >
                {puedeConfirmar && (
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstado("confirmado")}
                  >
                    <span className="flex items-center gap-2 text-brown-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("acciones.marcarConfirmado")}
                    </span>
                  </DropdownMenuItem>
                )}
                {puedeRealizar && (
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstado("realizado")}
                  >
                    <span className="flex items-center gap-2 text-brown-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("acciones.marcarRealizado")}
                    </span>
                  </DropdownMenuItem>
                )}
                {puedeEditar && (
                  <DropdownMenuItem onClick={() => onEditar(agendamiento)}>
                    <span className="text-brown-700">{tCommon("edit")}</span>
                  </DropdownMenuItem>
                )}
                {puedeCancelar && (
                  <DropdownMenuItem onClick={() => onCancelar(agendamiento)}>
                    <span className="text-brown-700">
                      {t("acciones.cancelar")}
                    </span>
                  </DropdownMenuItem>
                )}
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-brown-700">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brown-500" aria-hidden="true" />
            <span>{formatFecha(agendamiento.fecha)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brown-500" aria-hidden="true" />
            <span>{agendamiento.horaSalida}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-brown-700">
          <MapPin
            className="h-4 w-4 shrink-0 text-brown-500 mt-0.5"
            aria-hidden="true"
          />
          <span className="line-clamp-2">{agendamiento.puntoEncuentro}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-brown-100">
          <div className="flex items-center gap-1.5 text-sm text-brown-600">
            <Users className="h-4 w-4 text-brown-500" aria-hidden="true" />
            <span className="font-medium">
              {agendamiento.numeroParticipantes}
            </span>
            <span className="text-brown-500">
              {agendamiento.numeroParticipantes === 1
                ? "participant"
                : "participants"}
            </span>
          </div>

          {agendamiento.guiaAsignado && (
            <span className="text-xs text-brown-500 bg-brown-50 px-2 py-1 rounded">
              {agendamiento.guiaAsignado}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
