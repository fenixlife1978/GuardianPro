'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useMemo } from 'react';
import { validateMessageAction } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import type { Classroom, Device } from '@/lib/firestore-types';

const INSTITUTION_ID = 'colegio-san-patricio'; // Hardcoded for demo

const initialState = {
  validationResult: null,
  message: null,
  error: null,
};

function SubmitButton({disabled}: {disabled: boolean}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto">
      {pending ? 'Validando...' : <><Send className="mr-2 h-4 w-4" /> Enviar Mensaje</>}
    </Button>
  );
}

export function MessagingForm() {
  const [state, formAction] = useFormState(validateMessageAction, initialState);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  // Fetch devices and classrooms
  const devicesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions', INSTITUTION_ID, 'devices');
  }, [firestore]);
  const { data: devices, isLoading: devicesLoading } = useCollection<Device>(devicesRef);

  const classroomsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions', INSTITUTION_ID, 'classrooms');
  }, [firestore]);
  const { data: classrooms, isLoading: classroomsLoading } = useCollection<Classroom>(classroomsRef);

  const classroomMap = useMemo(() => {
    if (!classrooms) return new Map();
    return classrooms.reduce((map, classroom) => {
      map.set(classroom.id, classroom.name);
      return map;
    }, new Map<string, string>());
  }, [classrooms]);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    } else if (state.validationResult) {
      if (state.validationResult.isValid) {
        // Validation was successful, now send the message
        if (firestore && user && selectedDevice && state.message) {
            const messageRef = collection(firestore, 'institutions', INSTITUTION_ID, 'devices', selectedDevice, 'messages');
            addDocumentNonBlocking(messageRef, {
                deviceId: selectedDevice,
                senderId: user.uid,
                messageText: state.message,
                timestamp: serverTimestamp(),
                readConfirmation: false,
            });
            
            toast({
              title: 'Mensaje Enviado',
              description: `El mensaje ha sido enviado exitosamente.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Error al enviar',
                description: 'No se pudo enviar el mensaje. Faltan datos.',
            });
        }
      }
    }
  }, [state, toast, firestore, user, selectedDevice]);
  
  const isLoading = devicesLoading || classroomsLoading;

  return (
    <form action={formAction} className="space-y-6">
       <div className="grid gap-2">
            <Label htmlFor="student-select">Seleccionar Estudiante/Dispositivo</Label>
            <Select name="deviceId" onValueChange={setSelectedDevice} value={selectedDevice} disabled={isLoading}>
                <SelectTrigger id="student-select">
                    <SelectValue placeholder={isLoading ? "Cargando dispositivos..." : "Selecciona un destinatario"} />
                </SelectTrigger>
                <SelectContent>
                    {devices?.map(device => (
                        <SelectItem key={device.id} value={device.id}>
                            {`Dispositivo ${device.id.substring(0,4)} - ${device.studentName} (${classroomMap.get(device.classroomId) || 'Aula desconocida'})`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
       </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Escribe un mensaje para el estudiante..."
          rows={5}
          required
        />
        <p className="text-sm text-muted-foreground">
            El mensaje será validado por IA para asegurar que es apropiado antes de ser enviado.
        </p>
      </div>

      {state.validationResult && !state.validationResult.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Mensaje no apropiado</AlertTitle>
          <AlertDescription>
            {state.validationResult.reason || 'El mensaje no cumple con las políticas de comunicación.'}
          </AlertDescription>
        </Alert>
      )}

      {state.validationResult && state.validationResult.isValid && (
         <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Mensaje Aprobado</AlertTitle>
          <AlertDescription>
            El mensaje ha sido validado y enviado correctamente.
          </AlertDescription>
        </Alert>
      )}

      <SubmitButton disabled={isLoading || !selectedDevice} />
    </form>
  );
}
