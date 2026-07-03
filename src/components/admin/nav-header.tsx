
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Menu, Bell, ShieldOff, Tag, Phone, GalleryHorizontal, Plane, PlusCircle, ExternalLink, BookOpenCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { logoutAction, changePasswordAction } from '@/app/(admin)/login/actions';
import { LogOut, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
export function NavHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    const res = await changePasswordAction(currentPassword, newPassword);
    if (res.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setIsPasswordModalOpen(false), 1500);
    } else {
        setPasswordError(res.error || 'Failed to change password');
    }
  };

  const handleLogout = async () => {
      setIsLoggingOut(true);
      await logoutAction();
      window.location.href = '/login';
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home, target: "" },
    { href: "/admin", label: "Dashboard", icon: Plane, target: "" },
    { href: "/admin/edit-tour/new", label: "New Tour", icon: PlusCircle, target: "" },
    { href: "/admin/availability", label: "Availability", icon: ShieldOff, target: "" },
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
            <Link href="/" prefetch={true}>
              <Home className="mr-2 h-4 w-4" /> Home
            </Link>
          </Button>
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
          <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="mr-2 h-4 w-4" /> Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Admin Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
                <Button type="submit" className="w-full">Update Password</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
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
                    onClick={() => { setIsSheetOpen(false); setIsPasswordModalOpen(true); }}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium hover:bg-muted mt-4 border-t pt-4"
                  >
                    <Key className="h-5 w-5" />
                    Change Password
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-muted"
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
