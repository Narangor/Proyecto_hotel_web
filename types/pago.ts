/**
 * Tipos para la entidad Pago.
 *
 * Ciclo de vida de estados:
 *   pendiente → completado
 *   pendiente → rechazado
 *   completado → reembolsado
 *   completado | pendiente → anulado
 */

export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA_CREDITO"
  | "TARJETA_DEBITO"
  | "TRANSFERENCIA"
  | "PSE";

export type EstadoPago =
  | "pendiente"
  | "completado"
  | "rechazado"
  | "reembolsado"
  | "anulado";

/** Estados que permiten edición */
export const PAGO_ESTADOS_EDITABLES: EstadoPago[] = ["pendiente"];

/** Estados que permiten anulación */
export const PAGO_ESTADOS_ANULABLES: EstadoPago[] = ["pendiente", "completado"];

export interface Pago {
  id: string;
  reservaId: string;
  /** Monto total del pago en COP */
  monto: number;
  /** ISO 8601 date string: "YYYY-MM-DD" */
  fecha: string;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  /** Número de referencia o transacción (opcional, útil para transferencias/PSE) */
  referencia?: string;
  observaciones?: string;
  motivoAnulacion?: string;
  /** ISO 8601 datetime string */
  creadoEn: string;
}

/** Datos que el formulario necesita; estado se asigna internamente */
export type PagoFormData = Omit<
  Pago,
  "id" | "creadoEn" | "estado" | "motivoAnulacion"
>;
