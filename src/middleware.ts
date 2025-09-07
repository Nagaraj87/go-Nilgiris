import {NextRequest, NextResponse} from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  // If trying to access admin pages without a session, redirect to login
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page with a session, redirect to admin
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
