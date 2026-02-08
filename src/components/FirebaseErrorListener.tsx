'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { AlertCircle } from 'lucide-react';

// This component is responsible for listening to global Firebase errors
// and displaying them to the user in a consistent way.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.toMetric());

      // Throw the error in development to leverage the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // In production, show a generic toast
        toast({
          variant: 'destructive',
          title: 'Error de Permiso',
          description: 'No tienes permiso para realizar esta acción.',
        });
      }
    };

    const handleError = (error: Error) => {
        console.error("Unhandled Firebase Error:", error);
        toast({
            variant: "destructive",
            title: "Error Inesperado",
            description: "Ocurrió un error. Por favor, intenta de nuevo.",
        });
    }

    errorEmitter.on('permission-error', handlePermissionError);
    errorEmitter.on('error', handleError);


    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
      errorEmitter.off('error', handleError);
    };
  }, [toast]);

  return null;
}
