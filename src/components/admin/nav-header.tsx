
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Lock, Menu, Bell, ShieldOff, Tag, Phone, GalleryHorizontal, LogOut, ExternalLink } from 'lucide-react';
import { NotificationBell } from '../notification-bell';
import { useAuth } from '@/context/auth-context';

export function NavHeader() {
  const { logout } = useAuth();
  const navLinks = [
    { href: "/admin/availability", label: "Availability", icon: ShieldOff },
    { href: "/admin#pricing-section", label: "Pricing", icon: Tag },
    { href: "/admin#contact-section", label: "Contact", icon: Phone },
    { href: "/admin#gallery-section", label: "Gallery", icon: GalleryHorizontal },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
  ]
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <p className="font-bold">Admin Panel</p>
        <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(({href, label, icon: Icon}) => (
                <Button variant="ghost" asChild key={label}>
                    <Link href={href}>
                        <Icon className="mr-2 h-4 w-4"/>
                        {label}
                    </Link>
                </Button>
            ))}
             <NotificationBell />
             <Button variant="outline" asChild>
                <Link href="/" target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4"/>
                    Go to Site
                </Link>
            </Button>
            <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4"/>
                Logout
            </Button>
        </nav>
      </div>
    </header>
  );
}
