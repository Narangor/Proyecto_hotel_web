'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import type { Cliente } from '@/types';

interface DeleteClienteModalProps {
  cliente: Cliente | null;
  onConfirmar: (id: string) => { ok: boolean; error?: string };
  onCerrar: () => void;
}

/**
 * DeleteClienteModal — modal de confirmación para eliminar un cliente.
 *
 * Maneja el caso donde el cliente tiene reservas activas:
 * muestra un mensaje de error en lugar de proceder con la eliminación.
 */
export function DeleteClienteModal({
  cliente,
  onConfirmar,
  onCerrar,
}: DeleteClienteModalProps) {
  const t = useTranslations('clientes');
  const tCommon = useTranslations('common');

  if (!cliente) return null;

  function handleConfirmar() {
    if (!cliente) return;
    const resultado = onConfirmar(cliente.id);
    if (resultado.ok) {
      onCerrar();
    }
    // Si no ok, el error se muestra — el modal permanece abierto
  }

  return (
    <Modal
      isOpen={Boolean(cliente)}
      onClose={onCerrar}
      title={t('eliminar.titulo')}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brown-700">
          {t('eliminar.mensaje', {
            nombre: cliente.nombre,
            apellido: cliente.apellido,
          })}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-brown-200 px-4 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className="rounded-xl bg-brown-700 px-4 py-2 text-sm font-medium text-white hover:bg-brown-800 transition-colors"
            aria-label={`${tCommon('confirm')} ${t('eliminar.titulo').toLowerCase()} de ${cliente.nombre} ${cliente.apellido}`}
          >
            {tCommon('confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
