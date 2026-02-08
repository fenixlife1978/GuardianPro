'use client';

import { Building, MoreVertical, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Institution } from '@/lib/firestore-types';


const InstitutionCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                     <Skeleton className="h-12 w-12 rounded-lg" />
                     <div className='space-y-2'>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-16" />
                     </div>
                </div>
                 <Skeleton className="h-8 w-8" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
            </div>
        </CardContent>
        <div className="p-6 pt-0 mt-auto">
            <Skeleton className="h-10 w-full" />
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

  const toggleSuspended = (id: string, currentStatus: boolean) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'institutions', id);
    updateDocumentNonBlocking(docRef, { superAdminSuspended: !currentStatus });
  };
  
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
        <Card key={inst.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-lg">
                    <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">{inst.name}</CardTitle>
                  <Badge variant={inst.superAdminSuspended ? 'destructive' : 'secondary'} className="mt-1">
                    {inst.superAdminSuspended ? 'Suspendida' : 'Activa'}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                  <DropdownMenuItem>Administrar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
             {/* Note: classroom and device counts require aggregation, removed for now */}
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <div className="flex items-center space-x-2 p-3 rounded-md bg-secondary/50">
              <Switch
                id={`suspend-${inst.id}`}
                checked={inst.superAdminSuspended}
                onCheckedChange={() => toggleSuspended(inst.id, inst.superAdminSuspended)}
                aria-label={`Suspender ${inst.name}`}
              />
              <Label htmlFor={`suspend-${inst.id}`} className="font-medium cursor-pointer">
                Suspender Institución
              </Label>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
