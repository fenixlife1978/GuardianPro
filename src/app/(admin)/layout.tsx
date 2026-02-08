'use client';

import {
  BarChart2,
  Home,
  MessageSquare,
  QrCode,
  Settings,
  ShieldCheck,
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
import { usePathname, redirect } from 'next/navigation';
import { AdminUserNav } from '@/components/common/admin-user-nav';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminSidebar = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
                <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
                    EduGuard
                </h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/dashboard/reports')} tooltip="Reportes">
                            <Link href="/dashboard/reports">
                                <BarChart2 />
                                <span>Reportes</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/dashboard/messaging')} tooltip="Mensajería">
                            <Link href="/dashboard/messaging">
                                <MessageSquare />
                                <span>Mensajería</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/dashboard/enrollment')} tooltip="Inscripción">
                            <Link href="/dashboard/enrollment">
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading, error } = useUser();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && !error) {
            redirect(`/login?redirect=${pathname}`);
        }
    }, [user, loading, error, pathname]);

    if (loading) {
        return <AdminLayoutLoading />;
    }

    if (!user) {
        return null;
    }

  return (
    <SidebarProvider>
      <AdminSidebar/>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8">
            <SidebarTrigger className="md:hidden"/>
            <div className="hidden font-semibold md:block">Panel de Administración</div>
            <AdminUserNav/>
        </header>
        <main className="flex-1 p-4 md:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
