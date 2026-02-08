'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, doc, DocumentReference, DocumentData, FirestoreError } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';


export const useDoc = <T extends DocumentData>(docRef: DocumentReference | null) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | null>(null);

    useEffect(() => {
        if (!docRef) {
            setData(null);
            setLoading(false);
            return;
        }
        
        const unsubscribe = onSnapshot(docRef, 
            (snapshot) => {
                if (snapshot.exists()) {
                    setData({ id: snapshot.id, ...snapshot.data() } as T);
                } else {
                    setData(null);
                }
                setLoading(false);
            },
            (err) => {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
                
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [docRef]);

    return { data, loading, error };
};
