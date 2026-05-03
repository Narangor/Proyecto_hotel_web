/**
 * Esta ruta raíz (/) no debería renderizarse nunca en producción.
 * El middleware intercepta todas las solicitudes a '/' y redirige
 * al locale por defecto ('/es') antes de que Next.js llegue aquí.
 *
 * Este archivo existe solo como fallback de seguridad.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/es');
}
