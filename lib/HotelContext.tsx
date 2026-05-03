"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { HotelContextType, Room, Service } from "@/types";

const HotelContext = createContext<HotelContextType>({} as HotelContextType);

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  const addRoom = (room: Room) => {
    setRooms(prev => [...prev, room]);
  };

  const deleteRoom = (id: number) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      if (prev.find(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  return (
    <HotelContext.Provider value={{
      rooms,
      addRoom,
      deleteRoom,
      services,
      setServices,
      selectedServices,
      toggleService
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = (): HotelContextType => useContext(HotelContext);