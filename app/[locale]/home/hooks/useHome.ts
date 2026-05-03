'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

/**
 * useHome — estado del formulario de búsqueda de la página de inicio.
 * Gestiona fechas, huéspedes y navegación a /reservar.
 */
export function useHome() {
  const router = useRouter();

  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [huespedAbierto, setHuespedAbierto] = useState(false);

  const resumenHuespedes = `${adultos} ${adultos === 1 ? 'Adulto' : 'Adultos'}, ${ninos} ${ninos === 1 ? 'Niño' : 'Niños'}`;

  function buscarDisponibilidad() {
    const params = new URLSearchParams();
    if (entrada) params.set('entrada', entrada);
    if (salida) params.set('salida', salida);
    params.set('adultos', String(adultos));
    params.set('ninos', String(ninos));
    router.push(`/reservar?${params.toString()}`);
  }

  return {
    entrada,
    setEntrada,
    salida,
    setSalida,
    adultos,
    setAdultos,
    ninos,
    setNinos,
    huespedAbierto,
    setHuespedAbierto,
    resumenHuespedes,
    buscarDisponibilidad,
  };
}
