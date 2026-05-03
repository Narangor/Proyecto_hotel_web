"use client";

import Image from "next/image";
import { Clock, Users } from "lucide-react";
import type { TourCatalogo } from "@/types";

interface TourCatalogCardProps {
  tour: TourCatalogo;
  bookingsCount: number;
}

// Placeholder images for tours - user will replace with real URLs
const TOUR_IMAGES: Record<string, string> = {
  "tour-001": "https://placehold.co/600x400/A67C52/FFFFFF?text=Historic+Center",
  "tour-002": "https://placehold.co/600x400/8B6F47/FFFFFF?text=Monserrate",
  "tour-003": "https://placehold.co/600x400/6B5440/FFFFFF?text=Night+Tour",
};

export function TourCatalogCard({ tour, bookingsCount }: TourCatalogCardProps) {
  const imageUrl =
    TOUR_IMAGES[tour.id] ||
    "https://placehold.co/600x400/A67C52/FFFFFF?text=Tour";

  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={tour.nombre}
          width={600}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-brown-900/60 to-transparent" />

        {bookingsCount > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
            {bookingsCount} {bookingsCount === 1 ? "booking" : "bookings"}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-brown-900 mb-2">
          {tour.nombre}
        </h3>

        <p className="text-sm text-brown-600 mb-4 line-clamp-2">
          {tour.descripcion}
        </p>

        <div className="flex items-center gap-4 text-sm text-brown-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{tour.duracionHoras}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>{bookingsCount} scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
