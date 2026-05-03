/**
 * Catálogo de tours y agendamientos por huésped.
 */

export interface TourCatalogo {
  id: string;
  nombre: string;
  duracionHoras: number;
  descripcion: string;
}

export type EstadoAgendamientoTour =
  | "pendiente"
  | "confirmado"
  | "cancelado"
  | "realizado";

export const AGENDAMIENTO_ESTADOS_EDITABLES: EstadoAgendamientoTour[] = [
  "pendiente",
  "confirmado",
];

export const AGENDAMIENTO_ESTADOS_CANCELABLES: EstadoAgendamientoTour[] = [
  "pendiente",
  "confirmado",
];

export interface AgendamientoTour {
  id: string;
  tourCatalogoId: string;
  clienteId: string;
  reservaId?: string;
  fecha: string;
  horaSalida: string;
  numeroParticipantes: number;
  estado: EstadoAgendamientoTour;
  puntoEncuentro: string;
  guiaAsignado?: string;
  motivoCancelacion?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export type AgendamientoTourFormData = Omit<
  AgendamientoTour,
  "id" | "creadoEn" | "actualizadoEn" | "motivoCancelacion"
>;
