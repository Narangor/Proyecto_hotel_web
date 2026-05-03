'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from '@/i18n/navigation';

/**
 * useLogin — gestiona el estado del formulario de acceso del personal.
 *
 * La autenticación es demostrativa: cualquier combinación de correo y
 * contraseña no vacíos es aceptada. El acceso se persiste en localStorage.
 */
export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Ingrese correo y contraseña.');
      return;
    }

    setCargando(true);
    // Simulación de latencia de red (experiencia realista)
    await new Promise((r) => setTimeout(r, 800));

    localStorage.setItem('hotel_staff_auth', 'true');
    router.push('/clientes');
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    cargando,
    handleSubmit,
  };
}
