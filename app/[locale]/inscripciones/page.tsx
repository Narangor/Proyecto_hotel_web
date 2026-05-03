import type { Metadata } from "next";
import { InscripcionesClient } from "./components/InscripcionesClient";

export const metadata: Metadata = {
  title: "Inscripciones — Hotel Santa María",
  description:
    "Inscripción a eventos y reservas en restaurantes del hotel",
};

export default function InscripcionesPage() {
  return <InscripcionesClient />;
}
