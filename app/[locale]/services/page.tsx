"use client";

import ServiceCard from "@/components/ui/hotel/ServiceCard";

export default function ServicesPage() {
  const services = [
    {
      title: "Piscina",
      description:
        "Disfruta de nuestra piscina en un ambiente tranquilo, ideal para el descanso y la recreación familiar.",
    },
    {
      title: "Sauna",
      description:
        "Espacio diseñado para la relajación total, perfecto para liberar estrés y descansar.",
    },
    {
      title: "WiFi de alta velocidad",
      description:
        "Conectividad disponible en todo el hotel para trabajo remoto o entretenimiento.",
    },
    {
      title: "Parqueadero",
      description:
        "Disponibilidad de parqueadero cercano para mayor comodidad de nuestros huéspedes.",
    },
    {
      title: "Desayuno",
      description:
        "Servicio de desayuno disponible para complementar tu estadía con una experiencia completa.",
    },
    {
      title: "Lavandería",
      description:
        "Servicio práctico para estancias largas o necesidades durante el viaje.",
    },
    {
      title: "Tienda interna",
      description:
        "Venta de bebidas, snacks y artículos de uso personal disponibles durante tu estadía.",
    },
  ];

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Servicios del Hotel</h1>
      <p className="text-gray-600 mb-8">
        En el Hotel Santa María ofrecemos servicios diseñados para brindar
        comodidad, descanso y una experiencia completa durante tu estadía.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            title={service.title}
            description={service.description}
          />
        ))}
      </div>
    </div>
  );
}