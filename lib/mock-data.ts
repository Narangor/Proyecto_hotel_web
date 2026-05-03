/**
 * Datos de prueba para desarrollo y tests unitarios.
 *
 * IMPORTANTE: Este archivo NO se conecta a ninguna API ni base de datos.
 * Su propósito es:
 *   1. Permitir desarrollo UI sin backend.
 *   2. Proveer fixtures consistentes para los tests unitarios.
 *
 * En Ciclo 2, los hooks reemplazarán estas llamadas por fetch() a la API real.
 * Las funciones de los hooks ya están diseñadas para ese reemplazo (misma firma).
 */

import type {
  Cliente,
  Reserva,
  Checkin,
  Pago,
  Pqrs,
  Solicitud,
  Inscripcion,
  PaquetePromocional,
  TourCatalogo,
  AgendamientoTour,
} from "@/types";

// ─────────────────────────────────────────────
// CLIENTES
// ─────────────────────────────────────────────

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: "c-001",
    nombre: "Valentina",
    apellido: "Gómez",
    tipoDocumento: "CC",
    numeroDocumento: "1020345678",
    correo: "valentina.gomez@email.com",
    telefono: "+57 310 234 5678",
    nacionalidad: "Colombiana",
    fechaNacimiento: "1992-04-15",
    estado: "activo",
    creadoEn: "2025-01-10T09:00:00.000Z",
  },
  {
    id: "c-002",
    nombre: "James",
    apellido: "Carter",
    tipoDocumento: "PASAPORTE",
    numeroDocumento: "A1234567",
    correo: "james.carter@email.com",
    telefono: "+1 555 987 6543",
    nacionalidad: "Estadounidense",
    fechaNacimiento: "1985-11-30",
    estado: "activo",
    creadoEn: "2025-02-03T14:30:00.000Z",
  },
  {
    id: "c-003",
    nombre: "Sofía",
    apellido: "Martínez",
    tipoDocumento: "CC",
    numeroDocumento: "1098765432",
    correo: "sofia.martinez@email.com",
    telefono: "+57 315 876 5432",
    nacionalidad: "Colombiana",
    fechaNacimiento: "1998-07-22",
    estado: "activo",
    creadoEn: "2025-02-14T11:00:00.000Z",
  },
  {
    id: "c-004",
    nombre: "Luca",
    apellido: "Rossi",
    tipoDocumento: "PASAPORTE",
    numeroDocumento: "YA9876543",
    correo: "luca.rossi@email.com",
    telefono: "+39 02 1234 5678",
    nacionalidad: "Italiana",
    fechaNacimiento: "1979-03-05",
    estado: "inactivo",
    creadoEn: "2025-01-20T16:45:00.000Z",
  },
  {
    id: "c-005",
    nombre: "Daniela",
    apellido: "Peña",
    tipoDocumento: "CC",
    numeroDocumento: "52456789",
    correo: "daniela.pena@email.com",
    telefono: "+57 300 123 4567",
    nacionalidad: "Colombiana",
    fechaNacimiento: "1990-09-18",
    estado: "activo",
    creadoEn: "2025-03-01T08:15:00.000Z",
  },
  {
    id: "c-006",
    nombre: "Daniela",
    apellido: "Castro",
    tipoDocumento: "CC",
    numeroDocumento: "102279468",
    correo: "daniela.castro@email.com",
    telefono: "+57 319 579 5258",
    nacionalidad: "Colombiana",
    fechaNacimiento: "2000-01-19",
    estado: "activo",
    creadoEn: "2025-01-10T09:00:00.000Z",
  },
  {
    id: "c-007",
    nombre: "María",
    apellido: "Castillo",
    tipoDocumento: "CC",
    numeroDocumento: "102279469",
    correo: "maria.castillo@email.com",
    telefono: "+57 311 712 7415",
    nacionalidad: "Colombiana",
    fechaNacimiento: "1998-06-28",
    estado: "activo",
    creadoEn: "2025-01-10T09:00:00.000Z",
  },
  {
    id: "c-008",
    nombre: "Jorge",
    apellido: "Morales",
    tipoDocumento: "CC",
    numeroDocumento: "103579471",
    correo: "jorge.morales@email.com",
    telefono: "+57 312 579 6789",
    nacionalidad: "Colombiano",
    fechaNacimiento: "2001-03-21",
    estado: "activo",
    creadoEn: "2025-01-10T09:00:00.000Z",
  },
];

