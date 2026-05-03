import type { Metadata } from "next";
import { PqrsClient } from "./components/PqrsClient";

export const metadata: Metadata = {
  title: "Gestión de PQRS — Hotel Santa María",
  description:
    "Administrar peticiones, quejas, reclamos y sugerencias del hotel",
};

export default function PqrsPage() {
  return <PqrsClient />;
}
