/**
 * Tipos para Habitaciones y Servicios del Hotel.
 */

export interface Room {
  id: number;
  name: string;
  price: number;
}

export interface Service {
  id: number;
  name: string;
  price: number;
}

export interface HotelContextType {
  rooms: Room[];
  addRoom: (room: Room) => void;
  deleteRoom: (id: number) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  selectedServices: Service[];
  toggleService: (service: Service) => void;
}
