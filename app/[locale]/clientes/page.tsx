import type { Metadata } from 'next';
import { ClientesClient } from './components/ClientesClient';

export const metadata: Metadata = {
  title: 'Gestión de Clientes — Hotel Santa María',
  description: 'Administrar el registro de huéspedes del hotel',
};

/**
 * ClientesPage — Server Component.
 *
 * Delega toda la interactividad a ClientesClient ('use client').
 * Este componente existe para permitir metadata estática y mantener
 * la arquitectura Server/Client correctamente separada.
 */
export default function ClientesPage() {
  return <ClientesClient />;
}
