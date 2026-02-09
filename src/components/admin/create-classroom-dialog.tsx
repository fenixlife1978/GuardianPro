'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateClassroomDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
}

const formSchema = z.object({
  grado: z.string().min(1, 'El grado es obligatorio.'),
  seccion: z.string().min(1, 'La sección es obligatoria.'),
  capacidad: z.coerce.number().optional(),
});

export function CreateClassroomDialog({
  isOpen,
  onOpenChange,
  institutionId,
}: CreateClassroomDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grado: '',
      seccion: '',
      capacidad: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore no está disponible.' });
      return;
    }
    setIsSubmitting(true);
    
    try {
        const classroomsRef = collection(firestore, 'institutions', institutionId, 'Aulas');
        const nombre_completo = `${values.grado} - Sección ${values.seccion}`;
        
        await addDocumentNonBlocking(classroomsRef, {
            institutionId,
            grado: values.grado,
            seccion: values.seccion,
            capacidad: values.capacidad || null,
            nombre_completo,
            isPublished: true, // Default to published
        });

        toast({ title: 'Éxito', description: `El aula "${nombre_completo}" ha sido creada.` });
        form.reset();
        onOpenChange(false);
    } catch (error) {
        console.error('Error creating classroom: ', error);
        toast({ variant: 'destructive', title: 'Error en Firestore', description: 'No se pudo crear el aula.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Aula</DialogTitle>
          <DialogDescription>
            Define el grado y la sección para una nueva aula.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="grado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1er Grado, Nivel Inicial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sección</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: A, B, Única" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="capacidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidad de Alumnos (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Creando...' : 'Crear Aula'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
