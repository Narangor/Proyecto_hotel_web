/**
 * Paquetes promocionales ofrecidos por el hotel (precio lista vs promocional).
 */

export type EstadoPaquete = "activo" | "inactivo" | "agotado";

export const PAQUETE_ESTADOS_EDITABLES: EstadoPaquete[] = [
  "activo",
  "inactivo",
  "agotado",
];

export const PAQUETE_ESTADOS_ELIMINABLES: EstadoPaquete[] = ["inactivo"];

export interface PaquetePromocional {
  id: string;
  nombre: string;
  descripcion: string;
  precioLista: number;
  precioPromocional: number;
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  cuposTotales: number;
  cuposVendidos: number;
  estado: EstadoPaquete;
  incluye: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export type PaqueteFormData = Omit<
  PaquetePromocional,
  "id" | "creadoEn" | "actualizadoEn" | "cuposVendidos"
>;
