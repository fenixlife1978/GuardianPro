'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Alumno } from '@/lib/firestore-types';

interface EditStudentModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    student: Alumno | null;
    institutionId: string;
    classroomId: string;
}

const formSchema = z.object({
  nombre_alumno: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
});

export function EditStudentModal({ isOpen, onOpenChange, student, institutionId, classroomId }: EditStudentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    
    useEffect(() => {
        if (student) {
            form.setValue('nombre_alumno', student.nombre_alumno);
        }
    }, [student, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !student) return;

        setIsSubmitting(true);
        const studentDocRef = doc(firestore, 'institutions', institutionId, 'Aulas', classroomId, 'Alumnos', student.id);
        
        try {
            updateDocumentNonBlocking(studentDocRef, {
                nombre_alumno: values.nombre_alumno,
            });
            toast({ title: 'Alumno actualizado', description: `El nombre se ha cambiado a "${values.nombre_alumno}".` });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el alumno.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!student) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Alumno</DialogTitle>
                    <DialogDescription>
                        Puedes reasignar este dispositivo cambiando el nombre del alumno.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="nombre_alumno"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Alumno</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre y Apellido" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
