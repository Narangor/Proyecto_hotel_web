import type { Metadata } from 'next';
import { LoginClient } from './components/LoginClient';

export const metadata: Metadata = {
  title: 'Acceso Personal — Hotel Santa María',
};

export default function LoginPage() {
  return <LoginClient />;
}
