'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { validateMessageAction } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialState = {
  validationResult: null,
  message: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Validando...' : <><Send className="mr-2 h-4 w-4" /> Enviar Mensaje</>}
    </Button>
  );
}

export function MessagingForm() {
  const [state, formAction] = useFormState(validateMessageAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    } else if (state.validationResult) {
      if (state.validationResult.isValid) {
        toast({
          title: 'Mensaje Enviado',
          description: `El mensaje ha sido enviado exitosamente.`,
        });
      }
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
       <div className="grid gap-2">
            <Label htmlFor="student-select">Seleccionar Estudiante/Dispositivo</Label>
            <Select>
                <SelectTrigger id="student-select">
                    <SelectValue placeholder="Selecciona un destinatario" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="device-1">Tablet 01 - Juan Pérez (Aula 3B)</SelectItem>
                    <SelectItem value="device-2">Tablet 02 - Maria García (Aula 3B)</SelectItem>
                    <SelectItem value="device-3">Tablet 03 - Pedro Rodríguez (Aula 4A)</SelectItem>
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

      <SubmitButton />
    </form>
  );
}
