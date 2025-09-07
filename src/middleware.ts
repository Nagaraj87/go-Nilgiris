
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminSecretPath } from '@/lib/firebase';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only apply this middleware to routes under /admin/
  if (pathname.startsWith('/admin/')) {
    // Exclude the login page from this check if it ever gets re-added.
    // This also helps avoid redirect loops.
    // e.g. if (pathname.startsWith('/admin/login')) return NextResponse.next();
    
    // The secret is expected to be the second segment, e.g., /admin/{secret}/...
    const segments = pathname.split('/');
    if (segments.length > 2) {
      const secretFromUrl = segments[2];
      
      try {
        const storedSecret = await getAdminSecretPath();
        if (secretFromUrl === storedSecret) {
          // If the secret is correct, allow the request to proceed.
          return NextResponse.next();
        }
      } catch (e) {
        console.error("Middleware Database Error:", e);
        // If there's an error fetching the secret, deny access as a security precaution.
        return NextResponse.redirect(new URL('/404', request.url));
      }
    }
    
    // If the secret is missing or incorrect, redirect to a 404 page.
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // For all other routes, do nothing.
  return NextResponse.next();
}

// Match all routes under /admin/, including nested pages.
export const config = {
  matcher: '/admin/:path*',
};
