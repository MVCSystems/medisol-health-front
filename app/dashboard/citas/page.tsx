import ListadoCitas from '@/components/citas/ListadoCitas';
import { Suspense } from 'react';

export default function CitasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-24">
        <p className="text-muted-foreground">Cargando citas...</p>
      </div>
    }>
      <ListadoCitas />
    </Suspense>
  );
}