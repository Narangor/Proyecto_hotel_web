/**
 * booking-store.ts — almacenamiento compartido de reservas, clientes y
 * check-ins para sincronizar el flujo público (/reservar) con los módulos
 * de administración (Clientes, Reservas, Check-in).
 *
 * Usa localStorage para persistir los datos entre navegaciones.
 * En Ciclo 2 este módulo se reemplazará por llamadas a la API REST.
 */

import type { Cliente, Reserva, Checkin } from '@/types';

const KEY_CLIENTES = 'hotel_sm_clientes_ext';
const KEY_RESERVAS = 'hotel_sm_reservas_ext';
const KEY_CHECKINS  = 'hotel_sm_checkins_ext';

function safeGet<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function safeSet<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage lleno o no disponible — falla silenciosamente
  }
}

/**
 * Combina datos base (mock) con datos almacenados, dando prioridad a los
 * almacenados cuando hay coincidencia por id. Evita duplicados.
 */
export function mergeById<T extends { id: string }>(base: T[], stored: T[]): T[] {
  const storedMap = new Map(stored.map((item) => [item.id, item]));
  return [...base.filter((item) => !storedMap.has(item.id)), ...stored];
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────

/** Devuelve los clientes persistidos (creados/editados desde cualquier módulo). */
export function getStoredClientes(): Cliente[] {
  return safeGet<Cliente>(KEY_CLIENTES);
}

/** Persiste un cliente (upsert: crea o actualiza por id). */
export function storeCliente(cliente: Cliente): void {
  const existing = getStoredClientes();
  const idx = existing.findIndex((c) => c.id === cliente.id);
  if (idx >= 0) {
    existing[idx] = cliente;
    safeSet(KEY_CLIENTES, existing);
  } else {
    safeSet(KEY_CLIENTES, [...existing, cliente]);
  }
}

/** Elimina un cliente del store por id. */
export function deleteStoredCliente(id: string): void {
  safeSet(KEY_CLIENTES, getStoredClientes().filter((c) => c.id !== id));
}

// ─── RESERVAS ────────────────────────────────────────────────────────────────

/** Devuelve las reservas persistidas (creadas/editadas desde cualquier módulo). */
export function getStoredReservas(): Reserva[] {
  return safeGet<Reserva>(KEY_RESERVAS);
}

/** Persiste una reserva (upsert: crea o actualiza por id). */
export function storeReserva(reserva: Reserva): void {
  const existing = getStoredReservas();
  const idx = existing.findIndex((r) => r.id === reserva.id);
  if (idx >= 0) {
    existing[idx] = reserva;
    safeSet(KEY_RESERVAS, existing);
  } else {
    safeSet(KEY_RESERVAS, [...existing, reserva]);
  }
}

// ─── CHECKINS ────────────────────────────────────────────────────────────────

/** Devuelve los check-ins persistidos. */
export function getStoredCheckins(): Checkin[] {
  return safeGet<Checkin>(KEY_CHECKINS);
}

/** Persiste un check-in (upsert: crea o actualiza por id). */
export function storeCheckin(checkin: Checkin): void {
  const existing = getStoredCheckins();
  const idx = existing.findIndex((c) => c.id === checkin.id);
  if (idx >= 0) {
    existing[idx] = checkin;
    safeSet(KEY_CHECKINS, existing);
  } else {
    safeSet(KEY_CHECKINS, [...existing, checkin]);
  }
}

// ─── UTILIDADES ──────────────────────────────────────────────────────────────

/**
 * Busca un cliente por número de documento en los datos mock Y en el store.
 * Útil para evitar duplicar clientes al confirmar una reserva.
 */
export function findClienteByDocumento(
  numeroDocumento: string,
  mockClientes: Cliente[],
): Cliente | undefined {
  const allClientes = [...mockClientes, ...getStoredClientes()];
  return allClientes.find((c) => c.numeroDocumento === numeroDocumento);
}
