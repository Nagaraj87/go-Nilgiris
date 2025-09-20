
import { notFound } from 'next/navigation';
import { NavHeader } from '@/components/admin/nav-header';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import '../globals.css';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    // If we're in a production environment, don't render the admin panel.
    if (process.env.NODE_ENV === 'production') {
        notFound();
    }

  return (
     <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavHeader />
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
