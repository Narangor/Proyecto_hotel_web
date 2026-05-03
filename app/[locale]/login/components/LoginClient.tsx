'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useLogin } from '../hooks/useLogin';

export function LoginClient() {
  const t = useTranslations('login');
  const { email, setEmail, password, setPassword, error, cargando, handleSubmit } =
    useLogin();

  return (
    <div className="min-h-screen bg-brown-900 flex flex-col">

      {/* Header mínimo */}
      <header className="px-6 py-5 border-b border-brown-700/50">
        <Link
          href="/"
          className="flex items-center gap-2 hotel-title text-gold-400 text-xl w-fit"
        >
          <span aria-hidden="true">★</span>
          <span>Hotel Santa María</span>
        </Link>
      </header>

      {/* Formulario centrado */}
      <main
        className="flex-1 flex items-center justify-center px-4 py-12"
        id="main-content"
      >
        <div className="w-full max-w-sm">
          {/* Tarjeta */}
          <div className="bg-brown-800 border border-brown-700 rounded-2xl p-8 shadow-2xl">

            {/* Encabezado */}
            <div className="text-center mb-8">
              <div className="text-3xl mb-3" aria-hidden="true">🏨</div>
              <h1 className="hotel-title text-cream text-2xl mb-1">{t('titulo')}</h1>
              <p className="text-cream/50 text-sm">{t('subtitulo')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate aria-label={t('ariaLabel')}>
              <div className="flex flex-col gap-5">

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-email"
                    className="text-[11px] font-bold tracking-widest uppercase text-cream/60"
                  >
                    {t('email')}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@santamariahotel.com"
                    required
                    aria-required="true"
                    className="bg-brown-900 border border-brown-600 rounded-lg px-4 py-3 text-cream text-sm placeholder:text-cream/25 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-[11px] font-bold tracking-widest uppercase text-cream/60"
                  >
                    {t('password')}
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    aria-required="true"
                    className="bg-brown-900 border border-brown-600 rounded-lg px-4 py-3 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="text-amber-400 text-sm text-center"
                  >
                    {error}
                  </p>
                )}

                {/* Botón */}
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed text-brown-900 font-bold text-sm tracking-wider uppercase py-3 rounded-lg transition-colors mt-1"
                >
                  {cargando ? t('cargando') : t('ingresar')}
                </button>
              </div>
            </form>

            {/* Hint */}
            <p className="text-cream/30 text-xs text-center mt-6 leading-relaxed">
              {t('hint')}
            </p>
          </div>

          {/* Volver */}
          <div className="text-center mt-6">
            <Link href="/" className="text-cream/50 hover:text-gold-400 text-sm transition-colors">
              ← {t('volver')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
