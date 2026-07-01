
import { notFound } from 'next/navigation';
import { NavHeader } from '@/components/admin/nav-header';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin panel is now protected by authentication middleware.

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
      <head>
      </head>
      <body suppressHydrationWarning className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div suppressHydrationWarning className="flex min-h-screen flex-col">
            <NavHeader />
            {children}
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
