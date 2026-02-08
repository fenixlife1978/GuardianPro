'use client';

import { InstitutionList } from '@/components/super-admin/institution-list';
import { Logo } from '@/components/common/logo';
import { UserNav } from '@/components/common/user-nav';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { CreateInstitutionDialog } from '@/components/super-admin/create-institution-dialog';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/super-admin');
      } else if (user.uid !== 'QeGMDNE4GaSJOU8XEnY3lFJ9by13') {
        // Not a super admin, redirect to regular dashboard
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.uid !== 'QeGMDNE4GaSJOU8XEnY3lFJ9by13') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <CreateInstitutionDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <div className="min-h-screen w-full bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Logo />
            <UserNav />
          </div>
        </header>
        <main className="container py-8">
          <div className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight">Panel de Control Maestro</h1>
                  <p className="text-muted-foreground">Gestión global de instituciones educativas</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Ir al Panel de Admin
                    </Link>
                </Button>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Institución
                </Button>
              </div>
          </div>
          <InstitutionList />
        </main>
      </div>
    </>
  );
}
