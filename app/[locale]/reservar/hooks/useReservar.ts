'use client';

import { useState, useMemo } from 'react';
import { MOCK_CLIENTES, PRECIOS_HABITACION } from '@/lib/mock-data';
import {
  storeCliente,
  storeReserva,
  findClienteByDocumento,
} from '@/lib/booking-store';
import type { TipoHabitacion, TipoDocumento } from '@/types';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export type AmenidadTipo = 'huespedes' | 'wifi' | 'ac' | 'balcon' | 'nespresso' | 'spa';

export interface HabitacionDisponible {
  id: string;
  nombre: string;
  descripcion: string;
  amenidades: { tipo: AmenidadTipo; label: string }[];
  capacidad: number;
  precioPorNoche: number;
  esMasPopular?: boolean;
  gradiente: string;
  imagen?: string;
  /** Número de habitación en el sistema administrativo */
  habitacionNumero: string;
  /** Tipo de habitación en el sistema administrativo */
  tipoHabitacion: TipoHabitacion;
}

export interface HuespedFormData {
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento | '';
  numeroDocumento: string;
  correo: string;
  telefono: string;
  nacionalidad: string;
  fechaNacimiento: string;
  observaciones: string;
}

export type HuespedErrors = Partial<Record<keyof HuespedFormData, string>>;

// ── Mock data de habitaciones disponibles ─────────────────────────────────────

const HABITACIONES_MOCK: HabitacionDisponible[] = [
  {
    id: 'suite-presidencial',
    nombre: 'Suite Presidencial',
    descripcion: 'Vista panorámica al jardín, Cama King Size, Sala de estar privada.',
    amenidades: [
      { tipo: 'huespedes', label: '2 Adultos' },
      { tipo: 'wifi', label: 'Wi-Fi Gratis' },
      { tipo: 'ac', label: 'Aire Acondicionado' },
    ],
    capacidad: 2,
    precioPorNoche: 450,
    esMasPopular: true,
    gradiente: 'from-amber-900 via-amber-800 to-yellow-950',
    imagen: '/images/rooms/room1.png',
    habitacionNumero: '301',
    tipoHabitacion: 'SUITE',
  },
  {
    id: 'deluxe-balcon-a',
    nombre: 'Habitación Deluxe Balcón',
    descripcion: 'Balcón privado con vista a la ciudad, Escritorio de trabajo, Minibar.',
    amenidades: [
      { tipo: 'huespedes', label: '2 Adultos' },
      { tipo: 'balcon', label: 'Balcón' },
      { tipo: 'nespresso', label: 'Máquina Nespresso' },
    ],
    capacidad: 2,
    precioPorNoche: 320,
    gradiente: 'from-stone-700 via-stone-600 to-stone-800',
    imagen: '/images/rooms/room2.png',
    habitacionNumero: '201',
    tipoHabitacion: 'DOBLE',
  },
  {
    id: 'deluxe-balcon-b',
    nombre: 'Habitación Deluxe Balcón',
    descripcion: 'Balcón privado con vista a la ciudad, Escritorio de trabajo, Minibar.',
    amenidades: [
      { tipo: 'huespedes', label: '2 Adultos' },
      { tipo: 'balcon', label: 'Balcón' },
      { tipo: 'nespresso', label: 'Máquina Nespresso' },
    ],
    capacidad: 2,
    precioPorNoche: 320,
    gradiente: 'from-neutral-700 via-neutral-600 to-neutral-800',
    imagen: '/images/rooms/room1.png',
    habitacionNumero: '203',
    tipoHabitacion: 'DOBLE',
  },
];

const TASA_IMPUESTO = 0.0928;

// ── Utilidades ────────────────────────────────────────────────────────────────

