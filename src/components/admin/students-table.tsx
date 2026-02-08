'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { isSameDay } from 'date-fns';
import { Alumno } from '@/lib/firestore-types';
import { EditStudentModal } from './edit-student-modal';

interface StudentsTableProps {
    institutionId: string;
    classroomId: string;
}

const getTodayInfractions = (student: Alumno) => {
    if (!student.logs_actividad) return 0;
    const today = new Date();
    return student.logs_actividad.filter(log => log.date && isSameDay(log.date.toDate(), today)).length;
}

export function StudentsTable({ institutionId, classroomId }: StudentsTableProps) {
    const [editingStudent, setEditingStudent] = useState<Alumno | null>(null);
    const firestore = useFirestore();

    const studentsRef = useMemoFirebase(() => {
        if (!firestore || !institutionId || !classroomId) return null;
        return collection(firestore, 'institutions', institutionId, 'Aulas', classroomId, 'Alumnos');
    }, [firestore, institutionId, classroomId]);
    
    const { data: students, isLoading } = useCollection<Alumno>(studentsRef);

    return (
        <>
            <EditStudentModal
                isOpen={!!editingStudent}
                onOpenChange={(open) => !open && setEditingStudent(null)}
                student={editingStudent}
                institutionId={institutionId}
                classroomId={classroomId}
            />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Nro. Equipo</TableHead>
                            <TableHead>Nombre del Alumno</TableHead>
                            <TableHead>Dispositivo</TableHead>
                            <TableHead className="text-center">Infracciones (Hoy)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && students?.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="font-mono font-bold">#{student.nro_equipo}</TableCell>
                                <TableCell className="font-medium">{student.nombre_alumno}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    <div>{student.modelo}</div>
                                    <div className="font-mono">{student.macAddress}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={getTodayInfractions(student) > 0 ? 'destructive' : 'secondary'}>
                                        {getTodayInfractions(student)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                                                Editar Alumno
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             {!isLoading && students?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border border-t-0 rounded-b-md">
                    <User className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No hay alumnos en esta aula</h3>
                    <p className="mt-1 text-sm">Inscribe el primer dispositivo desde la sección de Inscripción.</p>
                </div>
            )}
        </>
    )
}
