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
  Mail
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchService, type SearchResults } from "@/services/search.service";
import type { Especialidad, Doctor, Clinica, Cita } from "@/types/clinicas";



export default function MedicalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    especialidades: [],
    doctores: [],
    clinicas: [],
    citas: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para buscar en el backend
  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults({ especialidades: [], doctores: [], clinicas: [], citas: [] });
      return false;
    }

    setIsLoading(true);

    try {
      const searchResults = await searchService.searchAll(term);
      setResults(searchResults);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults({ especialidades: [], doctores: [], clinicas: [], citas: [] });
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
    results.citas.length > 0;

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



  // Mantener focus cuando se abre el popover
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <div className="flex w-full">
          <PopoverAnchor className="flex-1">
            <Input
              ref={inputRef}
              placeholder="Buscar doctores, especialidades, clínicas, citas..."
              className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
              value={searchTerm}
              onChange={handleInputChange}
            />
          </PopoverAnchor>
          <Button
            className="rounded-l-none bg-primary hover:bg-primary/90 h-12 px-6"
            onClick={handleSearchClick}
            type="button"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 glass-medical shadow-2xl rounded-2xl border border-border/50 backdrop-blur-xl"
          align="start"
          sideOffset={8}
        >
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-spin">
                  <div className="absolute inset-2 rounded-full bg-background"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary rounded-full medical-pulse"></div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Buscando información médica</h3>
            <p className="text-muted-foreground">Consultando base de datos de especialistas...</p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : hasResults ? (
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            
            {/* Especialidades */}
            {results.especialidades.length > 0 && (
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 gradient-especialidades rounded-xl flex items-center justify-center shadow-md">
                    <Stethoscope className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">Especialidades Médicas</h3>
                    <p className="text-xs text-muted-foreground">Encuentra el especialista que necesitas</p>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {results.especialidades.length}
                  </div>
                </div>
                <div className="space-y-2">
                  {results.especialidades.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleEspecialidadClick(item)}
                      className="medical-card group relative p-3 bg-primary/5 hover:bg-primary/10 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg border border-primary/10 hover:border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.nombre}
                            </h4>
                          </div>
                          <p className="text-muted-foreground text-sm pl-4">{item.descripcion || 'Especialidad médica'}</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">Disponible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctores */}
            {results.doctores.length > 0 && (
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 gradient-medicos rounded-xl flex items-center justify-center shadow-md">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">Nuestros Médicos</h3>
                    <p className="text-xs text-muted-foreground">Profesionales de la salud especializados</p>
                  </div>
                  <div className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-bold">
                    {results.doctores.length}
                  </div>
                </div>
                <div className="space-y-2">
                  {results.doctores.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleDoctorClick(item)}
                      className="medical-card group relative p-3 bg-secondary/5 hover:bg-secondary/10 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg border border-secondary/10 hover:border-secondary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-secondary via-secondary to-secondary/80 rounded-xl flex items-center justify-center text-secondary-foreground font-bold text-sm shadow-md">
                              {(item.usuario_data?.first_name || item.nombres || 'D')[0]}{(item.usuario_data?.last_name || item.apellidos || 'R')[0]}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border border-background animate-pulse"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-foreground group-hover:text-secondary transition-colors truncate">
                              {item.usuario_data?.first_name || item.nombres} {item.usuario_data?.last_name || item.apellidos}
                            </h4>
                            <p className="text-secondary text-sm font-medium">{item.titulo}</p>
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <p className="text-xs truncate">{item.clinica_nombre}</p>
                            </div>
                            {item.especialidades_data && item.especialidades_data.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.especialidades_data.slice(0, 1).map((esp) => (
                                  <span key={esp.id} className="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded text-xs font-medium">
                                    {esp.nombre}
                                  </span>
                                ))}
                                {item.especialidades_data.length > 1 && (
                                  <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                                    +{item.especialidades_data.length - 1}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <div className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">Disponible</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">S/. {item.precio_consulta_base}</p>
                            <p className="text-xs text-muted-foreground">consulta</p>
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
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 gradient-servicios rounded-xl flex items-center justify-center shadow-md">
                    <Building2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">Clínicas</h3>
                    <p className="text-xs text-muted-foreground">Centros médicos disponibles</p>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {results.clinicas.length}
                  </div>
                </div>
                <div className="space-y-2">
                  {results.clinicas.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleClinicaClick(item)}
                      className="medical-card group relative p-3 bg-primary/5 hover:bg-primary/10 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg border border-primary/10 hover:border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                              {(item.nombre || 'C')[0]}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border border-background animate-pulse"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {item.nombre}
                            </h4>
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <p className="text-xs truncate">{item.direccion}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              {item.telefono && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  <p className="text-xs truncate">{item.telefono}</p>
                                </div>
                              )}
                              {item.email && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  <p className="text-xs truncate">{item.email}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2">
                          {item.activa ? (
                            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium">Activa</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                              <span className="text-xs font-medium">Inactiva</span>
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
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 gradient-informacion rounded-xl flex items-center justify-center shadow-md">
                    <Calendar className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">Citas Médicas</h3>
                    <p className="text-xs text-muted-foreground">Citas programadas en el sistema</p>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {results.citas.length}
                  </div>
                </div>
                <div className="space-y-2">
                  {results.citas.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleCitaClick(item)}
                      className="medical-card group relative p-3 bg-accent/50 hover:bg-accent/70 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg border border-accent/20 hover:border-accent/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent via-accent to-accent/80 rounded-xl flex items-center justify-center text-accent-foreground font-bold text-sm shadow-md">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-background animate-pulse"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.estado === 'CONFIRMADA' 
                                  ? 'bg-primary/10 text-primary'
                                  : item.estado === 'COMPLETADA'
                                  ? 'bg-secondary/10 text-secondary'
                                  : item.estado === 'CANCELADA'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {item.estado}
                              </span>
                            </div>
                            <h4 className="text-base font-semibold text-foreground group-hover:text-accent-foreground transition-colors truncate">
                              {item.motivo || 'Consulta médica'}
                            </h4>
                            <div className="flex items-center gap-4 text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="text-xs">{new Date(item.fecha).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="text-xs">{item.hora_inicio}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 text-right">
                          <p className="text-sm font-bold text-foreground">S/. {item.precio_consulta}</p>
                          <p className="text-xs text-muted-foreground">consulta</p>
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
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Sin resultados</h3>
            <p className="text-muted-foreground mb-2 text-lg">No se encontraron resultados para &quot;{searchTerm}&quot;</p>
            <p className="text-muted-foreground">
              Intenta buscar por especialidad, nombre del médico o servicio médico
            </p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-8">¿Qué estás buscando?</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="group p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 hover:from-blue-100 hover:via-blue-200 hover:to-indigo-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-especialidades rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Stethoscope className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-base font-bold text-primary mb-1">Especialidades</p>
                <p className="text-sm text-primary">Encuentra tu especialista</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-100 hover:from-emerald-100 hover:via-green-200 hover:to-emerald-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-medicos rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-base font-bold text-emerald-700 mb-1">Doctores</p>
                <p className="text-sm text-emerald-600">Conoce a nuestro equipo</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-purple-50 via-violet-100 to-purple-100 hover:from-purple-100 hover:via-violet-200 hover:to-purple-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-servicios rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-base font-bold text-purple-700 mb-1">Clínicas</p>
                <p className="text-sm text-purple-600">Centros médicos disponibles</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100 hover:from-orange-100 hover:via-amber-200 hover:to-orange-200 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-105">
                <div className="w-16 h-16 gradient-informacion rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-base font-bold text-orange-700 mb-1">Citas</p>
                <p className="text-sm text-orange-600">Gestión de citas médicas</p>
              </div>
            </div>
            <p className="text-muted-foreground text-base">
              Comienza escribiendo para buscar especialidades, doctores, clínicas o citas
            </p>
          </div>
        )}

        <div className="p-6 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-t border-gray-200/50 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground rounded-full shadow-lg">
              <Phone className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-bold">Emergencias 24/7</span>
            </div>
            <span className="text-lg font-bold text-destructive">(01) 234-5678</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Presiona</p>
            <kbd className="px-2 py-1 bg-gray-200 text-muted-foreground rounded font-mono text-sm shadow-sm">ESC</kbd>
            <p className="text-sm text-muted-foreground">para cerrar</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}
