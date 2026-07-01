import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Global Private Testing Mode (Basic Auth)
  if (process.env.PRIVATE_TESTING_MODE === 'true') {
    const basicAuth = request.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      const validUser = process.env.TESTING_USERNAME || 'admin';
      const validPwd = process.env.TESTING_PASSWORD || 'password123';
      
      if (user !== validUser || pwd !== validPwd) {
        return new NextResponse('Auth required', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
      }
    } else {
      return new NextResponse('Auth required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      });
    }
  }

  // 2. Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authCookie || authCookie.value !== 'true') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Prevent logged-in users from accessing /login
  if (pathname === '/login') {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
    if (authCookie && authCookie.value === 'true') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
