import type { Metadata } from "next";
import { ToursClient } from "./components/ToursClient";

export const metadata: Metadata = {
  title: "Agendamiento de tours — Hotel Santa María",
  description: "Reserva y gestión de tours para huéspedes",
};

export default function ToursPage() {
  return <ToursClient />;
}
