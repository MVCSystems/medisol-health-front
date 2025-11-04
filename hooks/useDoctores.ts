import { useState, useEffect, useCallback } from "react";
import {
  doctorService,
  type DoctorCreateData,
} from "@/services/doctor.service";
import type { Doctor } from "@/types/clinicas";
import { toast } from "sonner";
export function useDoctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const handle = (e: unknown, f: string) =>
    e instanceof Error ? e.message : f;
  const cargarDoctores = useCallback(
    async (mostrarInactivos: boolean = incluirInactivos) => {
      setLoading(true);
      setError(null);
      try {
        const d = await doctorService.getAll(mostrarInactivos);
        setDoctores(
          mostrarInactivos ? d.results.filter((x) => !x.activo) : d.results
        );
      } catch {
        setError("Error al cargar la lista de doctores");
        toast.error("Error al cargar doctores");
      }
      setLoading(false);
    },
    [incluirInactivos]
  );
  const toggleIncluirInactivos = () => {
    const n = !incluirInactivos;
    setIncluirInactivos(n);
    cargarDoctores(n);
  };
  const registrarDoctor = async (data: DoctorCreateData) => {
    setError(null);
    try {
      const r = await doctorService.registrar(data);
      toast.success("Doctor registrado exitosamente");
      await cargarDoctores();
      return r;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error al registrar doctor";
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }
  };
  const actualizarDoctor = async (
    id: number,
    data: Partial<DoctorCreateData>
  ) => {
    setError(null);
    try {
      await doctorService.update(id, data);
      toast.success("Doctor actualizado exitosamente");
      await cargarDoctores();
      return true;
    } catch (e) {
      setError(handle(e, "Error al actualizar doctor"));
      toast.error(handle(e, "Error al actualizar doctor"));
      return false;
    }
  };
  const eliminarDoctor = async (id: number) => {
    setError(null);
    try {
      await doctorService.delete(id);
      toast.success("Doctor desactivado exitosamente", {
        description: "El doctor ya no aparecerá en los listados activos",
      });
      await cargarDoctores();
      return true;
    } catch (e) {
      setError(handle(e, "Error al desactivar doctor"));
      toast.error(handle(e, "Error al desactivar doctor"));
      return false;
    }
  };
  const obtenerDoctor = async (id: number) => {
    setError(null);
    try {
      return await doctorService.getById(id);
    } catch (e) {
      setError(handle(e, "Error al obtener doctor"));
      toast.error(handle(e, "Error al obtener doctor"));
      return null;
    }
  };
  const obtenerDoctoresPorClinica = async (clinicaId: number) => {
    setError(null);
    try {
      return await doctorService.getByClinica(clinicaId);
    } catch (e) {
      setError(handle(e, "Error al filtrar doctores"));
      toast.error(handle(e, "Error al filtrar doctores"));
      return [];
    }
  };
  const obtenerDoctoresPorEspecialidad = async (especialidadId: number) => {
    setError(null);
    try {
      return await doctorService.getByEspecialidad(especialidadId);
    } catch (e) {
      setError(handle(e, "Error al filtrar doctores"));
      toast.error(handle(e, "Error al filtrar doctores"));
      return [];
    }
  };
  const reactivarDoctor = async (id: number) => {
    setError(null);
    try {
      await doctorService.reactivar(id);
      toast.success("Doctor reactivado exitosamente", {
        description: "El doctor y su usuario han sido reactivados",
      });
      await cargarDoctores();
      return true;
    } catch (e) {
      setError(handle(e, "Error al reactivar doctor"));
      toast.error(handle(e, "Error al reactivar doctor"));
      return false;
    }
  };
  useEffect(() => {
    cargarDoctores();
  }, [cargarDoctores]);
  return {
    doctores,
    loading,
    error,
    incluirInactivos,
    cargarDoctores,
    toggleIncluirInactivos,
    registrarDoctor,
    actualizarDoctor,
    eliminarDoctor,
    reactivarDoctor,
    obtenerDoctor,
    obtenerDoctoresPorClinica,
    obtenerDoctoresPorEspecialidad,
  };
}
