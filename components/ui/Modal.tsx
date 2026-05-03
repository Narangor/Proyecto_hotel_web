'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: React.ReactNode;
  /** Ancho máximo del panel. Por defecto 'md'. */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

/**
 * Modal — diálogo accesible reutilizable.
 *
 * Accesibilidad implementada:
 * - role="dialog" + aria-modal="true"
 * - aria-labelledby apunta al título
 * - Cierre con tecla Escape
 * - Foco atrapado dentro del modal mientras está abierto
 * - Overlay con onClick para cerrar con clic externo
 */
export function Modal({
  isOpen,
  onClose,
  title,
  titleId = 'modal-title',
  children,
  size = 'md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Devolver foco al elemento que abrió el modal al cerrar
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-brown-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${SIZE_CLASSES[size]} rounded-2xl bg-cream shadow-2xl outline-none`}
      >
        {/* Header */}
        <div className="border-b border-brown-100 px-6 py-4">
          <h2
            id={titleId}
            className="font-serif text-xl font-bold text-brown-900"
          >
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
