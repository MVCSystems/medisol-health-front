import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CitaWithDetails } from "@/types/citas";

interface DetallesCitaProps {
  cita: CitaWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetallesCita({ cita, isOpen, onClose }: DetallesCitaProps) {
  if (!cita) return null;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles de la Cita</DialogTitle>
          <DialogDescription>
            Información completa de la cita médica
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="font-semibold mb-1">Fecha y Hora</h3>
            <p>{formatearFecha(cita.fecha)}</p>
            <p className="text-sm text-muted-foreground">
              {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Paciente</h3>
            <p>{cita.paciente.nombres} {cita.paciente.apellidos}</p>
            <p className="text-sm text-muted-foreground">DNI: {cita.paciente.numero_documento}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Doctor</h3>
            <p>Dr. {cita.doctor.nombres} {cita.doctor.apellidos}</p>
            <p className="text-sm text-muted-foreground">
              {cita.doctor.especialidades?.map(esp => esp.nombre).join(', ') || 'Sin especialidad'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Motivo de la consulta</h3>
            <p>{cita.motivo}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Información de pago</h3>
            <p>Precio total: S/ {cita.precio_total}</p>
            {cita.descuento > 0 && (
              <p className="text-sm text-green-600">Descuento aplicado: S/ {cita.descuento}</p>
            )}
          </div>
          {cita.notas && (
            <div>
              <h3 className="font-semibold mb-1">Notas adicionales</h3>
              <p>{cita.notas}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}