// ─────────────────────────────────────────────
// RESERVAS
// ─────────────────────────────────────────────

export const MOCK_RESERVAS: Reserva[] = [
  {
    id: "r-001",
    clienteId: "c-001",
    habitacionNumero: "201",
    tipoHabitacion: "DOBLE",
    fechaEntrada: "2026-03-21",
    fechaSalida: "2026-03-24",
    numeroHuespedes: 2,
    estado: "confirmada",
    total: 450000,
    observaciones: "Solicita cama king",
    creadoEn: "2026-03-10T10:00:00.000Z",
  },
  {
    id: "r-002",
    clienteId: "c-002",
    habitacionNumero: "305",
    tipoHabitacion: "SUITE",
    fechaEntrada: "2026-03-21",
    fechaSalida: "2026-03-28",
    numeroHuespedes: 1,
    estado: "en_curso",
    total: 1750000,
    creadoEn: "2026-03-05T15:30:00.000Z",
  },
  {
    id: "r-003",
    clienteId: "c-003",
    habitacionNumero: "102",
    tipoHabitacion: "SENCILLA",
    fechaEntrada: "2026-03-25",
    fechaSalida: "2026-03-27",
    numeroHuespedes: 1,
    estado: "pendiente",
    total: 200000,
    creadoEn: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "r-004",
    clienteId: "c-005",
    habitacionNumero: "401",
    tipoHabitacion: "FAMILIAR",
    fechaEntrada: "2026-03-10",
    fechaSalida: "2026-03-15",
    numeroHuespedes: 4,
    estado: "completada",
    total: 1000000,
    creadoEn: "2026-03-01T12:00:00.000Z",
  },
  {
    id: "r-005",
    clienteId: "c-001",
    habitacionNumero: "108",
    tipoHabitacion: "SENCILLA",
    fechaEntrada: "2026-02-20",
    fechaSalida: "2026-02-22",
    numeroHuespedes: 1,
    estado: "cancelada",
    total: 200000,
    motivoCancelacion: "Cambio de planes del cliente",
    creadoEn: "2026-02-10T11:00:00.000Z",
  },
];

// ─────────────────────────────────────────────
// CHECK-INS
// ─────────────────────────────────────────────

export const MOCK_CHECKINS: Checkin[] = [
  {
    id: "k-001",
    reservaId: "r-001",
    clienteId: "c-001",
    habitacionNumero: "201",
    fechaHoraCheckin: null,
    fechaEsperadaCheckout: "2026-03-24",
    numeroAcompanantes: 1,
    estado: "pendiente",
  },
  {
    id: "k-002",
    reservaId: "r-002",
    clienteId: "c-002",
    habitacionNumero: "305",
    fechaHoraCheckin: "2026-03-21T14:35:00.000Z",
    fechaEsperadaCheckout: "2026-03-28",
    numeroAcompanantes: 0,
    estado: "completado",
    observaciones: "Huésped frecuente — trato VIP",
  },
  {
    id: "k-003",
    reservaId: "r-004",
    clienteId: "c-005",
    habitacionNumero: "401",
    fechaHoraCheckin: "2026-03-10T13:00:00.000Z",
    fechaEsperadaCheckout: "2026-03-15",
    numeroAcompanantes: 3,
    estado: "anulado",
    observaciones: "",
    motivoAnulacion:
      "Error de registro — el huésped ingresó por otra recepción",
    fechaAnulacion: "2026-03-10T13:45:00.000Z",
  },
];

// ─────────────────────────────────────────────
// PRECIOS POR TIPO DE HABITACIÓN (COP/noche)
// ─────────────────────────────────────────────

export const PRECIOS_HABITACION: Record<string, number> = {
  SENCILLA: 100000,
  DOBLE: 150000,
  SUITE: 250000,
  FAMILIAR: 200000,
};

// ─────────────────────────────────────────────
// HABITACIONES DISPONIBLES
// ─────────────────────────────────────────────

