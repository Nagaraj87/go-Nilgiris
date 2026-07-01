
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Menu, Bell, ShieldOff, Tag, Phone, GalleryHorizontal, Plane, PlusCircle, ExternalLink, BookOpenCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NotificationBell } from '../notification-bell';
import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { logoutAction } from '@/app/(admin)/login/actions';
import { LogOut } from 'lucide-react';

export function NavHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
      setIsLoggingOut(true);
      await logoutAction();
      window.location.href = '/login';
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home, target: "_blank" },
    { href: "/admin", label: "Dashboard", icon: Plane, target: "" },
    { href: "/admin/edit-tour/new", label: "New Tour", icon: PlusCircle, target: "" },
    { href: "/admin/availability", label: "Availability", icon: ShieldOff, target: "" },
    { href: "/admin/notifications", label: "Notifications", icon: Bell, target: "" },
    { href: "/admin#tour-management-section", label: "Tours", icon: Plane, target: "" },
    { href: "/admin#pricing-section", label: "Pricing", icon: Tag, target: "" },
    { href: "/admin#contact-section", label: "Contact", icon: Phone, target: "" },
    { href: "/admin#gallery-section", label: "Gallery", icon: GalleryHorizontal, target: "" },
  ];

  return (
    <header suppressHydrationWarning className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/admin" className="font-bold">Admin Panel</Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" asChild>
            <Link href="/admin" prefetch={true}>
              <Plane className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/availability" prefetch={true}>
              <ShieldOff className="mr-2 h-4 w-4" /> Availability
            </Link>
          </Button>
          <NotificationBell />
          <Button variant="outline" asChild>
            <Link href="/" target="_blank" prefetch={false}>
              <ExternalLink className="mr-2 h-4 w-4" />Go to Site
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <NotificationBell />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Admin Menu</SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-grow">
                <nav className="flex flex-col gap-1 pt-4 pr-4">
                  {navLinks.map(({ href, label, icon: Icon, target }) => (
                    <Link
                      key={href}
                      href={href}
                      target={target}
                      prefetch={true}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-muted mt-4 border-t pt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
