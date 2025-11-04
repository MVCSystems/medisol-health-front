import { useState, useEffect } from "react";
import { clinicaService } from "@/services/clinica.service";
import type {
  Clinica,
  CreateClinicaData,
  UpdateClinicaData,
  PaginatedResponse,
} from "@/types/clinicas";
export const useClinicas = () => {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const handle = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;
  const fetchClinicas = async () => {
    setLoading(true);
    setError(null);
    try {
      const r: PaginatedResponse<Clinica> = await clinicaService.getAll();
      setClinicas(r.results);
      setTotalCount(r.count);
    } catch (e) {
      setError(handle(e, "Error al cargar las clínicas"));
    }
    setLoading(false);
  };
  const createClinica = async (data: CreateClinicaData) => {
    setLoading(true);
    setError(null);
    try {
      const n = await clinicaService.create(data);
      setClinicas((p) => [...p, n]);
      setTotalCount((c) => c + 1);
      return n;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error al crear la clínica";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const updateClinica = async (id: number, data: UpdateClinicaData) => {
    setLoading(true);
    setError(null);
    try {
      const u = await clinicaService.update(id, data);
      setClinicas((p) => p.map((c) => (c.id === id ? u : c)));
      return u;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error al actualizar la clínica";
      setError(errorMsg);
      return null;
    }
    setLoading(false);
  };
  const deleteClinica = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await clinicaService.delete(id);
      setClinicas((p) => p.filter((c) => c.id !== id));
      setTotalCount((c) => c - 1);
      return true;
    } catch (e) {
      setError(handle(e, "Error al eliminar la clínica"));
      return false;
    }
    setLoading(false);
  };
  const getClinicaById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await clinicaService.getById(id);
    } catch (e) {
      setError(handle(e, "Error al obtener la clínica"));
      return null;
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchClinicas();
  }, []);
  return {
    clinicas,
    loading,
    error,
    totalCount,
    fetchClinicas,
    createClinica,
    updateClinica,
    deleteClinica,
    getClinicaById,
  };
};
