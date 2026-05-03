import type { Metadata } from 'next';
import { ReservasClient } from './components/ReservasClient';

export const metadata: Metadata = {
  title: 'Gestión de Reservas — Hotel Santa María',
  description: 'Administrar reservas de habitaciones del hotel',
};

export default function ReservasPage() {
  return <ReservasClient />;
}