export interface Habitacion {
  numero: string;
  tipo: string;
  piso: number;
}

export const HABITACIONES: Habitacion[] = [
  { numero: "101", tipo: "SENCILLA", piso: 1 },
  { numero: "102", tipo: "SENCILLA", piso: 1 },
  { numero: "103", tipo: "SENCILLA", piso: 1 },
  { numero: "201", tipo: "DOBLE", piso: 2 },
  { numero: "202", tipo: "DOBLE", piso: 2 },
  { numero: "203", tipo: "DOBLE", piso: 2 },
  { numero: "301", tipo: "SUITE", piso: 3 },
  { numero: "305", tipo: "SUITE", piso: 3 },
  { numero: "401", tipo: "FAMILIAR", piso: 4 },
  { numero: "402", tipo: "FAMILIAR", piso: 4 },
];

// ─────────────────────────────────────────────
// PAGOS
// ─────────────────────────────────────────────

export const MOCK_PAGOS: Pago[] = [
  {
    id: "p-001",
    reservaId: "r-001",
    monto: 450000,
    fecha: "2026-03-10",
    metodoPago: "TARJETA_CREDITO",
    estado: "completado",
    referencia: "VISA-****1234",
    creadoEn: "2026-03-10T10:15:00.000Z",
  },
  {
    id: "p-002",
    reservaId: "r-002",
    monto: 1750000,
    fecha: "2026-03-21",
    metodoPago: "TRANSFERENCIA",
    estado: "completado",
    referencia: "TRANS-20260321-7891",
    observaciones: "Transferencia desde cuenta empresarial",
    creadoEn: "2026-03-21T14:30:00.000Z",
  },
  {
    id: "p-003",
    reservaId: "r-003",
    monto: 200000,
    fecha: "2026-03-15",
    metodoPago: "PSE",
    estado: "pendiente",
    referencia: "PSE-789456123",
    creadoEn: "2026-03-15T09:20:00.000Z",
  },
  {
    id: "p-004",
    reservaId: "r-004",
    monto: 1000000,
    fecha: "2026-03-10",
    metodoPago: "EFECTIVO",
    estado: "completado",
    creadoEn: "2026-03-10T13:00:00.000Z",
  },
  {
    id: "p-005",
    reservaId: "r-005",
    monto: 200000,
    fecha: "2026-02-10",
    metodoPago: "TARJETA_DEBITO",
    estado: "reembolsado",
    referencia: "MAST-****5678",
    observaciones: "Reembolso por cancelación de reserva",
    creadoEn: "2026-02-10T11:30:00.000Z",
  },
  {
    id: "p-006",
    reservaId: "r-001",
    monto: 50000,
    fecha: "2026-03-12",
    metodoPago: "EFECTIVO",
    estado: "anulado",
    motivoAnulacion: "Pago duplicado, se corrigió en sistema",
    creadoEn: "2026-03-12T16:00:00.000Z",
  },
];

// ─────────────────────────────────────────────
// PQRS (Peticiones, Quejas, Reclamos, Sugerencias)
// ─────────────────────────────────────────────

