import { InstitutionList } from '@/components/super-admin/institution-list';
import { Logo } from '@/components/common/logo';
import { UserNav } from '@/components/common/user-nav';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
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
                <h2 className="text-3xl font-bold tracking-tight">Panel de Super Administrador</h2>
                <p className="text-muted-foreground">Gestiona todas las instituciones en la plataforma.</p>
            </div>
            <Button asChild variant="outline">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Ir al Panel de Admin
                </Link>
            </Button>
        </div>
        <InstitutionList />
      </main>
    </div>
  );
}
