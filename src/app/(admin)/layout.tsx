'use client';

import {
  Users,
  ShieldX,
  Building,
  Home
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
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, redirect, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/common/logo';
import { InstitutionProvider, useInstitution } from './institution-context';
import { doc } from 'firebase/firestore';
import type { Institution } from '@/lib/firestore-types';
import { AdminUserNav } from '@/components/common/admin-user-nav';

const AdminSidebar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const { institutionId } = useInstitution();
    const firestore = useFirestore();

    const isActive = (path: string) => pathname.startsWith(path);

    const createLink = (path: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${path}?${params.toString()}`;
    }

    const institutionRef = useMemoFirebase(() => {
        if (!firestore || !institutionId) return null;
        return doc(firestore, 'institutions', institutionId);
    }, [firestore, institutionId]);

    const { data: institution, isLoading: institutionLoading } = useDoc<Institution>(institutionRef);

    return (
        <Sidebar>
            <SidebarHeader className='p-6'>
              <Logo />
            </SidebarHeader>
            <SidebarContent className='p-4'>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild 
                            isActive={isActive('/dashboard/classrooms')} 
                            className="p-3 rounded-xl font-bold data-[active=true]:bg-primary/10 data-[active=true]:text-blue-400"
                        >
                            <Link href={createLink('/dashboard/classrooms')}>
                                <Building />
                                <span>Aulas</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild 
                            isActive={isActive('/dashboard/reports')} 
                            className="p-3 rounded-xl font-bold data-[active=true]:bg-primary/10 data-[active=true]:text-blue-400"
                        >
                            <Link href={createLink('/dashboard/reports')}>
                                <Users />
                                <span>Alumnos</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild href="#" className="p-3 rounded-xl font-bold data-[active=true]:bg-primary/10 data-[active=true]:text-blue-400">
                            <Link href="#">
                                <ShieldX />
                                <span>Filtros URL</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className='border-t border-sidebar-border/50 p-6 space-y-6'>
                 <div className='space-y-2'>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Institución activa</p>
                    {institutionLoading ? (
                        <Skeleton className="h-4 w-32 bg-sidebar-accent" />
                    ) : (
                        <p className="text-xs text-blue-400 font-bold truncate">{institution?.nombre || 'N/A'}</p>
                    )}
                 </div>
                 {user?.uid === 'QeGMDNE4GaSJOU8XEnY3lFJ9by13' && (
                     <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Panel Super Admin" className="p-3 rounded-xl font-bold">
                                <Link href="/super-admin">
                                    <Home />
                                    <span>Panel Maestro</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                 )}
            </SidebarFooter>
        </Sidebar>
    );
}

function AdminLayoutLoading() {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:flex h-full w-64 flex-col border-r bg-sidebar">
            <div className='p-6'><Skeleton className="h-8 w-32 bg-sidebar-accent" /></div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full bg-sidebar-accent" />
                <Skeleton className="h-10 w-full bg-sidebar-accent" />
                <Skeleton className="h-10 w-full bg-sidebar-accent" />
            </div>
        </div>
        <div className="flex-1 flex flex-col bg-background">
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
                    <main className="flex-1 p-8 overflow-y-auto">
                        <div className="md:hidden flex justify-between items-center mb-4">
                            <SidebarTrigger/>
                            <AdminUserNav/>
                        </div>
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
