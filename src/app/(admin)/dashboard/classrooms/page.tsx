'use client';

import { useState, useMemo } from 'react';
import { useInstitution } from '@/app/(admin)/institution-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import type { Classroom } from '@/lib/firestore-types';
import { Button } from '@/components/ui/button';
import { Plus, Building, Loader2, School } from 'lucide-react';
import { CreateClassroomDialog } from '@/components/admin/create-classroom-dialog';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import React from 'react';

// A small component to fetch and display student count
const StudentCount = ({ institutionId, classroomId }: { institutionId: string; classroomId: string }) => {
    const [count, setCount] = useState(0);
    const firestore = useFirestore();

    React.useEffect(() => {
        const fetchCount = async () => {
            if (!firestore) return;
            const studentsRef = collection(firestore, 'institutions', institutionId, 'Aulas', classroomId, 'Alumnos');
            const snapshot = await getDocs(studentsRef);
            setCount(snapshot.size);
        };
        fetchCount();
    }, [firestore, institutionId, classroomId]);

    return (
        <span className="text-xs font-bold text-slate-400">{count} Alumnos Registrados</span>
    );
};


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
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-slate-800">Gestión de Aulas</h1>
                <p className="text-slate-500 text-sm">Crea y administra los sectores de estudio.</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nueva Aula
            </Button>
        </header>

        {isLoading && (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isLoading && classrooms?.map(room => (
                <Card key={room.id} className="rounded-2xl hover:shadow-xl hover:border-blue-300 transition-all group">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-blue-50 transition-all">
                                <School className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                            </div>
                             <span className={`text-[10px] font-black px-2 py-1 rounded ${room.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                {room.isPublished ? 'PUBLICADO' : 'NO PUBLICADO'}
                             </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 !mt-0">{room.nombre_completo}</h3>
                        {room.capacidad && <p className="text-sm text-slate-400 !mt-1">Capacidad: {room.capacidad} Estudiantes</p>}
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <StudentCount institutionId={institutionId!} classroomId={room.id} />
                        <Button asChild variant="link" className="font-bold text-sm p-0 h-auto text-blue-600">
                            <Link href={createLink(`/dashboard/classrooms/${room.id}`)}>
                                Gestionar &rarr;
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>

        {!isLoading && (!classrooms || classrooms.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-xl mt-12">
                <Building className="h-16 w-16 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No hay aulas creadas</h2>
                <p>Usa el botón "Nueva Aula" para empezar a organizar la institución.</p>
            </div>
        )}
      </div>
    </>
  );
}
