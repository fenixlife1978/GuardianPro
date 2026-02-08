'use client';

import { useInstitution } from '@/app/(admin)/institution-context';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { StudentsTable } from '@/components/admin/students-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { Classroom } from '@/lib/firestore-types';

export default function ClassroomDetailPage() {
    const params = useParams();
    const classroomId = params.classroomId as string;
    const { institutionId } = useInstitution();
    const firestore = useFirestore();

    const classroomRef = useMemoFirebase(() => {
        if (!firestore || !institutionId || !classroomId) return null;
        return doc(firestore, 'institutions', institutionId, 'Aulas', classroomId);
    }, [firestore, institutionId, classroomId]);
    
    const { data: classroom, isLoading } = useDoc<Classroom>(classroomRef);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (!classroom) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No se pudo encontrar el aula o no tienes permiso para verla.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Aula: {classroom.nombre_aula}</h2>
                <p className="text-muted-foreground">Lista de alumnos y dispositivos inscritos en esta aula.</p>
            </div>
            <StudentsTable institutionId={institutionId!} classroomId={classroomId} />
        </div>
    )
}
