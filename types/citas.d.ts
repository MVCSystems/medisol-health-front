export interface CitaWithDetails {
  id: number;
  clinica: number;
  doctor: {
    id: number;
    nombres: string;
    apellidos: string;
    especialidades: Array<{
      id: number;
      nombre: string;
    }>;
  };
  paciente: {
    id: number;
    nombres: string;
    apellidos: string;
    numero_documento: string;
  };
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  notas?: string;
  precio_consulta: number;
  descuento: number;
  precio_total: number;
}