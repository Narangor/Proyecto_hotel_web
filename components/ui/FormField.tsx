'use client';

import { useId } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: (id: string, ariaProps: React.AriaAttributes) => React.ReactNode;
}

/**
 * FormField — wrapper accesible para campos de formulario.
 *
 * Genera IDs únicos con useId() para asociar label ↔ input.
 * Propaga aria-required, aria-invalid y aria-describedby al children
 * mediante un render prop, manteniendo flexibilidad para cualquier
 * tipo de input (text, select, textarea, etc.).
 *
 * Uso:
 * <FormField label="Nombre" required error={errors.nombre}>
 *   {(id, aria) => <input id={id} {...aria} ... />}
 * </FormField>
 */
export function FormField({ label, error, required, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  const ariaProps: React.AriaAttributes = {
    'aria-required': required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-brown-800"
      >
        {label}
        {required && (
          <span className="ml-1 text-gold-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children(id, ariaProps)}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-amber-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
