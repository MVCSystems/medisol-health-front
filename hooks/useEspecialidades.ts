import { useState, useEffect } from "react";
import { especialidadService } from "@/services/especialidad.service";
import type {
  Especialidad,
  CreateEspecialidadData,
  UpdateEspecialidadData,
  PaginatedResponse,
} from "@/types/clinicas";
export const useEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const handle = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;
  const fetchEspecialidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const r: PaginatedResponse<Especialidad> =
        await especialidadService.getAll();
      setEspecialidades(r.results);
      setTotalCount(r.count);
    } catch (e) {
      setError(handle(e, "Error al cargar las especialidades"));
    }
    setLoading(false);
  };
  const createEspecialidad = async (data: CreateEspecialidadData) => {
    setLoading(true);
    setError(null);
    try {
      const n = await especialidadService.create(data);
      setEspecialidades((p) => [...p, n]);
      setTotalCount((c) => c + 1);
      return n;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error al crear la especialidad";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const updateEspecialidad = async (
    id: number,
    data: UpdateEspecialidadData
  ) => {
    setLoading(true);
    setError(null);
    try {
      const u = await especialidadService.update(id, data);
      setEspecialidades((p) => p.map((e) => (e.id === id ? u : e)));
      return u;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error al actualizar la especialidad";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const deleteEspecialidad = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await especialidadService.delete(id);
      setEspecialidades((p) => p.filter((e) => e.id !== id));
      setTotalCount((c) => c - 1);
      return true;
    } catch (e) {
      setError(handle(e, "Error al eliminar la especialidad"));
      return false;
    }
    setLoading(false);
  };
  const getEspecialidadById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await especialidadService.getById(id);
    } catch (e) {
      setError(handle(e, "Error al obtener la especialidad"));
      return null;
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchEspecialidades();
  }, []);
  return {
    especialidades,
    loading,
    error,
    totalCount,
    fetchEspecialidades,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad,
    getEspecialidadById,
  };
};
