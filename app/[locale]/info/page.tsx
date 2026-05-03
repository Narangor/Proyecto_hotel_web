"use client";

import Section from "@/components/ui/hotel/Section";
import Card from "@/components/ui/hotel/Card";

export default function InfoPage() {
  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-[#2B1B18]">
        Hotel Santa María
      </h1>

      <p className="text-gray-600 mb-10">
        Un espacio diseñado para brindar lujo, comodidad y una experiencia
        inolvidable en cada estadía.
      </p>

      <Section title="Servicios del Hotel">
        <div className="grid md:grid-cols-2 gap-4">
          {["Piscina", "Spa & Sauna", "WiFi", "Restaurante", "Room Service"].map((s) => (
            <Card key={s}>{s}</Card>
          ))}
        </div>
      </Section>

      <Section title="Habitaciones">
        <div className="grid md:grid-cols-3 gap-4">
          {["Familiares", "Dobles", "Triples"].map((h) => (
            <Card key={h}>{h}</Card>
          ))}
        </div>
      </Section>

      <Section title="Información General">
        <Card>
          <p><strong>Ubicación:</strong> Mesitas del Colegio, Cundinamarca.</p>
          <p><strong>Contacto:</strong> +57 316 473 5903</p>
          <p><strong>Horario:</strong> 24/7</p>
          <p><strong>Correo:</strong> gerencia@hotelsantamariamesitas.com.</p>
        </Card>
      </Section>

      <Section title="Políticas">
        <Card>
          <ul className="list-disc ml-5">
            <li>No fumar dentro de las instalaciones</li>
            <li>Cancelación 24h</li>
            <li>Mascotas pequeñas permitidas</li>
          </ul>
        </Card>
      </Section>
    </div>
  );
}