'use client';

import { useState } from 'react';
import { Building, MoreVertical } from 'lucide-react';
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

type Institution = {
  id: string;
  name: string;
  classrooms: number;
  devices: number;
  suspended: boolean;
};

const mockInstitutions: Institution[] = [
  { id: 'inst_1', name: 'Colegio San Patricio', classrooms: 15, devices: 350, suspended: false },
  { id: 'inst_2', name: 'Liceo Francés', classrooms: 22, devices: 512, suspended: false },
  { id: 'inst_3', name: 'Escuela Americana', classrooms: 30, devices: 700, suspended: true },
  { id: 'inst_4', name: 'Instituto Cervantes', classrooms: 10, devices: 200, suspended: false },
];

export function InstitutionList() {
  const [institutions, setInstitutions] = useState<Institution[]>(mockInstitutions);

  const toggleSuspended = (id: string) => {
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id ? { ...inst, suspended: !inst.suspended } : inst
      )
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {institutions.map((inst) => (
        <Card key={inst.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-lg">
                    <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">{inst.name}</CardTitle>
                  <Badge variant={inst.suspended ? 'destructive' : 'secondary'} className="mt-1">
                    {inst.suspended ? 'Suspendida' : 'Activa'}
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
             <div className="flex justify-between text-sm text-muted-foreground">
                <span>Aulas</span>
                <span className="font-medium text-foreground">{inst.classrooms}</span>
             </div>
             <div className="flex justify-between text-sm text-muted-foreground">
                <span>Dispositivos</span>
                <span className="font-medium text-foreground">{inst.devices}</span>
             </div>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <div className="flex items-center space-x-2 p-3 rounded-md bg-secondary/50">
              <Switch
                id={`suspend-${inst.id}`}
                checked={inst.suspended}
                onCheckedChange={() => toggleSuspended(inst.id)}
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
