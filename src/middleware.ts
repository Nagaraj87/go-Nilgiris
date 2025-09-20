
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);

  const isAuthenticated = !!cookie?.value;

  const isAuthRoute = pathname === '/login';
  const isAdminRoute = pathname.startsWith('/admin');

  // If trying to access login page while authenticated, redirect to admin dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If trying to access any admin route without being authenticated, redirect to login
  if (!isAuthenticated && isAdminRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher to run the middleware on admin and login routes
  matcher: ['/admin/:path*', '/login'],
};
