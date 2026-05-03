import type { Metadata } from 'next';
import HomeClient from './home/components/HomeClient';

export const metadata: Metadata = {
  title: 'Hotel Santa María — Una experiencia excepcional',
  description:
    'Descubra el lujo refinado y la calidez inigualable en el corazón de la elegancia. Reserve su estadía en Hotel Santa María.',
};

export default function HomePage() {
  return <HomeClient />;
}
