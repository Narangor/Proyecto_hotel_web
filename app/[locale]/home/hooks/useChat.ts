'use client';

import { useState, useRef, useEffect } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// ── Respuestas predeterminadas del asistente ───────────────────────────────────

const RESPUESTAS_MOCK: { keywords: string[]; respuesta: string }[] = [
  {
    keywords: ['precio', 'costo', 'cuanto', 'cuánto', 'tarifa', 'valor'],
    respuesta:
      'Nuestras tarifas varían según el tipo de habitación: Suite Presidencial desde $450/noche, Habitación Deluxe desde $320/noche. Puede ver disponibilidad y precios exactos en nuestra página de reservas.',
  },
  {
    keywords: ['habitacion', 'habitación', 'cuarto', 'suite', 'room'],
    respuesta:
      'Contamos con Suite Presidencial (vista panorámica, cama King Size), Habitación Deluxe Balcón (balcón privado, máquina Nespresso) y más opciones. Todas incluyen Wi-Fi gratuito y aire acondicionado.',
  },
  {
    keywords: ['checkin', 'check-in', 'check in', 'llegada', 'entrada'],
    respuesta:
      'El check-in está disponible a partir de las 3:00 PM. Si llega antes, con gusto guardamos su equipaje mientras su habitación queda lista.',
  },
  {
    keywords: ['checkout', 'check-out', 'check out', 'salida'],
    respuesta:
      'El check-out es hasta las 12:00 PM del mediodía. Si necesita un late check-out, consulte disponibilidad con nuestro equipo de recepción.',
  },
  {
    keywords: ['spa', 'masaje', 'bienestar', 'relax', 'tratamiento'],
    respuesta:
      'Nuestro Spa & Bienestar ofrece tratamientos exclusivos de relajación, masajes y terapias corporales en un ambiente de serenidad. Puede reservar su sesión en recepción.',
  },
  {
    keywords: ['restaurante', 'comida', 'gastronomia', 'gastronomía', 'cena', 'desayuno', 'menu', 'menú'],
    respuesta:
      'Nuestro restaurante de alta gastronomía ofrece sabores de autor con productos locales. Servimos desayuno (7–11 AM), almuerzo (12–3 PM) y cena (7–10 PM). Las reservas están disponibles en recepción o por teléfono.',
  },
  {
    keywords: ['tour', 'excursion', 'excursión', 'visita', 'ciudad'],
    respuesta:
      'Ofrecemos tours curados por la ciudad con guías expertos. Desde recorridos culturales hasta experiencias gastronómicas. Puede agendar su tour en el módulo de Tours de nuestra plataforma.',
  },
  {
    keywords: ['paquete', 'oferta', 'promocion', 'promoción', 'descuento'],
    respuesta:
      'Tenemos paquetes especiales que incluyen alojamiento, spa y gastronomía con tarifas preferenciales. Consulte nuestros paquetes promocionales para encontrar la mejor opción para usted.',
  },
  {
    keywords: ['cancelar', 'cancelacion', 'cancelación', 'reembolso'],
    respuesta:
      'Puede cancelar su reserva sin cargo hasta 48 horas antes del check-in. Para cancelaciones con menor anticipación, aplican cargos según nuestra política. ¿Desea más detalles?',
  },
  {
    keywords: ['wifi', 'internet', 'conexion', 'conexión'],
    respuesta:
      'Ofrecemos Wi-Fi de alta velocidad gratuito en todas nuestras habitaciones y áreas comunes. La contraseña se entrega al momento del check-in.',
  },
  {
    keywords: ['estacionamiento', 'parking', 'carro', 'auto', 'vehículo'],
    respuesta:
      'Contamos con estacionamiento privado para huéspedes. El servicio de valet está disponible las 24 horas. Consulte la tarifa vigente en recepción.',
  },
  {
    keywords: ['mascota', 'perro', 'gato', 'animal'],
    respuesta:
      'Lamentablemente, por políticas del hotel, no aceptamos mascotas en las instalaciones. Si tiene alguna necesidad especial, por favor contáctenos directamente.',
  },
  {
    keywords: ['hola', 'buenos', 'buenas', 'saludos', 'hi', 'hello'],
    respuesta:
      '¡Hola! Bienvenido al Hotel Santa María. Estoy aquí para ayudarle con información sobre habitaciones, servicios, reservas o cualquier consulta sobre su estadía. ¿En qué le puedo ayudar?',
  },
  {
    keywords: ['gracias', 'thank', 'perfecto', 'excelente', 'genial'],
    respuesta:
      '¡Con mucho gusto! Para nosotros es un placer servirle. Si tiene alguna otra consulta, no dude en preguntar. Le esperamos en el Hotel Santa María. 🌟',
  },
  {
    keywords: ['reservar', 'reserva', 'booking', 'book'],
    respuesta:
      'Para hacer una reserva, puede usar nuestro formulario en línea haciendo clic en "Reservar ahora", o llamarnos al +52 55 1234 5678. Le recomendamos reservar con anticipación para garantizar disponibilidad.',
  },
  {
    keywords: ['contacto', 'telefono', 'teléfono', 'llamar', 'email', 'correo'],
    respuesta:
      'Puede contactarnos por teléfono al +52 55 1234 5678, por correo a reservas@santamariahotel.com, o visitar nuestra recepción que atiende las 24 horas.',
  },
];

const RESPUESTA_DEFAULT =
  'Gracias por su consulta. Para brindarle la mejor atención, le recomendamos contactar directamente a nuestra recepción al +52 55 1234 5678 o por correo a reservas@santamariahotel.com. ¿Hay algo más en lo que pueda ayudarle?';

const MENSAJE_BIENVENIDA: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: '¡Bienvenido al Hotel Santa María! 🌟 Soy su asistente virtual. Puedo ayudarle con información sobre habitaciones, reservas, servicios, check-in/out, spa, restaurante y tours. ¿En qué le puedo ayudar hoy?',
};

// ── Lógica de selección de respuesta ─────────────────────────────────────────

function seleccionarRespuesta(input: string): string {
  const normalizado = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const { keywords, respuesta } of RESPUESTAS_MOCK) {
    if (keywords.some((kw) => normalizado.includes(kw))) {
      return respuesta;
    }
  }
  return RESPUESTA_DEFAULT;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useChat — estado del asistente virtual del hotel.
 *
 * @param delayMs  Tiempo de espera simulado en ms (inyectable para tests)
 * @param timer    Función de temporización (inyectable para tests)
 */
export function useChat(
  delayMs = 1200,
  timer: (fn: () => void, ms: number) => ReturnType<typeof setTimeout> = setTimeout,
) {
  const [abierto, setAbierto] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([MENSAJE_BIENVENIDA]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpia el timer si el componente se desmonta mientras esperaba respuesta
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function abrirChat() {
    setAbierto(true);
  }

  function cerrarChat() {
    setAbierto(false);
  }

  function enviarMensaje() {
    const texto = inputValue.trim();
    if (!texto || isLoading) return;

    const mensajeUsuario: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: texto,
    };

    setMessages((prev) => [...prev, mensajeUsuario]);
    setInputValue('');
    setIsLoading(true);

    timerRef.current = timer(() => {
      const respuesta = seleccionarRespuesta(texto);
      const mensajeAsistente: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: respuesta,
      };
      setMessages((prev) => [...prev, mensajeAsistente]);
      setIsLoading(false);
    }, delayMs);
  }

  return {
    abierto,
    abrirChat,
    cerrarChat,
    messages,
    inputValue,
    setInputValue,
    isLoading,
    enviarMensaje,
  };
}
