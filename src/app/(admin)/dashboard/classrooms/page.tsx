'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInstitution } from '../../institution-context';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, School, Users } from 'lucide-react';
import type { Classroom } from '@/lib/firestore-types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  nombre_aula: z.string().min(1, 'El nombre del aula es obligatorio.'),
  capacidad: z.coerce.number().optional(),
});

function CreateClassroomCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { institutionId } = useInstitution();
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_aula: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !institutionId) return;

    setIsSubmitting(true);
    const aulasRef = collection(firestore, 'institutions', institutionId, 'Aulas');
    
    try {
      await addDocumentNonBlocking(aulasRef, {
        ...values,
        institutionId: institutionId,
        isPublished: false, // Default value
      });
      toast({ title: 'Aula creada', description: `El aula "${values.nombre_aula}" ha sido creada.` });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el aula.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Aula</CardTitle>
        <CardDescription>Añade un nuevo sector o aula a la institución.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre_aula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Aula</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sala de 5to Grado" {...field} />
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
                  <FormLabel>Capacidad (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Crear Aula
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ClassroomList() {
    const { institutionId } = useInstitution();
    const firestore = useFirestore();

    const classroomsRef = useMemoFirebase(() => {
        if (!firestore || !institutionId) return null;
        return collection(firestore, 'institutions', institutionId, 'Aulas');
    }, [firestore, institutionId]);

    const { data: classrooms, isLoading } = useCollection<Classroom>(classroomsRef);

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="flex justify-end">
                            <Skeleton className="h-10 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }
    
    if (!classrooms || classrooms.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <School className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No hay aulas creadas</h3>
                <p className="mt-1 text-sm">Empieza por crear la primera aula de esta institución.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classrooms.map(classroom => (
                <Card key={classroom.id}>
                    <CardHeader>
                        <CardTitle className="truncate">{classroom.nombre_aula}</CardTitle>
                        {classroom.capacidad && (
                            <CardDescription className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Capacidad para {classroom.capacidad} alumnos
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="flex justify-end">
                         <Button asChild>
                            <Link href={`/dashboard/classrooms/${classroom.id}`}>
                                Ver Alumnos
                            </Link>
                         </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default function ClassroomsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Aulas</h2>
        <p className="text-muted-foreground">Crea y administra las aulas de la institución.</p>
      </div>
      <CreateClassroomCard />
      <div className="space-y-4">
        <h3 className="text-2xl font-bold tracking-tight">Aulas Existentes</h3>
        <ClassroomList />
      </div>
    </div>
  );
}
