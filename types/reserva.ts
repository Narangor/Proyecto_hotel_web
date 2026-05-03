/**
 * Tipos para la entidad Reserva.
 *
 * Ciclo de vida de estados:
 *   pendiente → confirmada → en_curso (al hacer check-in) → completada
 *   confirmada | pendiente → cancelada
 */

export type TipoHabitacion = 'SENCILLA' | 'DOBLE' | 'SUITE' | 'FAMILIAR';

export type EstadoReserva =
  | 'pendiente'
  | 'confirmada'
  | 'cancelada'
  | 'en_curso'
  | 'completada';

/** Estados que permiten edición */
export const RESERVA_ESTADOS_EDITABLES: EstadoReserva[] = ['pendiente', 'confirmada'];

/** Estados que permiten cancelación */
export const RESERVA_ESTADOS_CANCELABLES: EstadoReserva[] = ['pendiente', 'confirmada'];

export interface Reserva {
  id: string;
  clienteId: string;
  habitacionNumero: string;
  tipoHabitacion: TipoHabitacion;
  /** ISO 8601 date string: "YYYY-MM-DD" */
  fechaEntrada: string;
  /** ISO 8601 date string: "YYYY-MM-DD" */
  fechaSalida: string;
  numeroHuespedes: number;
  estado: EstadoReserva;
  /** Calculado automáticamente: precio por noche × número de noches */
  total: number;
  observaciones?: string;
  motivoCancelacion?: string;
  /** ISO 8601 datetime string */
  creadoEn: string;
}

/** Datos que el formulario necesita; total y estado se calculan/asignan internamente */
export type ReservaFormData = Omit<
  Reserva,
  'id' | 'creadoEn' | 'estado' | 'total' | 'motivoCancelacion'
>;
