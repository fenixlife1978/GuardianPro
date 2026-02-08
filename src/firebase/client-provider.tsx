'use client';

import React, { useState, useEffect } from 'react';
import { FirebaseProvider, type FirebaseServices } from './provider';
import { initializeFirebase } from './index';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// This provider ensures Firebase is initialized only once on the client.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // Initialize Firebase and store the instances in state.
    const services = initializeFirebase();
    setFirebaseServices(services);
  }, []);

  if (!firebaseServices) {
    // You can render a loading state here if needed
    return null;
  }

  return (
    <FirebaseProvider {...firebaseServices}>
        <FirebaseErrorListener />
        {children}
    </FirebaseProvider>
  );
}
