/**
 * Tipos para la entidad PQRS (Peticiones, Quejas, Reclamos, Sugerencias).
 *
 * Ciclo de vida de estados:
 *   pendiente → en_proceso
 *   en_proceso → resuelto
 *   en_proceso → cerrado
 *   pendiente | en_proceso → cerrado
 */

export type TipoPqrs = "peticion" | "queja" | "reclamo" | "sugerencia";

export type EstadoPqrs = "pendiente" | "en_proceso" | "resuelto" | "cerrado";

export type PrioridadPqrs = "baja" | "media" | "alta" | "urgente";

/** Estados que permiten edición */
export const PQRS_ESTADOS_EDITABLES: EstadoPqrs[] = ["pendiente", "en_proceso"];

/** Estados que permiten eliminación */
export const PQRS_ESTADOS_ELIMINABLES: EstadoPqrs[] = ["pendiente"];

export interface Pqrs {
  id: string;
  tipo: TipoPqrs;
  asunto: string;
  descripcion: string;
  /** ID del cliente que reporta (opcional, puede ser anónimo) */
  clienteId?: string;
  /** Número de habitación relacionado (opcional) */
  habitacionNumero?: string;
  /** ID de reserva relacionada (opcional) */
  reservaId?: string;
  prioridad: PrioridadPqrs;
  estado: EstadoPqrs;
  /** ISO 8601 date string: "YYYY-MM-DD" */
  fechaCreacion: string;
  /** Fecha límite de respuesta (opcional) */
  fechaLimite?: string;
  /** Empleado asignado (opcional) */
  asignadoA?: string;
  /** Respuesta o solución (opcional) */
  respuesta?: string;
  /** ISO 8601 datetime string */
  creadoEn: string;
  /** ISO 8601 datetime string (opcional) */
  actualizadoEn?: string;
  /** ISO 8601 datetime string (opcional) */
  fechaCierre?: string;
}

/** Datos que el formulario necesita */
export type PqrsFormData = Omit<
  Pqrs,
  "id" | "creadoEn" | "actualizadoEn" | "fechaCierre"
>;
