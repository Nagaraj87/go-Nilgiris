
"use client";

import { useAuth, AuthProvider } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { NavHeader } from '@/components/admin/nav-header';


function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavHeader />
            {children}
        </>
    );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
