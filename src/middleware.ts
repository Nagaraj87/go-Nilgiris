
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminSecretPath } from '@/lib/firebase';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const segments = request.nextUrl.pathname.split('/');
    const secretFromUrl = segments[2];
    
    // Allow access to the API route used for validation on the admin page itself
    if (request.nextUrl.pathname.startsWith('/api/validate-secret')) {
        return NextResponse.next();
    }
    
    // Avoid fetching from DB for sub-pages like /availability if we can
    // We assume if the user has the base secret, they can access sub-pages.
    // A more robust solution might use sessions.
    const referer = request.headers.get('referer');
    if (referer) {
        try {
            const refererUrl = new URL(referer);
            if (refererUrl.pathname.startsWith('/admin/')) {
                 const refererSegments = refererUrl.pathname.split('/');
                 const refererSecret = refererSegments[2];
                 if(secretFromUrl === refererSecret) {
                    return NextResponse.next();
                 }
            }
        } catch(e) {
            // Invalid referer URL, proceed to DB check
        }
    }

    try {
      const storedSecret = await getAdminSecretPath();
      
      if (secretFromUrl === storedSecret) {
        return NextResponse.next();
      }
    } catch (e) {
      console.error("Middleware DB Error:", e);
      // Fallthrough to redirect
    }

    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/admin/:path*',
};