export function calcularNoches(entrada: string, salida: string): number {
  const ms = new Date(salida).getTime() - new Date(entrada).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function formatPrecio(valor: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(valor);
}

export function formatFechaCorta(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTodayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function generarIdReserva(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generarIdCliente(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function validarCorreo(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

const HUESPED_VACIO: HuespedFormData = {
  nombre: '',
  apellido: '',
  tipoDocumento: '',
  numeroDocumento: '',
  correo: '',
  telefono: '',
  nacionalidad: '',
  fechaNacimiento: '',
  observaciones: '',
};

// ── Hook principal ─────────────────────────────────────────────────────────────

/**
 * useReservar — hook del flujo de reserva para el cliente.
 *
 * @param initialEntrada - Fecha de entrada pre-llenada desde la home (URL param)
 * @param initialSalida  - Fecha de salida pre-llenada desde la home (URL param)
 * @param initialAdultos - Número de adultos pre-llenado desde la home (URL param)
 */
export function useReservar(
  initialEntrada = '',
  initialSalida = '',
  initialAdultos = 2,
) {
  const defaultEntrada = initialEntrada || getTodayISO(1);
  const defaultSalida = initialSalida || getTodayISO(3);

  const [paso, setPaso] = useState(1);
  const [habitacionId, setHabitacionId] = useState<string | null>(null);
  const [entrada, setEntrada] = useState(defaultEntrada);
  const [salida, setSalida] = useState(defaultSalida);
  const [adultos, setAdultos] = useState(initialAdultos);
  const [editandoFechas, setEditandoFechas] = useState(false);
  const [editandoHuespedes, setEditandoHuespedes] = useState(false);
  const [faqAbierto, setFaqAbierto] = useState(false);

  // ── Estado del paso 3: datos del huésped ──
  const [huespedData, setHuespedData] = useState<HuespedFormData>(HUESPED_VACIO);
  const [huespedErrors, setHuespedErrors] = useState<HuespedErrors>({});
  const [reservaConfirmadaId, setReservaConfirmadaId] = useState<string | null>(null);

  const noches = useMemo(() => calcularNoches(entrada, salida), [entrada, salida]);

  const habitacionSeleccionada =
    HABITACIONES_MOCK.find((h) => h.id === habitacionId) ?? null;

  const subtotal = habitacionSeleccionada
    ? habitacionSeleccionada.precioPorNoche * noches
    : 0;
  const impuestos = Math.round(subtotal * TASA_IMPUESTO * 100) / 100;
  const total = subtotal + impuestos;

  const porcentajePaso = Math.round((paso / 3) * 100);
  const puedeSeguir = Boolean(habitacionId);

  // Validez del formulario de huésped (para habilitar botón confirmar)
  const huespedValido =
    Boolean(huespedData.nombre.trim()) &&
    Boolean(huespedData.apellido.trim()) &&
    Boolean(huespedData.tipoDocumento) &&
    Boolean(huespedData.numeroDocumento.trim()) &&
    Boolean(huespedData.correo.trim()) &&
    validarCorreo(huespedData.correo) &&
    Boolean(huespedData.telefono.trim()) &&
    Boolean(huespedData.nacionalidad.trim()) &&
    Boolean(huespedData.fechaNacimiento);

  function seleccionarHabitacion(id: string) {
    setHabitacionId((prev) => (prev === id ? null : id));
  }

  function siguientePaso() {
    if (puedeSeguir && paso < 3) setPaso((p) => p + 1);
  }

  function volverPaso() {
    if (paso > 1) setPaso((p) => p - 1);
  }

  function actualizarHuesped<K extends keyof HuespedFormData>(
    campo: K,
    valor: HuespedFormData[K],
  ) {
    setHuespedData((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar error del campo modificado
    if (huespedErrors[campo]) {
      setHuespedErrors((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  /**
   * Valida el formulario de huésped.
   * Retorna true si es válido, false si hay errores (y los muestra).
   */
  function validarHuesped(): boolean {
    const errors: HuespedErrors = {};
    if (!huespedData.nombre.trim()) errors.nombre = 'nombreRequerido';
    if (!huespedData.apellido.trim()) errors.apellido = 'apellidoRequerido';
    if (!huespedData.tipoDocumento) errors.tipoDocumento = 'tipoDocumentoRequerido';
    if (!huespedData.numeroDocumento.trim()) errors.numeroDocumento = 'numeroDocumentoRequerido';
    if (!huespedData.correo.trim()) {
      errors.correo = 'correoRequerido';
    } else if (!validarCorreo(huespedData.correo)) {
      errors.correo = 'correoInvalido';
    }
    if (!huespedData.telefono.trim()) errors.telefono = 'telefonoRequerido';
    if (!huespedData.nacionalidad.trim()) errors.nacionalidad = 'nacionalidadRequerida';
    if (!huespedData.fechaNacimiento) errors.fechaNacimiento = 'fechaNacimientoRequerida';

    setHuespedErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Confirma la reserva: crea/reutiliza el cliente y persiste la reserva.
   * Llama a confirmarReserva cuando el usuario presiona "Confirmar reserva" en paso 3.
   */
  function confirmarReserva(): { ok: boolean; error?: string } {
    if (!habitacionSeleccionada) return { ok: false, error: 'sinHabitacion' };
    if (!validarHuesped()) return { ok: false, error: 'formularioInvalido' };

    // Buscar si el cliente ya existe por documento
    let clienteId: string;
    const clienteExistente = findClienteByDocumento(
      huespedData.numeroDocumento,
      MOCK_CLIENTES,
    );

    if (clienteExistente) {
      clienteId = clienteExistente.id;
    } else {
      // Crear nuevo cliente
      const nuevoCliente = {
        id: generarIdCliente(),
        nombre: huespedData.nombre.trim(),
        apellido: huespedData.apellido.trim(),
        tipoDocumento: huespedData.tipoDocumento as TipoDocumento,
        numeroDocumento: huespedData.numeroDocumento.trim(),
        correo: huespedData.correo.trim(),
        telefono: huespedData.telefono.trim(),
        nacionalidad: huespedData.nacionalidad.trim(),
        fechaNacimiento: huespedData.fechaNacimiento,
        estado: 'activo' as const,
        creadoEn: new Date().toISOString(),
      };
      storeCliente(nuevoCliente);
      clienteId = nuevoCliente.id;
    }

    // Calcular total en COP usando los precios del sistema administrativo
    const precioNocheCOP = PRECIOS_HABITACION[habitacionSeleccionada.tipoHabitacion] ?? 0;
    const totalCOP = precioNocheCOP * noches;

    const nuevaReserva = {
      id: generarIdReserva(),
      clienteId,
      habitacionNumero: habitacionSeleccionada.habitacionNumero,
      tipoHabitacion: habitacionSeleccionada.tipoHabitacion,
      fechaEntrada: entrada,
      fechaSalida: salida,
      numeroHuespedes: adultos,
      estado: 'pendiente' as const,
      total: totalCOP,
      observaciones: huespedData.observaciones.trim() || undefined,
      creadoEn: new Date().toISOString(),
    };

    storeReserva(nuevaReserva);
    setReservaConfirmadaId(nuevaReserva.id);
    return { ok: true };
  }

  return {
    // Stepper
    paso,
    porcentajePaso,
    puedeSeguir,
    siguientePaso,
    volverPaso,
    // Habitaciones
    habitaciones: HABITACIONES_MOCK,
    habitacionId,
    habitacionSeleccionada,
    seleccionarHabitacion,
    // Estancia
    entrada,
    salida,
    setEntrada,
    setSalida,
    adultos,
    setAdultos,
    editandoFechas,
    setEditandoFechas,
    editandoHuespedes,
    setEditandoHuespedes,
    // Financiero
    noches,
    subtotal,
    impuestos,
    total,
    // UI
    faqAbierto,
    setFaqAbierto,
    // Paso 3 — huésped
    huespedData,
    huespedErrors,
    huespedValido,
    actualizarHuesped,
    confirmarReserva,
    reservaConfirmadaId,
  };
}