export const MOCK_PQRS: Pqrs[] = [
  {
    id: "pqrs-001",
    tipo: "queja",
    asunto: "Ruido excesivo en la habitación 301",
    descripcion:
      "Durante la noche del 20 de marzo hubo ruido excesivo proveniente de la habitación contigua. No pude descansar adecuadamente.",
    clienteId: "c-001",
    habitacionNumero: "201",
    reservaId: "r-001",
    prioridad: "media",
    estado: "resuelto",
    fechaCreacion: "2026-03-21",
    fechaLimite: "2026-03-23",
    asignadoA: "Juan Pérez",
    respuesta:
      "Se habló con los huéspedes de la habitación 301 y se tomaron las medidas correspondientes. Como compensación se ofrece upgrade de habitación.",
    creadoEn: "2026-03-21T08:30:00.000Z",
    actualizadoEn: "2026-03-21T14:20:00.000Z",
    fechaCierre: "2026-03-21T14:20:00.000Z",
  },
  {
    id: "pqrs-002",
    tipo: "peticion",
    asunto: "Solicitud de cuna para bebé",
    descripcion:
      "Requiero una cuna adicional para mi bebé de 8 meses. Llegamos mañana en la tarde.",
    clienteId: "c-002",
    habitacionNumero: "305",
    reservaId: "r-002",
    prioridad: "alta",
    estado: "en_proceso",
    fechaCreacion: "2026-03-20",
    fechaLimite: "2026-03-22",
    asignadoA: "María González",
    creadoEn: "2026-03-20T16:45:00.000Z",
    actualizadoEn: "2026-03-21T09:00:00.000Z",
  },
  {
    id: "pqrs-003",
    tipo: "sugerencia",
    asunto: "Ampliar horario del servicio de desayuno",
    descripcion:
      "Sería excelente que el horario del desayuno se extendiera hasta las 11:00 AM los fines de semana, especialmente para huéspedes que viajan por placer.",
    clienteId: "c-003",
    prioridad: "baja",
    estado: "pendiente",
    fechaCreacion: "2026-03-19",
    creadoEn: "2026-03-19T12:30:00.000Z",
  },
  {
    id: "pqrs-004",
    tipo: "reclamo",
    asunto: "Cobro incorrecto en la cuenta",
    descripcion:
      "Se me cobró dos veces el servicio de lavandería. Adjunto los comprobantes de pago. Solicito reembolso inmediato.",
    clienteId: "c-005",
    habitacionNumero: "410",
    reservaId: "r-005",
    prioridad: "urgente",
    estado: "en_proceso",
    fechaCreacion: "2026-03-21",
    fechaLimite: "2026-03-22",
    asignadoA: "Carlos Ramírez",
    creadoEn: "2026-03-21T10:15:00.000Z",
    actualizadoEn: "2026-03-21T11:00:00.000Z",
  },
  {
    id: "pqrs-005",
    tipo: "queja",
    asunto: "Aire acondicionado no funciona",
    descripcion:
      "El aire acondicionado de la habitación 202 no está funcionando. La temperatura es muy alta y es incómodo.",
    clienteId: "c-001",
    habitacionNumero: "202",
    prioridad: "alta",
    estado: "resuelto",
    fechaCreacion: "2026-03-15",
    fechaLimite: "2026-03-16",
    asignadoA: "Pedro Sánchez",
    respuesta:
      "Se envió personal de mantenimiento y se reparó el aire acondicionado. Sistema funcionando correctamente.",
    creadoEn: "2026-03-15T14:20:00.000Z",
    actualizadoEn: "2026-03-15T18:30:00.000Z",
    fechaCierre: "2026-03-15T18:30:00.000Z",
  },
  {
    id: "pqrs-006",
    tipo: "peticion",
    asunto: "Reserva de sala de conferencias",
    descripcion:
      "Necesito reservar la sala de conferencias para una reunión empresarial el día 25 de marzo de 9:00 AM a 12:00 PM. Requiero proyector y conexión WiFi.",
    prioridad: "media",
    estado: "pendiente",
    fechaCreacion: "2026-03-21",
    fechaLimite: "2026-03-24",
    creadoEn: "2026-03-21T09:00:00.000Z",
  },
  {
    id: "pqrs-007",
    tipo: "sugerencia",
    asunto: "Menú vegetariano en el restaurante",
    descripcion:
      "Me gustaría sugerir incluir más opciones vegetarianas y veganas en el menú del restaurante. Actualmente las opciones son limitadas.",
    clienteId: "c-004",
    prioridad: "baja",
    estado: "cerrado",
    fechaCreacion: "2026-02-28",
    asignadoA: "Ana Torres",
    respuesta:
      "Agradecemos la sugerencia. El nuevo menú con opciones vegetarianas y veganas estará disponible a partir del 1 de abril.",
    creadoEn: "2026-02-28T11:45:00.000Z",
    actualizadoEn: "2026-03-10T16:00:00.000Z",
    fechaCierre: "2026-03-10T16:00:00.000Z",
  },
  {
    id: "pqrs-008",
    tipo: "reclamo",
    asunto: "Toallas sucias en la habitación",
    descripcion:
      "Al ingresar a la habitación 501, las toallas no estaban limpias. Esto es inaceptable para un hotel de esta categoría.",
    clienteId: "c-002",
    habitacionNumero: "501",
    reservaId: "r-002",
    prioridad: "urgente",
    estado: "resuelto",
    fechaCreacion: "2026-03-18",
    fechaLimite: "2026-03-18",
    asignadoA: "Laura Méndez",
    respuesta:
      "Se cambiaron inmediatamente todas las toallas y se realizó limpieza profunda de la habitación. Se ofreció descuento del 10% como compensación.",
    creadoEn: "2026-03-18T15:30:00.000Z",
    actualizadoEn: "2026-03-18T16:15:00.000Z",
    fechaCierre: "2026-03-18T16:15:00.000Z",
  },
];

