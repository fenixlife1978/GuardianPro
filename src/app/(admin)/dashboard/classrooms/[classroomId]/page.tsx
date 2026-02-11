'use client';

import { useEffect, useState, useRef } from 'react';
import { useInstitution } from '@/app/(admin)/institution-context';
import { StudentsTable } from '@/components/admin/students-table';
import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import type { Classroom, PendingEnrollment } from '@/lib/firestore-types';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminUserNav } from '@/components/common/admin-user-nav';
import EnrollmentQR from '@/components/admin/EnrollmentQR'; 
import { useToast } from '@/hooks/use-toast';
import { EnrollmentModal } from '@/components/admin/enrollment-modal';

export default function ClassroomDetailPage() {
    const params = useParams();
    const classroomId = params.classroomId as string;
    const { institutionId } = useInstitution();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeEnrollment, setActiveEnrollment] = useState<{ id: string; data: PendingEnrollment } | null>(null);
    const modalOpenRef = useRef(isModalOpen);

    useEffect(() => {
        modalOpenRef.current = isModalOpen;
    }, [isModalOpen]);

    const classroomRef = useMemoFirebase(() => {
        if (!firestore || !institutionId || !classroomId) return null;
        return doc(firestore, 'institutions', institutionId, 'Aulas', classroomId);
    }, [firestore, institutionId, classroomId]);
    
    const { data: classroom, isLoading } = useDoc<Classroom>(classroomRef);

    // Listener para detectar nuevas tablets intentando inscribirse [cite: 2026-01-27]
    useEffect(() => {
        if (!firestore || !institutionId || !classroomId) return;

        // Escuchamos la colección de inscripciones pendientes
        const q = query(
            collection(firestore, 'pending_enrollments'),
            where('activeId', '==', institutionId),
            where('workingCondoId', '==', classroomId),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !modalOpenRef.current) {
                    const docData = change.doc.data();
                    console.log('Nueva tablet detectada:', docData);
                    
                    toast({
                        title: "Dispositivo detectado",
                        description: `Un nuevo dispositivo está listo para ser confirmado.`,
                    });

                    // Adapt data for the modal, which expects 'classroomId' and 'createdAt'
                    const pendingDataForModal: PendingEnrollment = {
                        classroomId: docData.workingCondoId,
                        deviceInfo: docData.deviceInfo,
                        createdAt: docData.timestamp, 
                    };
                    
                    setActiveEnrollment({ id: change.doc.id, data: pendingDataForModal });
                    setIsModalOpen(true);
                }
            });
        });

        return () => unsubscribe();
    }, [firestore, institutionId, classroomId, toast]);

    const handleEnrollmentConfirmed = () => {
        setIsModalOpen(false);
        setActiveEnrollment(null);
        toast({
            title: "Éxito",
            description: "El dispositivo ha sido enrolado y configurado exitosamente.",
        });
    }

    return (
        <>
            {institutionId && activeEnrollment && (
                <EnrollmentModal 
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    enrollmentId={activeEnrollment.id}
                    pendingEnrollment={activeEnrollment.data}
                    onConfirmed={handleEnrollmentConfirmed}
                    institutionId={institutionId}
                />
            )}
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
                        <AdminUserNav />
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <StudentsTable institutionId={institutionId!} classroomId={classroomId} />
                    </div>

                    <div className="xl:col-span-1">
                        {institutionId && classroomId && (
                            <EnrollmentQR 
                                activeId={institutionId} 
                                workingCondoId={classroomId} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
