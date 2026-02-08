'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type InstitutionContextType = {
  institutionId: string | null;
};

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const InstitutionProvider = ({ children }: { children: ReactNode }) => {
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    const fetchInstitutionId = async () => {
      setLoading(true);
      setError(null);
      const idFromParams = searchParams.get('institutionId');

      // Case 1: Super admin or anyone is navigating with a specific institutionId in the URL.
      // This is the primary way to identify the institution.
      if (idFromParams) {
        setInstitutionId(idFromParams);
        setLoading(false);
        return; // Exit successfully.
      }

      // If we reach here, it means no institutionId was in the URL.
      // Now, we handle other cases.
      if (user && firestore) {
        // Case 2: The Super Admin is accessing /dashboard directly *without* an institutionId param.
        // This is an error because the super admin must always specify which institution to manage.
        if (user.uid === 'QeGMDNE4GaSJOU8XEnY3lFJ9by13') {
             setError('No se ha especificado una institución.');
        } else {
            // Case 3: A regular admin user is accessing /dashboard directly.
            // We need to fetch their assigned institutionId from their user profile.
            try {
              const userDocRef = doc(firestore, 'users', user.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists() && userDocSnap.data().institutionId) {
                setInstitutionId(userDocSnap.data().institutionId);
              } else {
                setError('Tu cuenta de administrador no está asociada a ninguna institución.');
              }
            } catch (e) {
              console.error("Error fetching user's institution:", e);
              setError('No se pudo verificar la información de tu institución.');
            }
        }
      }
      setLoading(false);
    };

    if (!userLoading) {
      fetchInstitutionId();
    }
  }, [searchParams, user, userLoading, firestore]);

  if (loading || userLoading) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }
  
  if (error || !institutionId) {
      return (
          <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Acceso Denegado</AlertTitle>
              <AlertDescription>
                {error || 'No se pudo determinar la institución a gestionar.'}
                {user?.uid === 'QeGMDNE4GaSJOU8XEnY3lFJ9by13' && (
                    <div className="mt-4">
                        <Button asChild>
                            <Link href="/super-admin">
                                Ir al Panel Maestro
                            </Link>
                        </Button>
                    </div>
                )}
              </AlertDescription>
          </Alert>
      )
  }

  return (
    <InstitutionContext.Provider value={{ institutionId }}>
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = (): InstitutionContextType => {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
};
