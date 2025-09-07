
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DeerLogo } from '@/components/icons';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, Lock, Menu, ArrowLeft, Bell, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTodaysAndTomorrowsBookings } from '@/lib/firebase';
import type { Booking } from '@/types';
import { Badge } from './ui/badge';
import { ThemeToggle } from './theme-toggle';
import { logout } from '@/app/actions';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);

  const showBackButton = pathname !== '/';
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminPage) {
      getTodaysAndTomorrowsBookings().then(data => setUpcomingBookings(data as Booking[]));
    }
  }, [isAdminPage, pathname]);

  const handleLogout = async () => {
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="mr-4 flex items-center">
          {showBackButton && !isAdminPage && (
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/')}>
              <ArrowLeft />
              <span className="sr-only">Back to Home</span>
            </Button>
          )}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <DeerLogo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              Nilgiri Explorer
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <Lock className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
             {isAdminPage && (
                <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout
                </Button>
            )}
          </nav>

          {isAdminPage && (
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/admin/notifications">
                <Bell />
                {upcomingBookings.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 text-xs">
                    {upcomingBookings.length}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
          )}

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
                  <Link href="/admin" className="flex items-center space-x-2 text-lg font-medium">
                    <Lock className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                  {isAdminPage && (
                    <Button variant="ghost" onClick={handleLogout} className="flex w-full justify-start space-x-2 text-lg font-medium h-auto p-0">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
