/**
 * Inscripciones a eventos del hotel o reservas en restaurantes asociados.
 */

export type CategoriaInscripcion = "evento" | "restaurante";

export type EstadoInscripcion =
  | "pendiente"
  | "confirmada"
  | "cancelada"
  | "completada";

export const INSCRIPCION_ESTADOS_EDITABLES: EstadoInscripcion[] = [
  "pendiente",
  "confirmada",
];

export const INSCRIPCION_ESTADOS_ELIMINABLES: EstadoInscripcion[] = [
  "pendiente",
];

export interface Inscripcion {
  id: string;
  categoria: CategoriaInscripcion;
  nombreActividad: string;
  descripcion: string;
  clienteId: string;
  reservaId?: string;
  fechaEvento: string;
  horaInicio: string;
  numeroPersonas: number;
  estado: EstadoInscripcion;
  motivoCancelacion?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export type InscripcionFormData = Omit<
  Inscripcion,
  "id" | "creadoEn" | "actualizadoEn" | "motivoCancelacion"
>;
