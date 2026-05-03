"use client";

"use client";

import RoomCard from "@/components/ui/hotel/RoomCard";

export default function RoomsPage() {
  const rooms = [
    {
      id: 1,
      name: "Habitación Doble",
      price: 120,
      description:
        "Ideal para parejas o dos personas, con un ambiente cómodo y acogedor.",
    },
    {
      id: 2,
      name: "Habitación Triple",
      price: 180,
      description:
        "Perfecta para pequeños grupos o familias, con mayor capacidad y comodidad.",
    },
    {
      id: 3,
      name: "Habitación Familiar",
      price: 250,
      description:
        "Espacio amplio diseñado para familias, garantizando confort y tranquilidad.",
    },
  ];

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Habitaciones</h1>
      <p className="text-gray-600 mb-8">
        Contamos con diferentes tipos de habitaciones adaptadas a las necesidades
        de cada huésped, ofreciendo comodidad, tranquilidad y un ambiente familiar.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            title={room.name}
            description={`${room.description} - $${room.price} COP por noche`}
          />
        ))}
      </div>
    </div>
  );
}