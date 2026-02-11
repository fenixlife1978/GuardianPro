'use client';

import { useInstitution } from '@/app/(admin)/institution-context';
import { StudentsTable } from '@/components/admin/students-table';
import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Classroom } from '@/lib/firestore-types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdminUserNav } from '@/components/common/admin-user-nav';

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

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-72" />
                        </>
                    ) : (
                         <>
                            <h1 className="text-2xl font-black text-slate-800">{classroom?.nombre_completo || 'Aula'}</h1>
                            <p className="text-slate-500 text-sm">Gestiona los alumnos y dispositivos de esta aula.</p>
                        </>
                    )}
                </div>
                <div className='flex items-center gap-4'>
                    <Button className="rounded-xl shadow-lg shadow-blue-200">
                        <Plus className="w-5 h-5" />
                        Añadir Alumno
                    </Button>
                    <AdminUserNav />
                </div>
            </header>
            <StudentsTable institutionId={institutionId!} classroomId={classroomId} />
        </div>
    )
}
