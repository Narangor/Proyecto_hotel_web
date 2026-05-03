/**
 * Tipos para la entidad Cliente (Huésped).
 *
 * TipoDocumento cubre los documentos de identidad más comunes en Colombia
 * y los requeridos para turistas internacionales.
 */

export type TipoDocumento = 'CC' | 'CE' | 'PASAPORTE' | 'TI';

export type EstadoCliente = 'activo' | 'inactivo';

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento;
  /** Debe ser único en el sistema — validado en useClientes */
  numeroDocumento: string;
  correo: string;
  telefono: string;
  nacionalidad: string;
  /** ISO 8601 date string: "YYYY-MM-DD" */
  fechaNacimiento: string;
  estado: EstadoCliente;
  /** ISO 8601 datetime string: generado automáticamente al crear */
  creadoEn: string;
}

/** Datos que el formulario de creación/edición necesita del usuario */
export type ClienteFormData = Omit<Cliente, 'id' | 'creadoEn'>;
