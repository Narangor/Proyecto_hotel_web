import type { Metadata } from 'next';
import { CheckinClient } from './components/CheckinClient';

export const metadata: Metadata = {
  title: 'Check-in Digital — Hotel Santa María',
  description: 'Gestionar los ingresos y check-ins de huéspedes del hotel',
};

/**
 * CheckinPage — Server Component.
 *
 * Delega toda la interactividad a CheckinClient ('use client').
 * Este componente existe para permitir metadata estática y mantener
 * la arquitectura Server/Client correctamente separada.
 */
export default function CheckinPage() {
  return <CheckinClient />;
}
