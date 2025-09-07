
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DeerLogo } from '@/components/icons';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, Lock, Menu, Bell } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';
import { logout } from '@/app/actions';


export function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
            <DeerLogo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
            Nilgiri Explorer
            </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
             {!isLoginPage && (
                <Button variant="ghost" asChild>
                <Link href="/admin">
                    <Lock className="mr-2 h-4 w-4" />
                    Admin
                </Link>
                </Button>
            )}
             {isAdminPage && !isLoginPage && (
                 <form action={logout}>
                    <Button type="submit" variant="ghost">Logout</Button>
                </form>
             )}
          </nav>
          
          {isAdminPage && !isLoginPage && <NotificationBell />}
          <ThemeToggle />

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" className="flex items-center space-x-2">
                      <DeerLogo className="h-6 w-6 text-primary" />
                      <span className="font-bold">
                        Nilgiri Explorer
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-6">
                  <Link href="/" className="flex items-center space-x-2 text-lg font-medium">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  {!isLoginPage && 
                    <Link href="/admin" className="flex items-center space-x-2 text-lg font-medium">
                        <Lock className="h-5 w-5" />
                        <span>Admin</span>
                    </Link>
                  }
                  {isAdminPage && !isLoginPage &&
                    <>
                        <Link href="/admin/notifications" className="flex items-center space-x-2 text-lg font-medium">
                        <Bell className="h-5 w-5" />
                        <span>Notifications</span>
                        </Link>
                        <form action={logout} className="w-full">
                           <Button type="submit" variant="outline" className="w-full justify-start text-lg font-medium">Logout</Button>
                        </form>
                    </>
                  }
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