// ─────────────────────────────────────────────
// SOLICITUDES (ROOM SERVICE REQUESTS)
// ─────────────────────────────────────────────

export const MOCK_SOLICITUDES: Solicitud[] = [
  {
    id: "sol-001",
    reservaId: "r-001",
    tipo: "limpieza",
    descripcion: "Limpieza profunda de habitación, cambio de toallas y sábanas",
    habitacionNumero: "101",
    prioridad: "media",
    estado: "completada",
    empleadoAsignado: "María González",
    fechaSolicitud: "2026-03-20T10:30:00.000Z",
    fechaCompletada: "2026-03-20T11:45:00.000Z",
    notas: "Servicio completado sin problemas",
    creadoEn: "2026-03-20T10:30:00.000Z",
  },
  {
    id: "sol-002",
    reservaId: "r-002",
    tipo: "comida",
    descripcion: "Desayuno continental para dos personas - Habitación 205",
    habitacionNumero: "205",
    prioridad: "alta",
    estado: "en_proceso",
    empleadoAsignado: "Carlos Ramírez",
    fechaSolicitud: "2026-03-21T07:15:00.000Z",
    notas: "Cliente solicitó sin gluten. En preparación en cocina.",
    creadoEn: "2026-03-21T07:15:00.000Z",
  },
  {
    id: "sol-003",
    reservaId: "r-001",
    tipo: "amenidades",
    descripcion:
      "Kit de amenidades adicional (champú, acondicionador, gel de baño)",
    habitacionNumero: "101",
    prioridad: "baja",
    estado: "pendiente",
    fechaSolicitud: "2026-03-21T14:20:00.000Z",
    creadoEn: "2026-03-21T14:20:00.000Z",
  },
  {
    id: "sol-004",
    reservaId: "r-003",
    tipo: "mantenimiento",
    descripcion: "Reparación de aire acondicionado - No enfría correctamente",
    habitacionNumero: "303",
    prioridad: "urgente",
    estado: "en_proceso",
    empleadoAsignado: "Jorge Téllez",
    fechaSolicitud: "2026-03-21T09:00:00.000Z",
    notas:
      "Técnico en camino. Se ofreció cambio de habitación temporal al cliente.",
    creadoEn: "2026-03-21T09:00:00.000Z",
  },
  {
    id: "sol-005",
    reservaId: "r-004",
    tipo: "bebidas",
    descripcion: "Botella de vino tinto y dos copas para cena romántica",
    habitacionNumero: "Suite 401",
    prioridad: "media",
    estado: "completada",
    empleadoAsignado: "Ana Morales",
    fechaSolicitud: "2026-03-20T18:30:00.000Z",
    fechaCompletada: "2026-03-20T19:00:00.000Z",
    notas: "Entregado con tarjeta de cortesía",
    creadoEn: "2026-03-20T18:30:00.000Z",
  },
  {
    id: "sol-006",
    reservaId: "r-002",
    tipo: "lavanderia",
    descripcion: "Servicio de lavandería express - 3 camisas y 2 pantalones",
    habitacionNumero: "205",
    prioridad: "alta",
    estado: "en_proceso",
    empleadoAsignado: "Patricia Sánchez",
    fechaSolicitud: "2026-03-21T08:45:00.000Z",
    notas: "Cliente necesita para evento en la tarde. Priorizar.",
    creadoEn: "2026-03-21T08:45:00.000Z",
  },
  {
    id: "sol-007",
    reservaId: "r-005",
    tipo: "transporte",
    descripcion: "Taxi al aeropuerto El Dorado - Salida 14:00",
    habitacionNumero: "102",
    prioridad: "media",
    estado: "cancelada",
    motivoCancelacion: "Cliente cambió planes y extendió estadía",
    fechaSolicitud: "2026-03-19T10:00:00.000Z",
    creadoEn: "2026-03-19T10:00:00.000Z",
  },
  {
    id: "sol-008",
    reservaId: "r-001",
    tipo: "comida",
    descripcion: "Cena ligera a la habitación - Ensalada César y jugo natural",
    habitacionNumero: "101",
    prioridad: "media",
    estado: "completada",
    empleadoAsignado: "Carlos Ramírez",
    fechaSolicitud: "2026-03-21T19:30:00.000Z",
    fechaCompletada: "2026-03-21T20:15:00.000Z",
    creadoEn: "2026-03-21T19:30:00.000Z",
  },
  {
    id: "sol-009",
    reservaId: "r-003",
    tipo: "limpieza",
    descripcion: "Cambio de toallas y reposición de papel higiénico",
    habitacionNumero: "303",
    prioridad: "baja",
    estado: "pendiente",
    fechaSolicitud: "2026-03-21T16:00:00.000Z",
    creadoEn: "2026-03-21T16:00:00.000Z",
  },
  {
    id: "sol-010",
    reservaId: "r-004",
    tipo: "otro",
    descripcion: "Solicitud de cuna adicional para bebé",
    habitacionNumero: "Suite 401",
    prioridad: "alta",
    estado: "completada",
    empleadoAsignado: "María González",
    fechaSolicitud: "2026-03-20T15:00:00.000Z",
    fechaCompletada: "2026-03-20T15:30:00.000Z",
    notas: "Cuna instalada y verificada por el cliente",
    creadoEn: "2026-03-20T15:00:00.000Z",
  },
];

