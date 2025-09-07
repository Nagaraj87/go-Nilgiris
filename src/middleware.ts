
import {NextRequest, NextResponse} from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // If trying to access admin pages without a valid session, redirect to login
  if (request.nextUrl.pathname.startsWith('/admin') && session !== 'loggedin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page with a valid session, redirect to admin
  if (request.nextUrl.pathname === '/login' && session === 'loggedin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
