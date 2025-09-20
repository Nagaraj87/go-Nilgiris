
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This middleware is now a no-op but is kept for future use.
  // The admin route protection is handled in the admin layout itself.

  return NextResponse.next();
}

export const config = {
  // The matcher is kept but the logic inside middleware is disabled for now.
  matcher: ['/admin/:path*', '/login'],
};
