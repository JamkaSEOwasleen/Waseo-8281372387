import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Public routes that do not require authentication.
 * - /, /pricing, /login — landing and auth pages
 * - /api/auth/* — Auth.js v5 authentication routes
 * - /api/webhooks/* — External webhook handlers (Lemon Squeezy)
 */
const publicRoutes = [
  '/',
  '/pricing',
  '/login',
  '/api/auth',
  '/api/webhooks',
];

/**
 * Checks if a pathname matches any public route prefix.
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Next.js root middleware.
 * 1. Checks Auth.js session for authentication
 * 2. Protects /dashboard/* routes — redirects to /login if unauthenticated
 * 3. Allows all public routes through without auth check
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Authenticated routes: check Auth.js session
  const session = await auth();

  // Protect /dashboard/* routes
  if (pathname.startsWith('/dashboard') && !session?.user?.id) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Middleware matcher configuration.
 * Excludes: _next static files, all static files in public, images, icons, manifest.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg, apple-icon.png (favicon files)
     * - manifest.json (PWA manifest)
     * - images (public images)
     * - .svg, .png, .jpg, .jpeg, .gif, .webp (static images)
     */
    '/((?!_next/static|_next/image|favicon\\.*|apple-icon\\.*|manifest\\.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
