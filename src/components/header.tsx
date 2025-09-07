import Link from 'next/link';
import { DeerLogo } from '@/components/icons';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <DeerLogo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              Nilgiri Explorer
            </span>
          </Link>
        </div>
        <nav>
          <Button variant="ghost" asChild>
            <Link href="/admin">
              <Lock className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
