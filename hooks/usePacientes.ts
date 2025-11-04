import { useState, useEffect } from "react";
import {
  pacienteService,
  type PacienteCreateData,
  type PacienteRegistroResponse,
} from "@/services/paciente.service";
import type { Paciente } from "@/types/clinicas";
import { toast } from "sonner";
export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const handle = (e: unknown, f: string) =>
    e instanceof Error ? e.message : f;
  const cargarPacientes = async (
    mostrarInactivos: boolean = incluirInactivos
  ) => {
    setLoading(true);
    setError(null);
    try {
      const d = await pacienteService.getAll(mostrarInactivos);
      setPacientes(
        mostrarInactivos ? d.results.filter((x) => !x.activo) : d.results
      );
    } catch {
      setError("Error al cargar la lista de pacientes");
      toast.error("Error al cargar pacientes");
    }
    setLoading(false);
  };
  const toggleIncluirInactivos = () => {
    const n = !incluirInactivos;
    setIncluirInactivos(n);
    cargarPacientes(n);
  };
  const registrarPaciente = async (data: PacienteCreateData) => {
    setError(null);
    try {
      const r = await pacienteService.registrar(data);
      toast.success("Paciente registrado exitosamente");
      await cargarPacientes();
      return r;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error al registrar paciente";
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }
  };
  const actualizarPaciente = async (
    id: number,
    data: Partial<PacienteCreateData>
  ) => {
    setError(null);
    try {
      await pacienteService.update(id, data);
      toast.success("Paciente actualizado exitosamente");
      await cargarPacientes();
      return true;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error al actualizar paciente";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  };
  const eliminarPaciente = async (id: number) => {
    setError(null);
    try {
      await pacienteService.delete(id);
      toast.success("Paciente desactivado exitosamente", {
        description: "El paciente ya no aparecerá en los listados activos",
      });
      await cargarPacientes();
      return true;
    } catch (e) {
      setError(handle(e, "Error al desactivar paciente"));
      toast.error(handle(e, "Error al desactivar paciente"));
      return false;
    }
  };
  const obtenerPaciente = async (id: number) => {
    setError(null);
    try {
      return await pacienteService.getById(id);
    } catch (e) {
      setError(handle(e, "Error al obtener paciente"));
      toast.error(handle(e, "Error al obtener paciente"));
      return null;
    }
  };
  const buscarPacientes = async (query: string) => {
    setError(null);
    try {
      return await pacienteService.buscar(query);
    } catch (e) {
      setError(handle(e, "Error al buscar pacientes"));
      toast.error(handle(e, "Error al buscar pacientes"));
      return [];
    }
  };
  const reactivarPaciente = async (id: number) => {
    setError(null);
    try {
      await pacienteService.reactivar(id);
      toast.success("Paciente reactivado exitosamente", {
        description: "El paciente y su usuario han sido reactivados",
      });
      await cargarPacientes();
      return true;
    } catch (e) {
      setError(handle(e, "Error al reactivar paciente"));
      toast.error(handle(e, "Error al reactivar paciente"));
      return false;
    }
  };
  useEffect(() => {
    cargarPacientes();
  }, []);
  return {
    pacientes,
    loading,
    error,
    incluirInactivos,
    cargarPacientes,
    toggleIncluirInactivos,
    registrarPaciente,
    actualizarPaciente,
    eliminarPaciente,
    reactivarPaciente,
    obtenerPaciente,
    buscarPacientes,
  };
}
