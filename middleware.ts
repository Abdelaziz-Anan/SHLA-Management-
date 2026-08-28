import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and login page bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/icon-192.png' ||
    pathname === '/icon-512.png'
  ) {
    return NextResponse.next();
  }

  // Check auth cookies / headers
  const userRole = request.cookies.get('user_role')?.value;
  const userId = request.cookies.get('user_id')?.value;

  // If no auth cookie exists on protected routes, allow client-side layout auth check with smooth redirect fallback
  // For Manager-only routes, check role
  const managerOnlyRoutes = ['/users', '/settings', '/audit-log'];

  if (managerOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (userRole && userRole !== 'manager') {
      // Redirect Assistant away from Manager pages to dashboard
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
