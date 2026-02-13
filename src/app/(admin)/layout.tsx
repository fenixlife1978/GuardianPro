'use client';

import {
  Users,
  ShieldCheck,
  Building,
  Home,
  ShieldX,
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
import { useUser } from '@/firebase';
import { useEffect, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { InstitutionProvider } from './institution-context';
import { DashboardHeader } from '@/components/admin/dashboard-header';

const AdminSidebar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useUser();

    const isActive = (path: string) => pathname.startsWith(path);

    const createLink = (path: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!params.has('institutionId') && user?.uid !== 'QeGMDNE4GaSJOU8XEnY3lFJ9by13') {
            // This case should be handled by InstitutionProvider, but as a fallback
        }
        return `${path}?${params.toString()}`;
    }

    return (
        <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-3 px-6 py-8">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <span className="text-white text-xl font-black italic tracking-tighter">
                  ServiControl<span className="text-orange-500">Pro</span>
                </span>
              </div>
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
                                <span>Sectores</span>
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
                        <SidebarMenuButton asChild isActive={isActive('/dashboard/security')} className="p-3 rounded-xl font-bold data-[active=true]:bg-primary/10 data-[active=true]:text-blue-400">
                            <Link href={createLink('/dashboard/security')}>
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
                    {/* Institution name is now in the global header */}
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
                    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
                      <DashboardHeader />
                    </header>
                    <main className="flex-1 p-8 overflow-y-auto">
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
