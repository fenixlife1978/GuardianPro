'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import type { Institution } from '@/lib/firestore-types';

const InstitutionCardSkeleton = () => (
    <Card className="flex flex-col hover:border-primary/50 transition-all">
        <CardHeader>
             <div className="flex items-start justify-between">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-16" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <div className="p-6 pt-0 mt-auto">
             <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-center">
                    <Skeleton className="h-3 w-10 mb-2" />
                    <Skeleton className="h-5 w-6 mx-auto" />
                </div>
                <div className="text-center">
                    <Skeleton className="h-3 w-12 mb-2" />
                    <Skeleton className="h-5 w-8 mx-auto" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    </Card>
)

export function InstitutionList() {
  const firestore = useFirestore();

  const institutionsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const { data: institutions, isLoading } = useCollection<Institution>(institutionsRef);
  
  if (isLoading) {
      return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <InstitutionCardSkeleton />
              <InstitutionCardSkeleton />
              <InstitutionCardSkeleton />
          </div>
      )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {institutions?.map((inst) => (
        <Card key={inst.id} className="flex flex-col hover:border-primary/50 transition-all">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                {inst.logoUrl ? (
                  <Image src={inst.logoUrl} alt={`Logo de ${inst.nombre}`} width={48} height={48} className="object-cover" />
                ) : (
                  <span className="text-muted-foreground font-bold text-xs">LOGO</span>
                )}
              </div>
              <Badge variant={inst.superAdminSuspended ? 'destructive' : 'secondary'} className={inst.superAdminSuspended ? '' : 'bg-green-500/10 text-green-400 border-green-500/20'}>
                {inst.superAdminSuspended ? 'Suspendida' : 'Activa'}
              </Badge>
            </div>
             <h3 className="text-lg font-bold text-card-foreground mb-1">{inst.nombre}</h3>
             {inst.direccion && <p className="text-xs text-muted-foreground">{inst.direccion}</p>}
          </CardHeader>
          <CardContent className="flex-grow" />
          <div className="p-6 pt-0 mt-auto">
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Aulas</p>
                <p className="font-bold text-card-foreground">0</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Equipos</p>
                <p className="font-bold text-card-foreground">0</p>
              </div>
              <Button variant="secondary" size="sm">
                GESTIONAR
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