// ─────────────────────────────────────────────
// CATÁLOGO DE TOURS
// ─────────────────────────────────────────────

export const MOCK_TOURS_CATALOGO: TourCatalogo[] = [
  {
    id: "tour-001",
    nombre: "Centro histórico de Bogotá",
    duracionHoras: 4,
    descripcion:
      "Recorrido a pie por La Candelaria, museo del oro y plaza de Bolívar.",
  },
  {
    id: "tour-002",
    nombre: "Monserrate y gastronomía",
    duracionHoras: 5,
    descripcion:
      "Teleférico, mirador y almuerzo típico en restaurante recomendado.",
  },
  {
    id: "tour-003",
    nombre: "Candelaria nocturna",
    duracionHoras: 3,
    descripcion: "Tour guiado con foco en arte urbano y cafés históricos.",
  },
];

// ─────────────────────────────────────────────
// INSCRIPCIONES (EVENTOS / RESTAURANTE)
// ─────────────────────────────────────────────

export const MOCK_INSCRIPCIONES: Inscripcion[] = [
  {
    id: "ins-001",
    categoria: "restaurante",
    nombreActividad: "Cena maridaje — Bodega Santa María",
    descripcion: "Menú de 5 tiempos con maridaje de vinos de la casa.",
    clienteId: "c-001",
    reservaId: "r-001",
    fechaEvento: "2026-03-22",
    horaInicio: "19:30",
    numeroPersonas: 2,
    estado: "confirmada",
    creadoEn: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "ins-002",
    categoria: "evento",
    nombreActividad: "Noche de jazz en el lobby",
    descripcion: "Entrada incluye welcome drink.",
    clienteId: "c-002",
    reservaId: "r-002",
    fechaEvento: "2026-03-21",
    horaInicio: "20:00",
    numeroPersonas: 1,
    estado: "completada",
    creadoEn: "2026-03-10T14:00:00.000Z",
  },
  {
    id: "ins-003",
    categoria: "evento",
    nombreActividad: "Taller de cocina colombiana",
    descripcion: "Grupo reducido, requiere confirmación previa.",
    clienteId: "c-003",
    fechaEvento: "2026-03-28",
    horaInicio: "11:00",
    numeroPersonas: 2,
    estado: "pendiente",
    creadoEn: "2026-03-21T09:00:00.000Z",
  },
  {
    id: "ins-004",
    categoria: "restaurante",
    nombreActividad: "Brunch dominical — terraza",
    descripcion: "Buffet y estación de huevos.",
    clienteId: "c-005",
    reservaId: "r-004",
    fechaEvento: "2026-03-23",
    horaInicio: "10:30",
    numeroPersonas: 4,
    estado: "cancelada",
    motivoCancelacion: "Familia enferma — reprogramar",
    creadoEn: "2026-03-15T11:00:00.000Z",
    actualizadoEn: "2026-03-19T16:00:00.000Z",
  },
];

