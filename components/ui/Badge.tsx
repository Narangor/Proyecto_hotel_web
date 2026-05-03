'use client';

/**
 * Badge — indicador visual de estado.
 *
 * Variantes mapeadas a la paleta del hotel (sin rojo):
 * - active/confirmada/completado → dorado
 * - pending/pendiente            → marrón claro
 * - inactive/cancelada/anulado   → neutro gris
 * - in_progress/en_curso/en_proceso → marrón oscuro
 * - resuelto/cerrado             → dorado (similar a completado)
 * - rechazado                    → gris oscuro
 * - reembolsado                  → marrón medio
 */

export type BadgeVariant =
  | 'activo'
  | 'inactivo'
  | 'pendiente'
  | 'confirmada'
  | 'cancelada'
  | 'en_curso'
  | 'en_proceso'
  | 'completada'
  | 'completado'
  | 'resuelto'
  | 'cerrado'
  | 'no_presentado'
  | 'anulado'
  | 'rechazado'
  | 'reembolsado';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  activo: 'bg-gold-100 text-gold-800 border border-gold-300',
  confirmada: 'bg-gold-100 text-gold-800 border border-gold-300',
  completada: 'bg-gold-100 text-gold-800 border border-gold-300',
  completado: 'bg-gold-100 text-gold-800 border border-gold-300',
  resuelto: 'bg-gold-100 text-gold-800 border border-gold-300',
  cerrado: 'bg-gray-100 text-gray-600 border border-gray-200',
  en_curso: 'bg-brown-700 text-cream border border-brown-600',
  en_proceso: 'bg-brown-700 text-cream border border-brown-600',
  pendiente: 'bg-brown-100 text-brown-700 border border-brown-300',
  no_presentado: 'bg-brown-100 text-brown-600 border border-brown-200',
  inactivo: 'bg-gray-100 text-gray-600 border border-gray-200',
  cancelada: 'bg-gray-100 text-gray-600 border border-gray-200',
  anulado: 'bg-gray-100 text-gray-500 border border-gray-200',
  rechazado: 'bg-gray-200 text-gray-700 border border-gray-300',
  reembolsado: 'bg-brown-200 text-brown-800 border border-brown-300',
};

export function Badge({ variant, label }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {label}
    </span>
  );
}
