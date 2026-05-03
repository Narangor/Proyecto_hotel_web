'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import type { Cliente, ClienteFormData, TipoDocumento, EstadoCliente } from '@/types';

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClienteFormData) => { ok: boolean; error?: string };
  onEdit: (id: string, data: Omit<ClienteFormData, 'numeroDocumento'>) => { ok: boolean };
  clienteInicial?: Cliente | null;
}

type FormErrors = Partial<Record<keyof ClienteFormData, string>>;

const TIPOS_DOCUMENTO: TipoDocumento[] = ['CC', 'CE', 'PASAPORTE', 'TI'];

const FORM_VACIO: ClienteFormData = {
  nombre: '',
  apellido: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  correo: '',
  telefono: '',
  nacionalidad: '',
  fechaNacimiento: '',
  estado: 'activo',
};

/**
 * ClienteForm — formulario para crear y editar clientes.
 *
 * Renderizado como modal. Recibe callbacks del hook para crear/editar,
 * sin lógica de negocio propia. Solo responsable de:
 * 1. Gestionar estado interno del formulario (inputs controlados).
 * 2. Validar campos requeridos antes de llamar al hook.
 * 3. Mostrar errores de validación (locales y del hook).
 */
export function ClienteForm({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  clienteInicial,
}: ClienteFormProps) {
  const t = useTranslations('clientes');
  const tCommon = useTranslations('common');

  const esEdicion = Boolean(clienteInicial);
  const [form, setForm] = useState<ClienteFormData>(FORM_VACIO);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos del cliente al abrir en modo edición
  useEffect(() => {
    if (clienteInicial) {
      setForm({
        nombre: clienteInicial.nombre,
        apellido: clienteInicial.apellido,
        tipoDocumento: clienteInicial.tipoDocumento,
        numeroDocumento: clienteInicial.numeroDocumento,
        correo: clienteInicial.correo,
        telefono: clienteInicial.telefono,
        nacionalidad: clienteInicial.nacionalidad,
        fechaNacimiento: clienteInicial.fechaNacimiento,
        estado: clienteInicial.estado,
      });
    } else {
      setForm(FORM_VACIO);
    }
    setErrors({});
  }, [clienteInicial, isOpen]);

  function actualizar(campo: keyof ClienteFormData, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar error del campo al modificar
    if (errors[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): FormErrors {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = t('errores.nombreRequerido');
    if (!form.apellido.trim()) e.apellido = t('errores.apellidoRequerido');
    if (!form.tipoDocumento) e.tipoDocumento = t('errores.tipoDocumentoRequerido');
    if (!form.numeroDocumento.trim()) e.numeroDocumento = t('errores.documentoRequerido');
    if (!form.correo.trim()) {
      e.correo = t('errores.correoRequerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = t('errores.correoInvalido');
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validar();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    let resultado: { ok: boolean; error?: string };

    if (esEdicion && clienteInicial) {
      const { numeroDocumento: _, ...editData } = form;
      resultado = onEdit(clienteInicial.id, editData);
    } else {
      resultado = onSubmit(form);
    }

    setSubmitting(false);

    if (!resultado.ok && resultado.error === 'documentoDuplicado') {
      setErrors({ numeroDocumento: t('errores.documentoDuplicado') });
      return;
    }

    onClose();
  }

  const inputClass =
    'w-full rounded-lg border border-brown-200 px-3 py-2 text-sm text-brown-900 bg-white focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:bg-brown-50 disabled:text-brown-400';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? t('editarTitulo') : t('crearTitulo')}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate aria-label={esEdicion ? t('editarTitulo') : t('crearTitulo')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Nombre */}
          <FormField label={t('campos.nombre')} required error={errors.nombre}>
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Apellido */}
          <FormField label={t('campos.apellido')} required error={errors.apellido}>
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.apellido}
                onChange={(e) => actualizar('apellido', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Tipo de documento */}
          <FormField label={t('campos.tipoDocumento')} required error={errors.tipoDocumento}>
            {(id, aria) => (
              <select
                id={id}
                value={form.tipoDocumento}
                onChange={(e) => actualizar('tipoDocumento', e.target.value)}
                className={inputClass}
                {...aria}
              >
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {t(`tiposDocumento.${tipo}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Número de documento — solo lectura en edición */}
          <FormField label={t('campos.numeroDocumento')} required={!esEdicion} error={errors.numeroDocumento}>
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.numeroDocumento}
                onChange={(e) => actualizar('numeroDocumento', e.target.value)}
                disabled={esEdicion}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Correo */}
          <FormField label={t('campos.correo')} required error={errors.correo}>
            {(id, aria) => (
              <input
                id={id}
                type="email"
                value={form.correo}
                onChange={(e) => actualizar('correo', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Teléfono */}
          <FormField label={t('campos.telefono')} error={errors.telefono}>
            {(id, aria) => (
              <input
                id={id}
                type="tel"
                value={form.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Nacionalidad */}
          <FormField label={t('campos.nacionalidad')} error={errors.nacionalidad}>
            {(id, aria) => (
              <input
                id={id}
                type="text"
                value={form.nacionalidad}
                onChange={(e) => actualizar('nacionalidad', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Fecha de nacimiento */}
          <FormField label={t('campos.fechaNacimiento')} error={errors.fechaNacimiento}>
            {(id, aria) => (
              <input
                id={id}
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) => actualizar('fechaNacimiento', e.target.value)}
                className={inputClass}
                {...aria}
              />
            )}
          </FormField>

          {/* Estado */}
          <FormField label={t('campos.estado')} error={errors.estado}>
            {(id, aria) => (
              <select
                id={id}
                value={form.estado}
                onChange={(e) => actualizar('estado', e.target.value as EstadoCliente)}
                className={inputClass}
                {...aria}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            )}
          </FormField>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex justify-end gap-3 border-t border-brown-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brown-200 px-5 py-2 text-sm font-medium text-brown-700 hover:bg-brown-50 transition-colors"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gold-600 px-5 py-2 text-sm font-medium text-white hover:bg-gold-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
