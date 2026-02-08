"use client";

import { useMemo, type DependencyList } from 'react';

/**
 * A hook to memoize Firestore queries and references to prevent unnecessary re-renders in hooks like `useDoc` and `useCollection`.
 * It's a typed wrapper around React's `useMemo` with the dependency array check disabled for convenience, 
 * as Firebase SDK objects are often complex.
 * 
 * @param factory A function that creates the Firebase query or reference.
 * @param deps An array of dependencies that, when changed, will cause the factory function to re-run.
 * @returns The memoized value.
 */
export function useMemoFirebase<T>(factory: () => T | null, deps: DependencyList): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
