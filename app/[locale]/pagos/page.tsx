import type { Metadata } from "next";
import { PagosClient } from "./components/PagosClient";

export const metadata: Metadata = {
  title: "Gestión de Pagos — Hotel Santa María",
  description: "Administrar pagos del hotel",
};

export default function PagosPage() {
  return <PagosClient />;
}
