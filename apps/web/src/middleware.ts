import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware - in production, use NextAuth's auth() middleware
export function middleware(request: NextRequest) {
  // For now, allow all routes during development
  // When NextAuth is fully configured, replace with:
  // import { auth } from "@/lib/auth";
  // export default auth((req) => { ... });

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auction/:path*',
    '/team/:path*',
    '/match/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
