"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { 
  Search, 
  Stethoscope, 
  Calendar, 
  MapPin, 
  Clock,
  User,
  Phone,
  Building2,
  UserCheck
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchService, type SearchResults } from "@/services/search.service";
import type { Especialidad, Doctor, Clinica, Cita } from "@/types/clinicas";
import type { Usuario } from "@/types/usuario";



export default function MedicalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    especialidades: [],
    doctores: [],
    clinicas: [],
    citas: [],
    usuarios: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para buscar en el backend
  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults({ especialidades: [], doctores: [], clinicas: [], citas: [], usuarios: [] });
      return false;
    }

    setIsLoading(true);

    try {
      const searchResults = await searchService.searchAll(term);
      setResults(searchResults);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults({ especialidades: [], doctores: [], clinicas: [], citas: [], usuarios: [] });
    } finally {
      setIsLoading(false);
    }

    return true;
  }, []);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      setIsOpen(true);
      performSearch(value);
    } else {
      setIsOpen(false);
    }
  };

  // Manejar clic en el botón de búsqueda
  const handleSearchClick = () => {
    if (searchTerm.length >= 2) {
      setIsOpen(!isOpen);
    } else {
      // Enfocar el input si no hay texto
      inputRef.current?.focus();
    }
  };

  // Verificar si hay resultados
  const hasResults = 
    results.especialidades.length > 0 ||
    results.doctores.length > 0 ||
    results.clinicas.length > 0 ||
    results.citas.length > 0 ||
    results.usuarios.length > 0;

  // Manejar navegación a diferentes secciones
  const handleEspecialidadClick = (especialidad: Especialidad) => {
    setIsOpen(false);
    // Navegar a página de especialidad
    window.location.href = `/dashboard/especialidades/${especialidad.id}`;
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setIsOpen(false);
    // Navegar a perfil del médico
    window.location.href = `/dashboard/doctores/${doctor.id}`;
  };

  const handleClinicaClick = (clinica: Clinica) => {
    setIsOpen(false);
    // Navegar a página de clínica
    window.location.href = `/dashboard/clinicas/${clinica.id}`;
  };

  const handleCitaClick = (cita: Cita) => {
    setIsOpen(false);
    // Navegar a detalles de la cita
    window.location.href = `/dashboard/citas/${cita.id}`;
  };

  const handleUsuarioClick = (usuario: Usuario) => {
    setIsOpen(false);
    // Navegar a perfil del usuario
    window.location.href = `/dashboard/usuarios/${usuario.id}`;
  };

  // Mantener focus cuando se abre el popover
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <div className="flex">
        <PopoverAnchor className="flex-1">
          <Input
            ref={inputRef}
            placeholder="Buscar doctores, especialidades, clínicas, citas..."
            className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={handleInputChange}
          />
        </PopoverAnchor>
        <Button
          className="rounded-l-none bg-blue-600 hover:bg-blue-700"
          onClick={handleSearchClick}
          type="button"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <PopoverContent
        className="w-[650px] p-0 glass-medical shadow-2xl rounded-2xl border-0"
        align="start"
        sideOffset={8}
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-spin">
                  <div className="absolute inset-2 rounded-full bg-white"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full medical-pulse"></div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Buscando información médica</h3>
            <p className="text-gray-600">Consultando base de datos de especialistas...</p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : hasResults ? (
          <div className="max-h-[750px] overflow-y-auto custom-scrollbar">
            
            {/* Especialidades */}
            {results.especialidades.length > 0 && (
              <div className="p-6 border-b border-gray-100/60">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 gradient-especialidades rounded-2xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Especialidades Médicas</h3>
                    <p className="text-sm text-gray-600">Encuentra el especialista que necesitas</p>
                  </div>
                  <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    {results.especialidades.length} disponibles
                  </div>
                </div>
                <div className="grid gap-4">
                  {results.especialidades.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleEspecialidadClick(item)}
                      className="medical-card group relative p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100/90 hover:to-indigo-100/90 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-[1.02] border border-blue-100/50 hover:border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                            <h4 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {item.nombre}
                            </h4>
                          </div>
                          <p className="text-gray-600 text-base leading-relaxed pl-6">{item.descripcion || 'Especialidad médica'}</p>
                        </div>
                        <div className="ml-6 flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2 status-available px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold">Disponible</span>
                          </div>
                          <Calendar className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctores */}
            {results.doctores.length > 0 && (
              <div className="p-6 border-b border-gray-100/60">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 gradient-medicos rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Nuestros Médicos</h3>
                    <p className="text-sm text-gray-600">Profesionales de la salud especializados</p>
                  </div>
                  <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    {results.doctores.length} doctores
                  </div>
                </div>
                <div className="grid gap-4">
                  {results.doctores.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleDoctorClick(item)}
                      className="medical-card group relative p-5 bg-gradient-to-r from-emerald-50/80 to-green-50/80 hover:from-emerald-100/90 hover:to-green-100/90 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-[1.02] border border-emerald-100/50 hover:border-emerald-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                              {(item.usuario_data?.first_name || item.nombres || 'D')[0]}{(item.usuario_data?.last_name || item.apellidos || 'R')[0]}
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors mb-1">
                              {item.usuario_data?.first_name || item.nombres} {item.usuario_data?.last_name || item.apellidos}
                            </h4>
                            <p className="text-emerald-600 font-semibold text-base mb-3">{item.titulo}</p>
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <p className="text-sm font-medium">{item.clinica_nombre}</p>
                            </div>
                            {item.especialidades_data && item.especialidades_data.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.especialidades_data.slice(0, 2).map((esp) => (
                                  <span key={esp.id} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                    {esp.nombre}
                                  </span>
                                ))}
                                {item.especialidades_data.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    +{item.especialidades_data.length - 2} más
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2 status-available px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold">Disponible</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-700">S/. {item.precio_consulta_base}</p>
                            <p className="text-xs text-gray-500">por consulta</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clínicas */}
            {results.clinicas.length > 0 && (
              <div className="p-6 border-b border-gray-100/60">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 gradient-servicios rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Clínicas</h3>
                    <p className="text-sm text-gray-600">Centros médicos disponibles</p>
                  </div>
                  <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                    {results.clinicas.length} clínicas
                  </div>
                </div>
                <div className="grid gap-4">
                  {results.clinicas.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleClinicaClick(item)}
                      className="medical-card group relative p-5 bg-gradient-to-r from-purple-50/80 to-violet-50/80 hover:from-purple-100/90 hover:to-violet-100/90 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-[1.02] border border-purple-100/50 hover:border-purple-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors mb-2">
                            {item.nombre}
                          </h4>
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <MapPin className="h-4 w-4" />
                            <p className="text-sm">{item.direccion}</p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 mb-3">
                            <Phone className="h-4 w-4" />
                            <p className="text-sm">{item.telefono}</p>
                          </div>
                          {item.descripcion && (
                            <p className="text-gray-600 text-sm leading-relaxed">{item.descripcion}</p>
                          )}
                        </div>
                        <div className="ml-6 flex flex-col items-end gap-3">
                          {item.activa ? (
                            <div className="flex items-center gap-2 status-available px-3 py-1.5 rounded-full">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-sm font-bold">Activa</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 status-unavailable px-3 py-1.5 rounded-full">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              <span className="text-sm font-bold">Inactiva</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citas */}
            {results.citas.length > 0 && (
              <div className="p-6 border-b border-gray-100/60">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 gradient-informacion rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Citas Médicas</h3>
                    <p className="text-sm text-gray-600">Citas programadas en el sistema</p>
                  </div>
                  <div className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                    {results.citas.length} citas
                  </div>
                </div>
                <div className="grid gap-4">
                  {results.citas.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleCitaClick(item)}
                      className="medical-card group relative p-5 bg-gradient-to-r from-orange-50/80 to-amber-50/80 hover:from-orange-100/90 hover:to-amber-100/90 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-[1.02] border border-orange-100/50 hover:border-orange-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                              item.estado === 'CONFIRMADA' 
                                ? 'bg-blue-100 text-blue-700'
                                : item.estado === 'COMPLETADA'
                                ? 'bg-green-100 text-green-700'
                                : item.estado === 'CANCELADA'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.estado}
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors mb-2">
                            {item.motivo || 'Consulta médica'}
                          </h4>
                          <div className="flex items-center gap-4 text-gray-600 text-sm mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(item.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{item.hora_inicio}</span>
                            </div>
                          </div>
                          {item.notas && (
                            <p className="text-gray-600 text-sm leading-relaxed">{item.notas}</p>
                          )}
                        </div>
                        <div className="ml-6 text-right">
                          <p className="text-lg font-bold text-gray-700">S/. {item.precio_consulta}</p>
                          <p className="text-xs text-gray-500">consulta</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usuarios */}
            {results.usuarios.length > 0 && (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Usuarios</h3>
                    <p className="text-sm text-gray-600">Usuarios registrados en el sistema</p>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                    {results.usuarios.length} usuarios
                  </div>
                </div>
                <div className="grid gap-4">
                  {results.usuarios.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleUsuarioClick(item)}
                      className="medical-card group relative p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 hover:from-indigo-100/90 hover:to-purple-100/90 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-[1.02] border border-indigo-100/50 hover:border-indigo-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {item.first_name?.[0]}{item.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors mb-1">
                              {item.first_name} {item.last_name}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">{item.email}</p>
                            <div className="flex flex-wrap gap-1">
                              {item.roles?.map((role) => (
                                <span key={role.id} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                  {role.rol_nombre}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {item.is_active ? (
                            <div className="flex items-center gap-2 status-available px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold">Activo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 status-unavailable px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              <span className="text-xs font-bold">Inactivo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : searchTerm.length >= 2 ? (
          <div className="p-10 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">Sin resultados</h3>
            <p className="text-gray-500 mb-2 text-lg">No se encontraron resultados para &quot;{searchTerm}&quot;</p>
            <p className="text-gray-400">
              Intenta buscar por especialidad, nombre del médico o servicio médico
            </p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">¿Qué estás buscando?</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="group p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 hover:from-blue-100 hover:via-blue-200 hover:to-indigo-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-especialidades rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-bold text-blue-700 mb-1">Especialidades</p>
                <p className="text-sm text-blue-600">Encuentra tu especialista</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-100 hover:from-emerald-100 hover:via-green-200 hover:to-emerald-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-medicos rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-bold text-emerald-700 mb-1">Doctores</p>
                <p className="text-sm text-emerald-600">Conoce a nuestro equipo</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-purple-50 via-violet-100 to-purple-100 hover:from-purple-100 hover:via-violet-200 hover:to-purple-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-servicios rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-bold text-purple-700 mb-1">Clínicas</p>
                <p className="text-sm text-purple-600">Centros médicos disponibles</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100 hover:from-orange-100 hover:via-amber-200 hover:to-orange-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-informacion rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-bold text-orange-700 mb-1">Citas</p>
                <p className="text-sm text-orange-600">Gestión de citas médicas</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-indigo-50 via-purple-100 to-indigo-100 hover:from-indigo-100 hover:via-purple-200 hover:to-indigo-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-bold text-indigo-700 mb-1">Usuarios</p>
                <p className="text-sm text-indigo-600">Usuarios del sistema</p>
              </div>
            </div>
            <p className="text-gray-500 text-base">
              Comienza escribiendo para buscar especialidades, doctores, clínicas, citas o usuarios
            </p>
          </div>
        )}

        <div className="p-6 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-t border-gray-200/50 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg">
              <Phone className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-bold">Emergencias 24/7</span>
            </div>
            <span className="text-lg font-bold text-red-600">(01) 234-5678</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Presiona</p>
            <kbd className="px-2 py-1 bg-gray-200 text-gray-600 rounded font-mono text-sm shadow-sm">ESC</kbd>
            <p className="text-sm text-gray-500">para cerrar</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}