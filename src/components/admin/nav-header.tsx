
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Lock, Menu, Bell, ShieldOff, Tag, Phone, GalleryHorizontal, Plane, PlusCircle, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NotificationBell } from '../notification-bell';
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { logoutAction } from '@/app/(admin)/login/actions';
import { useToast } from '@/hooks/use-toast';

export function NavHeader() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
      await logoutAction();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
      router.refresh();
  }
  
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/admin", label: "Dashboard", icon: Plane },
    { href: "/admin/edit-tour/new", label: "New Tour", icon: PlusCircle },
    { href: "/admin/availability", label: "Availability", icon: ShieldOff },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin#tour-management-section", label: "Tours", icon: Plane },
    { href: "/admin#pricing-section", label: "Pricing", icon: Tag },
    { href: "/admin#contact-section", label: "Contact", icon: Phone },
    { href: "/admin#gallery-section", label: "Gallery", icon: GalleryHorizontal },
    { href: "/admin#credentials-section", label: "Credentials", icon: Lock },
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
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4"/>Go to Site
            </Link>
          </Button>
           <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut />
              <span className="sr-only">Log Out</span>
            </Button>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <Button variant="outline" size="icon" asChild>
                <Link href="/" target="_blank"><ExternalLink/></Link>
            </Button>
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
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-muted"
                                onClick={() => setIsSheetOpen(false)}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </Link>
                        ))}
                        </nav>
                     </ScrollArea>
                    <div className="mt-auto border-t pt-4">
                         <Button variant="outline" className="w-full" onClick={handleLogout}>
                            <LogOut className="mr-2" /> Log Out
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
