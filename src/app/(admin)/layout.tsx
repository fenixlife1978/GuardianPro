'use client';

import {
  GraduationCap,
  Home,
  QrCode,
  Settings,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, redirect, useSearchParams } from 'next/navigation';
import { AdminUserNav } from '@/components/common/admin-user-nav';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useEffect, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/common/logo';
import { InstitutionProvider, useInstitution } from './institution-context';
import { collection } from 'firebase/firestore';
import type { Classroom, Institution } from '@/lib/firestore-types';
import { DashboardHeader } from '@/components/admin/dashboard-header';

const AdminSidebar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const institutionId = searchParams.get('institutionId');
    const isActive = (path: string) => pathname === path;
    const { institutionId: contextInstitutionId } = useInstitution();
    const firestore = useFirestore();

    const createLink = (path: string) => {
        const params = new URLSearchParams();
        if (institutionId) {
            params.set('institutionId', institutionId);
        }
        const queryString = params.toString();
        return `${path}${queryString ? `?${queryString}` : ''}`;
    }

    const classroomsRef = useMemoFirebase(() => {
        if (!firestore || !contextInstitutionId) return null;
        return collection(firestore, 'institutions', contextInstitutionId, 'Aulas');
    }, [firestore, contextInstitutionId]);

    const { data: classrooms, isLoading: classroomsLoading } = useCollection<Classroom>(classroomsRef);

    return (
        <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <Logo />
              </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className='flex justify-between'>
                        GRADO 1° <ChevronDown size={16} />
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {classroomsLoading && (
                            <>
                                <Skeleton className='h-8 w-full' />
                                <Skeleton className='h-8 w-full' />
                            </>
                        )}
                        {classrooms?.map(classroom => (
                            <SidebarMenuItem key={classroom.id}>
                                <SidebarMenuButton asChild isActive={isActive(`/dashboard/classrooms/${classroom.id}`)} tooltip={classroom.nombre_aula}>
                                    <Link href={createLink(`/dashboard/classrooms/${classroom.id}`)}>
                                        <GraduationCap />
                                        <span>{classroom.nombre_aula}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/dashboard/classrooms')} tooltip="Aulas">
                            <Link href={createLink('/dashboard/classrooms')}>
                                <span>OTRAS AULAS...</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/dashboard/enrollment')} tooltip="Inscripción">
                            <Link href={createLink('/dashboard/enrollment')}>
                                <QrCode />
                                <span>Inscripción</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Panel Super Admin">
                            <Link href="/super-admin">
                                <Home />
                                <span>Panel Super Admin</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Configuración">
                            <Link href="#">
                                <Settings />
                                <span>Configuración</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function AdminLayoutLoading() {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:flex h-full w-64 flex-col border-r">
            <div className='p-4'><Skeleton className="h-8 w-32" /></div>
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            <header className="flex h-16 items-center justify-between border-b px-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <main className="flex-1 p-8">
                <Skeleton className="h-full w-full" />
            </main>
        </div>
      </div>
    )
}

function AdminLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading, error } = useUser();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!loading && !user && !error) {
            const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}`: ''}`;
            redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
    }, [user, loading, error, pathname, searchParams]);

    if (loading) {
        return <AdminLayoutLoading />;
    }

    if (!user) {
        return null;
    }

    return (
        <InstitutionProvider>
            <SidebarProvider>
            <AdminSidebar/>
            <SidebarInset>
                <header className="flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-8">
                    <SidebarTrigger className="md:hidden"/>
                    <DashboardHeader />
                    <AdminUserNav/>
                </header>
                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </SidebarInset>
            </SidebarProvider>
        </InstitutionProvider>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutLoading />}>
      <AdminLayoutComponent>
        {children}
      </AdminLayoutComponent>
    </Suspense>
  );
}
