
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Menu, Bell, ShieldOff, Tag, Phone, GalleryHorizontal, Plane, PlusCircle, ExternalLink, BookOpenCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NotificationBell } from '../notification-bell';
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';

export function NavHeader() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home, target: "_blank" },
    { href: "/admin/documentation", label: "Documentation", icon: BookOpenCheck, target: "" },
    { href: "/admin", label: "Dashboard", icon: Plane },
    { href: "/admin/edit-tour/new", label: "New Tour", icon: PlusCircle },
    { href: "/admin/availability", label: "Availability", icon: ShieldOff },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin#tour-management-section", label: "Tours", icon: Plane },
    { href: "/admin#pricing-section", label: "Pricing", icon: Tag },
    { href: "/admin#contact-section", label: "Contact", icon: Phone },
    { href: "/admin#gallery-section", label: "Gallery", icon: GalleryHorizontal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/admin" className="font-bold">Admin Panel</Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" asChild>
              <Link href="/admin">
                  <Plane className="mr-2 h-4 w-4"/> Dashboard
              </Link>
          </Button>
          <Button variant="ghost" asChild>
              <Link href="/admin/availability">
                  <ShieldOff className="mr-2 h-4 w-4"/> Availability
              </Link>
          </Button>
          <NotificationBell />
           <Button variant="ghost" asChild>
            <Link href="/admin/documentation">
                <BookOpenCheck className="mr-2 h-4 w-4"/> Documentation
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4"/>Go to Site
            </Link>
          </Button>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon"><Menu/></Button>
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
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
                                onClick={() => setIsSheetOpen(false)}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </Link>
                        ))}
                        </nav>
                     </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
