import type { Metadata } from "next";
import { SolicitudesClient } from "./components/SolicitudesClient";

export const metadata: Metadata = {
  title: "Gestión de Solicitudes — Hotel Santa María",
  description: "Administrar solicitudes de servicio del hotel",
};

export default function SolicitudesPage() {
  return <SolicitudesClient />;
}
