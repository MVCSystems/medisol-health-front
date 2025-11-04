/**
 * 🔒 UTILIDADES DE VALIDACIÓN Y SANITIZACIÓN - FRONTEND
 * Complementa las validaciones del backend para mejor UX
 */

/**
 * Valida formato de DNI (8 dígitos)
 */
export function validarDNI(dni: string): { valido: boolean; error?: string } {
  const dniLimpio = dni.trim().replace(/\D/g, '');
  
  if (!dniLimpio) {
    return { valido: false, error: 'El DNI es requerido' };
  }
  
  if (dniLimpio.length !== 8) {
    return { valido: false, error: 'El DNI debe tener exactamente 8 dígitos' };
  }
  
  return { valido: true };
}

/**
 * Valida formato de nombres/apellidos (solo letras, espacios y tildes)
 */
export function validarNombre(nombre: string): { valido: boolean; error?: string } {
  const nombreLimpio = nombre.trim();
  
  if (!nombreLimpio) {
    return { valido: false, error: 'Este campo es requerido' };
  }
  
  if (nombreLimpio.length < 2) {
    return { valido: false, error: 'Debe tener al menos 2 caracteres' };
  }
  
  if (nombreLimpio.length > 100) {
    return { valido: false, error: 'Máximo 100 caracteres' };
  }
  
  // Solo letras, espacios, tildes y letras con diacríticos
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!regex.test(nombreLimpio)) {
    return { valido: false, error: 'Solo se permiten letras y espacios' };
  }
  
  return { valido: true };
}

/**
 * Valida formato de celular (7-15 dígitos)
 */
export function validarCelular(celular: string): { valido: boolean; error?: string } {
  const celularLimpio = celular.trim().replace(/\D/g, '');
  
  if (!celularLimpio) {
    return { valido: false, error: 'El celular es requerido' };
  }
  
  if (celularLimpio.length < 7) {
    return { valido: false, error: 'El celular debe tener al menos 7 dígitos' };
  }
  
  if (celularLimpio.length > 15) {
    return { valido: false, error: 'El celular no puede tener más de 15 dígitos' };
  }
  
  return { valido: true };
}

/**
 * Valida formato de email
 */
export function validarEmail(email: string): { valido: boolean; error?: string } {
  const emailLimpio = email.trim().toLowerCase();
  
  if (!emailLimpio) {
    return { valido: false, error: 'El email es requerido' };
  }
  
  // Validación básica de email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(emailLimpio)) {
    return { valido: false, error: 'Formato de email inválido' };
  }
  
  if (emailLimpio.length > 100) {
    return { valido: false, error: 'El email es demasiado largo' };
  }
  
  return { valido: true };
}

/**
 * Valida formato de fecha (DD/MM/YYYY)
 */
export function validarFecha(fecha: string): { valido: boolean; error?: string } {
  const fechaLimpia = fecha.trim();
  
  if (!fechaLimpia) {
    return { valido: false, error: 'La fecha es requerida' };
  }
  
  // Validar formato DD/MM/YYYY
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = fechaLimpia.match(regex);
  
  if (!match) {
    return { valido: false, error: 'Formato inválido. Use DD/MM/YYYY (Ejemplo: 15/12/2025)' };
  }
  
  const [, dia, mes, anio] = match;
  const diaNum = parseInt(dia, 10);
  const mesNum = parseInt(mes, 10);
  const anioNum = parseInt(anio, 10);
  
  // Validar rangos
  if (mesNum < 1 || mesNum > 12) {
    return { valido: false, error: 'El mes debe estar entre 01 y 12' };
  }
  
  if (diaNum < 1 || diaNum > 31) {
    return { valido: false, error: 'El día debe estar entre 01 y 31' };
  }
  
  if (anioNum < 2020 || anioNum > 2100) {
    return { valido: false, error: 'El año debe estar entre 2020 y 2100' };
  }
  
  // Validar que la fecha sea válida (no 31 de febrero, etc.)
  const fechaObj = new Date(anioNum, mesNum - 1, diaNum);
  if (
    fechaObj.getFullYear() !== anioNum ||
    fechaObj.getMonth() !== mesNum - 1 ||
    fechaObj.getDate() !== diaNum
  ) {
    return { valido: false, error: 'Fecha inválida' };
  }
  
  return { valido: true };
}

/**
 * Valida formato de hora (HH:MM)
 */
export function validarHora(hora: string): { valido: boolean; error?: string } {
  const horaLimpia = hora.trim();
  
  if (!horaLimpia) {
    return { valido: false, error: 'La hora es requerida' };
  }
  
  // Validar formato HH:MM
  const regex = /^(\d{2}):(\d{2})$/;
  const match = horaLimpia.match(regex);
  
  if (!match) {
    return { valido: false, error: 'Formato inválido. Use HH:MM (Ejemplo: 14:30)' };
  }
  
  const [, horas, minutos] = match;
  const horasNum = parseInt(horas, 10);
  const minutosNum = parseInt(minutos, 10);
  
  if (horasNum < 0 || horasNum > 23) {
    return { valido: false, error: 'Las horas deben estar entre 00 y 23' };
  }
  
  if (minutosNum < 0 || minutosNum > 59) {
    return { valido: false, error: 'Los minutos deben estar entre 00 y 59' };
  }
  
  return { valido: true };
}

/**
 * Sanitiza texto general (previene inyección XSS básica)
 */
export function sanitizarTexto(texto: string, maxLongitud: number = 500): string {
  let limpio = texto.trim();
  
  // Limitar longitud
  if (limpio.length > maxLongitud) {
    limpio = limpio.substring(0, maxLongitud);
  }
  
  // Escapar caracteres HTML básicos
  limpio = limpio
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return limpio;
}

/**
 * Valida y limpia texto de motivo de cita
 */
export function validarMotivo(motivo: string): { valido: boolean; error?: string; limpio?: string } {
  const motivoLimpio = motivo.trim();
  
  if (!motivoLimpio) {
    return { valido: false, error: 'El motivo es requerido' };
  }
  
  if (motivoLimpio.length < 5) {
    return { valido: false, error: 'El motivo debe tener al menos 5 caracteres' };
  }
  
  if (motivoLimpio.length > 200) {
    return { valido: false, error: 'El motivo no puede exceder 200 caracteres' };
  }
  
  return { valido: true, limpio: sanitizarTexto(motivoLimpio, 200) };
}

/**
 * Formatea DNI eliminando caracteres no numéricos
 */
export function formatearDNI(dni: string): string {
  return dni.replace(/\D/g, '').substring(0, 8);
}

/**
 * Formatea celular eliminando caracteres no numéricos
 */
export function formatearCelular(celular: string): string {
  return celular.replace(/\D/g, '').substring(0, 15);
}

/**
 * Formatea nombres/apellidos eliminando caracteres no permitidos
 */
export function formatearNombre(nombre: string): string {
  // Eliminar caracteres que no sean letras, espacios o tildes
  return nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').substring(0, 100);
}

/**
 * Formatea email a minúsculas y elimina espacios
 */
export function formatearEmail(email: string): string {
  return email.trim().toLowerCase().substring(0, 100);
}
