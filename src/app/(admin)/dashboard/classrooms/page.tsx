'use client';

import { useState, useMemo } from 'react';
import { useInstitution } from '@/app/(admin)/institution-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Classroom } from '@/lib/firestore-types';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, Building, Loader2 } from 'lucide-react';
import { CreateClassroomDialog } from '@/components/admin/create-classroom-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ClassroomsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { institutionId } = useInstitution();
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  const classroomsRef = useMemoFirebase(() => {
    if (!firestore || !institutionId) return null;
    return query(
        collection(firestore, 'institutions', institutionId, 'Aulas'),
        orderBy('grado'),
        orderBy('seccion')
    );
  }, [firestore, institutionId]);

  const { data: classrooms, isLoading } = useCollection<Classroom>(classroomsRef);

  const groupedClassrooms = useMemo(() => {
    if (!classrooms) return {};
    return classrooms.reduce((acc, classroom) => {
      const { grado } = classroom;
      if (!acc[grado]) {
        acc[grado] = [];
      }
      acc[grado].push(classroom);
      return acc;
    }, {} as Record<string, Classroom[]>);
  }, [classrooms]);

  const createLink = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${path}?${params.toString()}`;
  }

  return (
    <>
      <CreateClassroomDialog 
        isOpen={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        institutionId={institutionId!} 
      />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestión de Aulas</h2>
            <p className="text-muted-foreground">Crea, edita y organiza los grados y secciones de la institución.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2" />
            Crear Aula
          </Button>
        </div>

        {isLoading && (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}

        {!isLoading && classrooms && classrooms.length > 0 && (
            <Accordion type="multiple" className="w-full" defaultValue={Object.keys(groupedClassrooms)}>
                {Object.entries(groupedClassrooms).map(([grade, rooms]) => (
                    <AccordionItem value={grade} key={grade}>
                        <AccordionTrigger className="text-lg font-semibold capitalize">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {grade}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2 pl-4">
                                {rooms.map(room => (
                                    <Link key={room.id} href={createLink(`/dashboard/classrooms/${room.id}`)}>
                                        <div className="block p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <GraduationCap className="h-6 w-6 text-primary" />
                                                <div>
                                                    <p className="font-semibold">{room.nombre_completo}</p>
                                                    <p className="text-sm text-muted-foreground">Capacidad: {room.capacidad || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        )}

        {!isLoading && (!classrooms || classrooms.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-xl mt-12">
                <GraduationCap className="h-16 w-16 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No hay aulas creadas</h2>
                <p>Usa el botón "Crear Aula" para empezar a organizar la institución.</p>
            </div>
        )}
      </div>
    </>
  );
}
