import type { Metadata } from "next";
import { PaquetesClient } from "./components/PaquetesClient";

export const metadata: Metadata = {
  title: "Paquetes promocionales — Hotel Santa María",
  description: "Administración de paquetes promocionales del hotel",
};

export default function PaquetesPage() {
  return <PaquetesClient />;
}
