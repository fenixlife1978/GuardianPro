'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import type { Institution } from '@/lib/firestore-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';

const InstitutionTableSkeleton = () => (
    <Card className="bg-slate-800 border-slate-700">
        <Table>
            <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800">
                    <TableHead className="text-white">Institución</TableHead>
                    <TableHead className="text-white">ID de Institución</TableHead>
                    <TableHead className="text-center text-white">Aulas</TableHead>
                    <TableHead className="text-white">Estado</TableHead>
                    <TableHead className="text-right text-white">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(3)].map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg bg-slate-700" /><Skeleton className="h-5 w-32 bg-slate-700" /></div></TableCell>
                        <TableCell><Skeleton className="h-4 w-48 bg-slate-700" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto bg-slate-700" /></TableCell>
                        <TableCell><div className="flex items-center gap-2"><Skeleton className="h-6 w-11 rounded-full bg-slate-700" /><Skeleton className="h-5 w-16 bg-slate-700" /></div></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-9 w-24 bg-slate-700" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
);

export function InstitutionList() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const institutionsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const { data: institutions, isLoading } = useCollection<Institution>(institutionsRef);
  
  const handleStatusChange = (institutionId: string, isSuspended: boolean) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar a la base de datos.' });
        return;
    };
    const institutionRef = doc(firestore, 'institutions', institutionId);
    updateDocumentNonBlocking(institutionRef, {
      superAdminSuspended: isSuspended,
    });
    toast({ title: 'Estado actualizado', description: `La institución ha sido ${isSuspended ? 'desactivada' : 'activada'}.` });
  };

  if (isLoading) {
      return <InstitutionTableSkeleton />;
  }
  
  if (!institutions || institutions.length === 0) {
      return (
          <div className="text-center py-16 text-slate-400 bg-slate-800 border border-slate-700 rounded-2xl">
              <h3 className="text-xl font-bold text-white">No hay instituciones</h3>
              <p className="mt-2">Empieza por crear la primera institución educativa.</p>
          </div>
      )
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
        <Table>
            <TableHeader>
                <TableRow className="border-b-slate-700 hover:bg-slate-800">
                    <TableHead className="text-slate-400">Institución</TableHead>
                    <TableHead className="text-slate-400">ID de Institución (activeId)</TableHead>
                    <TableHead className="text-center text-slate-400">Aulas</TableHead>
                    <TableHead className="text-slate-400">Estado</TableHead>
                    <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {institutions?.map((inst) => (
                    <TableRow key={inst.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                                    {inst.logoUrl ? (
                                    <Image src={inst.logoUrl} alt={`Logo de ${inst.nombre}`} width={40} height={40} className="object-cover" />
                                    ) : (
                                    <span className="text-slate-500 font-bold text-xs">LOGO</span>
                                    )}
                                </div>
                                <span className="font-medium text-white">{inst.nombre}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-mono text-xs text-slate-400">{inst.id}</div>
                        </TableCell>
                        <TableCell className="text-center font-medium">0</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id={`switch-${inst.id}`}
                                    checked={!inst.superAdminSuspended}
                                    onCheckedChange={(checked) => handleStatusChange(inst.id, !checked)}
                                />
                                <Badge variant={inst.superAdminSuspended ? 'destructive' : 'secondary'} className={!inst.superAdminSuspended ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-destructive/10 text-destructive-foreground'}>
                                    {inst.superAdminSuspended ? 'Inactiva' : 'Activa'}
                                </Badge>
                            </div>
                        </TableCell>
                         <TableCell className="text-right">
                            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                <Link href={`/dashboard?institutionId=${inst.id}`}>
                                    Gestionar
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
  );
}
