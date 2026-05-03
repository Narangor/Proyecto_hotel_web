/**
 * Tipos para la entidad Check-in.
 *
 * Ciclo de vida de estados:
 *   pendiente → completado (al registrar el ingreso físico)
 *   pendiente → no_presentado (si el huésped no llega)
 *   completado → anulado (solo por administrador, con motivo obligatorio)
 *
 * La anulación revierte la reserva asociada a estado 'confirmada'
 * y libera la habitación.
 */

export type EstadoCheckin =
  | 'pendiente'
  | 'completado'
  | 'no_presentado'
  | 'anulado';

export interface Checkin {
  id: string;
  reservaId: string;
  clienteId: string;
  habitacionNumero: string;
  /**
   * ISO 8601 datetime string cuando el huésped ingresó físicamente.
   * null mientras el estado sea 'pendiente' o 'no_presentado'.
   */
  fechaHoraCheckin: string | null;
  /** ISO 8601 date string: tomada de la fecha de salida de la reserva */
  fechaEsperadaCheckout: string;
  numeroAcompanantes: number;
  estado: EstadoCheckin;
  observaciones?: string;
  /** Solo presente cuando estado === 'anulado' */
  motivoAnulacion?: string;
  /** ISO 8601 datetime string del momento de anulación */
  fechaAnulacion?: string;
}

/** Datos para registrar un nuevo check-in */
export type CheckinFormData = Pick<
  Checkin,
  'reservaId' | 'clienteId' | 'habitacionNumero' | 'numeroAcompanantes' | 'observaciones'
>;

/** Datos editables de un check-in existente */
export type CheckinUpdateData = Pick<
  Checkin,
  'numeroAcompanantes' | 'observaciones' | 'habitacionNumero'
>;