// ─────────────────────────────────────────────
// PAQUETES PROMOCIONALES
// ─────────────────────────────────────────────

export const MOCK_PAQUETES: PaquetePromocional[] = [
  {
    id: "pkg-001",
    nombre: "Escapada romántica 2 noches",
    descripcion: "Habitación doble, desayuno, cena y spa para dos personas.",
    precioLista: 1200000,
    precioPromocional: 899000,
    fechaInicioVigencia: "2026-03-01",
    fechaFinVigencia: "2026-04-30",
    cuposTotales: 40,
    cuposVendidos: 12,
    estado: "activo",
    incluye: "Desayuno buffet, cena 3 tiempos, acceso spa 90 min",
    creadoEn: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "pkg-002",
    nombre: "Familia — 3 noches familiar",
    descripcion: "Upgrade a familiar cuando haya disponibilidad.",
    precioLista: 2100000,
    precioPromocional: 1750000,
    fechaInicioVigencia: "2026-03-15",
    fechaFinVigencia: "2026-06-15",
    cuposTotales: 25,
    cuposVendidos: 25,
    estado: "agotado",
    incluye: "Desayuno para 4, late checkout sujeto a disponibilidad",
    creadoEn: "2026-03-01T12:00:00.000Z",
  },
  {
    id: "pkg-003",
    nombre: "Early bird — reserva 30 días antes",
    descripcion: "Descuento sobre tarifa flexible.",
    precioLista: 800000,
    precioPromocional: 680000,
    fechaInicioVigencia: "2025-12-01",
    fechaFinVigencia: "2026-02-28",
    cuposTotales: 100,
    cuposVendidos: 0,
    estado: "inactivo",
    incluye: "15% sobre tarifa del día — vigencia vencida",
    creadoEn: "2025-11-01T09:00:00.000Z",
  },
];

// ─────────────────────────────────────────────
// AGENDAMIENTO DE TOURS
// ─────────────────────────────────────────────

export const MOCK_AGENDAMIENTOS_TOUR: AgendamientoTour[] = [
  {
    id: "agt-001",
    tourCatalogoId: "tour-001",
    clienteId: "c-001",
    reservaId: "r-001",
    fecha: "2026-03-22",
    horaSalida: "09:00",
    numeroParticipantes: 2,
    estado: "confirmado",
    puntoEncuentro: "Lobby principal — 08:45",
    guiaAsignado: "Andrea López",
    creadoEn: "2026-03-18T11:00:00.000Z",
  },
  {
    id: "agt-002",
    tourCatalogoId: "tour-002",
    clienteId: "c-002",
    reservaId: "r-002",
    fecha: "2026-03-24",
    horaSalida: "08:30",
    numeroParticipantes: 1,
    estado: "pendiente",
    puntoEncuentro: "Recepción — salida grupal",
    creadoEn: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "agt-003",
    tourCatalogoId: "tour-003",
    clienteId: "c-003",
    fecha: "2026-03-26",
    horaSalida: "18:00",
    numeroParticipantes: 2,
    estado: "cancelado",
    puntoEncuentro: "Lobby",
    motivoCancelacion: "Cliente prefirió quedarse en el hotel",
    creadoEn: "2026-03-19T15:00:00.000Z",
    actualizadoEn: "2026-03-20T09:00:00.000Z",
  },
  {
    id: "agt-004",
    tourCatalogoId: "tour-001",
    clienteId: "c-005",
    reservaId: "r-004",
    fecha: "2026-03-12",
    horaSalida: "09:00",
    numeroParticipantes: 4,
    estado: "realizado",
    puntoEncuentro: "Lobby principal",
    guiaAsignado: "Andrea López",
    creadoEn: "2026-03-08T12:00:00.000Z",
  },
];
