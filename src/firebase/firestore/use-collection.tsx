'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, startAfter, Query, DocumentData, FirestoreError, CollectionReference } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export interface UseCollectionOptions {
    where?: [string, '==', any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
    startAfter?: any;
}

export const useCollection = <T extends DocumentData>(
    collectionRef: CollectionReference | null,
    options: UseCollectionOptions = {}
) => {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | null>(null);

    useEffect(() => {
        if (!collectionRef) {
            setLoading(false);
            return;
        }

        let q: Query = collectionRef;

        if (options.where) {
            options.where.forEach(([field, op, value]) => {
                q = query(q, where(field, op, value));
            });
        }
        if (options.orderBy) {
            q = query(q, orderBy(...options.orderBy));
        }
        if (options.limit) {
            q = query(q, limit(options.limit));
        }
        if (options.startAfter) {
            q = query(q, startAfter(options.startAfter));
        }
        
        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setData(docs);
                setLoading(false);
            },
            (err) => {
                const permissionError = new FirestorePermissionError({
                    path: collectionRef.path,
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);

                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionRef, JSON.stringify(options)]); // Deep comparison for options

    return { data, loading, error };
};
