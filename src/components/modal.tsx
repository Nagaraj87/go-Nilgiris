"use client";

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) router.back() }}>
      <DialogContent className="max-w-5xl bg-black border-none p-0 overflow-hidden sm:rounded-xl">
        <DialogTitle className="sr-only">Image Gallery View</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
