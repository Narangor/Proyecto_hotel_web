'use client';

import { useTranslations } from 'next-intl';
import type { HuespedFormData, HuespedErrors } from '../hooks/useReservar';

interface PasoHuespedProps {
  huespedData: HuespedFormData;
  huespedErrors: HuespedErrors;
  huespedValido: boolean;
  onCampo: <K extends keyof HuespedFormData>(campo: K, valor: HuespedFormData[K]) => void;
  onConfirmar: () => void;
}

const TIPOS_DOCUMENTO = ['CC', 'CE', 'PASAPORTE', 'TI'] as const;

export default function PasoHuesped({
  huespedData,
  huespedErrors,
  huespedValido,
  onCampo,
  onConfirmar,
}: PasoHuespedProps) {
  const t = useTranslations('reservar.huesped');

  return (
    <section aria-labelledby="huesped-titulo">
      <div className="mb-6">
        <h2
          id="huesped-titulo"
          className="text-lg font-semibold text-brown-900 mb-1 pl-3 border-l-4 border-gold-500"
        >
          {t('titulo')}
        </h2>
        <p className="text-sm text-brown-400 pl-3">{t('subtitulo')}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirmar();
        }}
        noValidate
        aria-label={t('titulo')}
      >
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(198,167,94,0.2)',
            boxShadow: '0 2px 12px rgba(43,27,24,0.06)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nombre */}
            <Field
              label={t('nombre')}
              htmlFor="huesped-nombre"
              error={huespedErrors.nombre ? t(`errores.${huespedErrors.nombre}`) : undefined}
              required
            >
              <input
                id="huesped-nombre"
                type="text"
                value={huespedData.nombre}
                onChange={(e) => onCampo('nombre', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400"
                style={{
                  borderColor: huespedErrors.nombre ? '#ef4444' : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.nombre)}
              />
            </Field>

            {/* Apellido */}
            <Field
              label={t('apellido')}
              htmlFor="huesped-apellido"
              error={huespedErrors.apellido ? t(`errores.${huespedErrors.apellido}`) : undefined}
              required
            >
              <input
                id="huesped-apellido"
                type="text"
                value={huespedData.apellido}
                onChange={(e) => onCampo('apellido', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400"
                style={{
                  borderColor: huespedErrors.apellido ? '#ef4444' : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.apellido)}
              />
            </Field>

            {/* Tipo de documento */}
            <Field
              label={t('tipoDocumento')}
              htmlFor="huesped-tipo-doc"
              error={
                huespedErrors.tipoDocumento
                  ? t(`errores.${huespedErrors.tipoDocumento}`)
                  : undefined
              }
              required
            >
              <select
                id="huesped-tipo-doc"
                value={huespedData.tipoDocumento}
                onChange={(e) =>
                  onCampo(
                    'tipoDocumento',
                    e.target.value as HuespedFormData['tipoDocumento'],
                  )
                }
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400 bg-white"
                style={{
                  borderColor: huespedErrors.tipoDocumento
                    ? '#ef4444'
                    : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.tipoDocumento)}
              >
                <option value="">—</option>
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {t(`documento${tipo}`)}
                  </option>
                ))}
              </select>
            </Field>

            {/* Número de documento */}
            <Field
              label={t('numeroDocumento')}
              htmlFor="huesped-num-doc"
              error={
                huespedErrors.numeroDocumento
                  ? t(`errores.${huespedErrors.numeroDocumento}`)
                  : undefined
              }
              required
            >
              <input
                id="huesped-num-doc"
                type="text"
                value={huespedData.numeroDocumento}
                onChange={(e) => onCampo('numeroDocumento', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400"
                style={{
                  borderColor: huespedErrors.numeroDocumento
                    ? '#ef4444'
                    : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.numeroDocumento)}
              />
            </Field>

            {/* Correo */}
            <Field
              label={t('correo')}
              htmlFor="huesped-correo"
              error={huespedErrors.correo ? t(`errores.${huespedErrors.correo}`) : undefined}
              required
            >
              <input
                id="huesped-correo"
                type="email"
                value={huespedData.correo}
                onChange={(e) => onCampo('correo', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400"
                style={{
                  borderColor: huespedErrors.correo ? '#ef4444' : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.correo)}
              />
            </Field>

            {/* Teléfono */}
            <Field
              label={t('telefono')}
              htmlFor="huesped-telefono"
              error={
                huespedErrors.telefono ? t(`errores.${huespedErrors.telefono}`) : undefined
              }
              required
            >
              <input
                id="huesped-telefono"
                type="tel"
                value={huespedData.telefono}
                onChange={(e) => onCampo('telefono', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400"
                style={{
                  borderColor: huespedErrors.telefono
                    ? '#ef4444'
                    : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.telefono)}
              />
            </Field>

            {/* Nacionalidad */}
            <Field
              label={t('nacionalidad')}
              htmlFor="huesped-nacionalidad"
              error={
                huespedErrors.nacionalidad
                  ? t(`errores.${huespedErrors.nacionalidad}`)
                  : undefined
              }
              required
            >
              <input
                id="huesped-nacionalidad"
                type="text"
                value={huespedData.nacionalidad}
                onChange={(e) => onCampo('nacionalidad', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400"
                style={{
                  borderColor: huespedErrors.nacionalidad
                    ? '#ef4444'
                    : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.nacionalidad)}
              />
            </Field>

            {/* Fecha de nacimiento */}
            <Field
              label={t('fechaNacimiento')}
              htmlFor="huesped-fecha-nac"
              error={
                huespedErrors.fechaNacimiento
                  ? t(`errores.${huespedErrors.fechaNacimiento}`)
                  : undefined
              }
              required
            >
              <input
                id="huesped-fecha-nac"
                type="date"
                value={huespedData.fechaNacimiento}
                onChange={(e) => onCampo('fechaNacimiento', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400"
                style={{
                  borderColor: huespedErrors.fechaNacimiento
                    ? '#ef4444'
                    : 'rgba(198,167,94,0.35)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-required="true"
                aria-invalid={Boolean(huespedErrors.fechaNacimiento)}
              />
            </Field>

            {/* Observaciones — ancho completo */}
            <div className="sm:col-span-2">
              <Field
                label={t('observaciones')}
                htmlFor="huesped-observaciones"
              >
                <textarea
                  id="huesped-observaciones"
                  rows={3}
                  value={huespedData.observaciones}
                  onChange={(e) => onCampo('observaciones', e.target.value)}
                  placeholder={t('observacionesPlaceholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm text-brown-900 outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                  style={{
                    borderColor: 'rgba(198,167,94,0.35)',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Botón confirmar */}
        <button
          type="submit"
          disabled={!huespedValido}
          style={{
            backgroundColor: huespedValido ? '#C6A75E' : 'rgba(198,167,94,0.35)',
            color: '#ffffff',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '15px',
            padding: '14px 32px',
            borderRadius: '10px',
            cursor: huespedValido ? 'pointer' : 'not-allowed',
            border: 'none',
            width: '100%',
            transition: 'background-color 0.15s',
          }}
          aria-disabled={!huespedValido}
        >
          {t('confirmar')} ✓
        </button>
      </form>
    </section>
  );
}

// ── Campo de formulario reutilizable ──────────────────────────────────────────

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, required, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-brown-600 mb-1 uppercase tracking-wide"
      >
        {label}
        {required && (
          <span className="text-gold-600 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
