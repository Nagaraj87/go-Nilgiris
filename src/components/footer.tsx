
import Link from 'next/link';
import { DeerLogo } from '@/components/icons';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <DeerLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Nilgiri Explorer</span>
          </div>
          <p className="text-muted-foreground">
            Explore the Nilgiris with Ease – Ooty, Coonoor, Mudhumalai & More!
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-4 font-semibold">Tours</h3>
              <ul className="space-y-2">
                <li><Link href="/tours/ooty-coonoor-tour" className="text-muted-foreground hover:text-primary">Ooty-Coonoor</Link></li>
                <li><Link href="/tours/mudhumalai-pykara-tour" className="text-muted-foreground hover:text-primary">Mudhumalai-Pykara</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Support</h3>
              <ul className="space-y-2">
                 <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                 <li><a href="mailto:lets@gokotagiri.com" className="text-muted-foreground hover:text-primary">Email Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Nilgiri Explorer. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">A GoKotagiri Tourism Venture</p>
        </div>
      </div>
    </footer>
  );
}

    