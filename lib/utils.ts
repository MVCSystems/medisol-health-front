import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha a formato YYYY-MM-DD sin conversión a UTC
 * Evita el problema de cambio de día por zona horaria
 */
export function formatearFecha(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 */
export function obtenerFechaHoy(): string {
  return formatearFecha(new Date());
}

/**
 * Parsea una fecha en formato YYYY-MM-DD a objeto Date en hora local
 * Evita conversión UTC que causa cambio de día
 */
export function parsearFechaLocal(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formatea una fecha string YYYY-MM-DD para mostrar en español (Perú)
 * Evita problema de zona horaria
 */
export function formatearFechaDisplay(fechaString: string): string {
  const fecha = parsearFechaLocal(fechaString);
  return fecha.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
