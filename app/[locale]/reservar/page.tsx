import type { Metadata } from 'next';
import ReservarClient from './components/ReservarClient';

export const metadata: Metadata = {
  title: 'Reservar — Hotel Santa María',
  description: 'Reserve su habitación en Hotel Santa María. Proceso rápido y seguro.',
};

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ entrada?: string; salida?: string; adultos?: string }>;
}) {
  const params = await searchParams;
  return (
    <ReservarClient
      initialEntrada={params.entrada ?? ''}
      initialSalida={params.salida ?? ''}
      initialAdultos={params.adultos ? Math.max(1, Number(params.adultos)) : 2}
    />
  );
}
