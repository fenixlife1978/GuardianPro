'use client';
import { useInstitution } from "@/app/(admin)/institution-context";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import type { Institution } from "@/lib/firestore-types";
import { Button } from "../ui/button";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export function DashboardHeader() {
  const { institutionId } = useInstitution();
  const firestore = useFirestore();

  const institutionRef = useMemoFirebase(() => {
    if (!firestore || !institutionId) return null;
    return doc(firestore, 'institutions', institutionId);
  }, [firestore, institutionId]);

  const { data: institution, isLoading } = useDoc<Institution>(institutionRef);

  const today = format(new Date(), 'dd / MM / yyyy');

  return (
    <div className="flex-1 flex items-center justify-between">
      {isLoading ? (
        <Skeleton className="h-6 w-72" />
      ) : (
        <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
          {institution?.nombre || 'Institución no encontrada'}
        </h2>
      )}
      <div className="hidden md:flex items-center gap-2">
        <Button variant="outline" className="h-9 gap-2">
            <span>{today}</span>
            <Clock className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
