
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
 
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
     if (request.nextUrl.pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
     }
  }

  if (session && request.nextUrl.pathname === '/admin/login') {
     return NextResponse.redirect(new URL('/admin', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/admin/:path*'],
}
