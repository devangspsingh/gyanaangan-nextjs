'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Home, FileText, Loader2, BarChart2 } from "lucide-react";

// Shadcn UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import the Sidebar components
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

// --- AppSidebar Component ---
// (This component is identical to the previous version)

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
];

function AppSidebar({ user }) {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="p-2 flex items-center gap-2">
                    <div className="flex size-10 bg-primary-dark items-center justify-center rounded-md text-primary-foreground">
                        <img src="/images/logo white.png" alt='logo' className="size-10 font-bold" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Gyan Aangan</span>
                        <span className="truncate text-xs text-muted-foreground">Admin Console</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild tooltip={item.name}>
                                        <Link href={item.href}>
                                            <item.icon className="w-6 h-6" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <Link href={"/profile"}>
                    <div className="flex items-center gap-3 p-4">

                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={user.picture || '/default-avatar.png'}
                                alt={user.name}
                            />
                            <AvatarFallback>
                                {user.name?.charAt(0).toUpperCase() || 'A'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}

// --- AdminLayout Component (with fix) ---

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    // ... (useEffect and loading/auth checks are the same)
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/admin');
        } else if (!loading && user && !user.is_staff) {
            // console.log(user);
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !user.is_staff) {
        return null;
    }

    return (
        <SidebarProvider>
            <AppSidebar user={user} />

            {/* Use SidebarInset for proper margin handling */}
            <SidebarInset>
                {/* Header (Sticky) */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
                    <SidebarTrigger />
                    <h2 className="text-xl font-semibold">
                        Dashboard Admin
                    </h2>
                </header>

                {/* Main Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}