/**
 * Tipos para la entidad Solicitud (Room Service Requests).
 *
 * Ciclo de vida de estados:
 *   pendiente → en_proceso
 *   en_proceso → completada
 *   pendiente | en_proceso → cancelada
 */

export type TipoSolicitud =
  | "limpieza"
  | "comida"
  | "bebidas"
  | "amenidades"
  | "mantenimiento"
  | "lavanderia"
  | "transporte"
  | "otro";

export type EstadoSolicitud =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "cancelada";

export type PrioridadSolicitud = "baja" | "media" | "alta" | "urgente";

/** Estados que permiten edición */
export const SOLICITUD_ESTADOS_EDITABLES: EstadoSolicitud[] = ["pendiente"];

/** Estados que permiten cancelación */
export const SOLICITUD_ESTADOS_CANCELABLES: EstadoSolicitud[] = [
  "pendiente",
  "en_proceso",
];

export interface Solicitud {
  id: string;
  reservaId: string;
  tipo: TipoSolicitud;
  /** Descripción detallada de la solicitud */
  descripcion: string;
  habitacionNumero: string;
  prioridad: PrioridadSolicitud;
  estado: EstadoSolicitud;
  /** Nombre del empleado asignado */
  empleadoAsignado?: string;
  /** ISO 8601 datetime string */
  fechaSolicitud: string;
  /** ISO 8601 datetime string (opcional) */
  fechaCompletada?: string;
  /** Notas adicionales del staff */
  notas?: string;
  motivoCancelacion?: string;
  /** ISO 8601 datetime string */
  creadoEn: string;
}

/** Datos que el formulario necesita; estado se asigna internamente */
export type SolicitudFormData = Omit<
  Solicitud,
  "id" | "estado" | "fechaCompletada" | "motivoCancelacion" | "creadoEn"
>;
