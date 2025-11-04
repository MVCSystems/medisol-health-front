import { useState, useEffect } from 'react';

/**
 * Hook genérico para peticiones fetch con loading y error.
 * @param fetcher función que retorna una promesa (ej: servicio)
 * @param deps dependencias para volver a ejecutar el fetch
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
