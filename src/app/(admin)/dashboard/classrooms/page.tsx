'use client';

import { GraduationCap } from "lucide-react";

export default function ClassroomsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-xl">
        <GraduationCap className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Selecciona un Aula</h2>
        <p>Elige un aula de la barra lateral para ver los alumnos y dispositivos inscritos.</p>
    </div>
  );
}
