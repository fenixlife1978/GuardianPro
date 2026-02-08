'use client';

import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { CreateInstitutionDialog } from '@/components/super-admin/create-institution-dialog';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InstitutionList } from '@/components/super-admin/institution-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <CreateInstitutionDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <div className="min-h-screen w-full bg-slate-900 text-white">
        <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900">
            <div className="container flex h-16 items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4">
                    {user?.email && <span className="text-xs text-slate-400 font-mono hidden sm:inline">{user.email}</span>}
                    <Avatar className="h-8 w-8 border border-blue-500">
                        <AvatarImage src={user?.photoURL || undefined} alt="Avatar" />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
        <main className="container py-8">
            <div className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Panel de Control Maestro</h1>
                  <p className="text-slate-400">Gestión global de instituciones educativas</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
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
