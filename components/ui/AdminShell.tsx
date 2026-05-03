"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { NavAdmin } from "./NavAdmin";

interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * AdminShell — contenedor de todas las páginas de gestión hotelera.
 *
 * Responsabilidades:
 * 1. Verificar que el usuario esté autenticado (flag en localStorage).
 *    Si no, redirige a /login.
 * 2. Renderizar NavAdmin encima del contenido del módulo.
 * 3. Añadir el offset superior necesario por la barra fija.
 */
export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("hotel_staff_auth");
    if (auth !== "true") {
      router.replace("/login");
    } else {
      setVerificado(true);
    }
  }, [router]);

  if (!verificado) {
    return <div className="min-h-screen bg-brown-900" aria-hidden />;
  }

  return (
    <>
      <NavAdmin />

      <div className="pt-16">{children}</div>
    </>
  );
}
