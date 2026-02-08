'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import imageCompression from 'browser-image-compression';

import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  direccion: z.string().optional(),
  logo: z.any().optional(),
  modoFiltro: z.enum(['Blacklist', 'Whitelist']),
});

interface CreateInstitutionFormProps {
  onFinished: () => void;
}

export function CreateInstitutionForm({ onFinished }: CreateInstitutionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      modoFiltro: 'Blacklist',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore no está disponible.' });
      return;
    }
    setIsSubmitting(true);

    let logoUrl = '';
    const logoFile = values.logo?.[0];

    if (logoFile) {
      const options = {
        maxSizeMB: 0.5, // 500KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(logoFile, options);
        // TODO: Upload compressedFile to Firebase Storage and get the URL
        // This is a placeholder. In a real app, you would upload and get the URL.
        logoUrl = 'https://picsum.photos/seed/logo/100/100';
        toast({ title: 'Logo Comprimido', description: `Nuevo tamaño: ${(compressedFile.size / 1024).toFixed(2)} KB` });
      } catch (error) {
        console.error('Error compressing image: ', error);
        toast({ variant: 'destructive', title: 'Error de Compresión', description: 'No se pudo procesar el logo.' });
      }
    }
    
    try {
        const institutionsRef = collection(firestore, 'institutions');
        await addDocumentNonBlocking(institutionsRef, {
            nombre: values.nombre,
            direccion: values.direccion || '',
            logoUrl: logoUrl,
            modoFiltro: values.modoFiltro,
            superAdminSuspended: false,
        });

        toast({ title: 'Éxito', description: `La institución "${values.nombre}" ha sido creada.` });
        onFinished();
    } catch (error) {
        console.error('Error creating institution: ', error);
        toast({ variant: 'destructive', title: 'Error en Firestore', description: 'No se pudo crear la institución.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Institución *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Colegio San Patricio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Av. Siempreviva 742" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="modoFiltro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modo de Filtro de Navegación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un modo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Blacklist">Lista Negra</SelectItem>
                  <SelectItem value="Whitelist">Lista Blanca</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Elige cómo se filtrarán las URLs para esta institución.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Institucional (Opcional)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" {...form.register('logo')} />
              </FormControl>
               <FormDescription className="text-xs italic">
                El logo se comprimirá automáticamente para ahorrar espacio.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Creando...' : 'Crear Institución'}
        </Button>
      </form>
    </Form>
  );
}
