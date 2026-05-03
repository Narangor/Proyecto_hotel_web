'use client';

interface EmptyStateProps {
  message: string;
  description?: string;
}

/**
 * EmptyState — estado vacío para listas sin resultados.
 * Evita duplicar este patrón en cada módulo.
 */
export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brown-100">
        <svg
          className="h-8 w-8 text-brown-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="font-serif text-lg font-semibold text-brown-700">{message}</p>
      {description && (
        <p className="mt-1 text-sm text-brown-400">{description}</p>
      )}
    </div>
  );
}
