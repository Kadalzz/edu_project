import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

// Define protected routes and their required roles
const routeProtection: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/guru': ['GURU'],
  '/parent': ['PARENT'],
  '/student': ['PARENT'], // Parent can access student view for their children
  '/dashboard': ['ADMIN', 'GURU', 'PARENT']
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const publicRoutes = ['/', '/login', '/register', '/api/auth/signin', '/api/auth/register']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if route needs protection
  const protectedPath = Object.keys(routeProtection).find(path => 
    pathname.startsWith(path)
  )

  if (!protectedPath) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret-key'
    const decoded = verify(token, secret) as { 
      userId: string
      role: string 
    }

    // Check if user has required role
    const allowedRoles = routeProtection[protectedPath]
    if (!allowedRoles.includes(decoded.role)) {
      // Redirect to appropriate dashboard based on role
      const url = request.nextUrl.clone()
      switch (decoded.role) {
        case 'ADMIN':
          url.pathname = '/admin/dashboard'
          break
        case 'GURU':
          url.pathname = '/guru/dashboard'
          break
        case 'PARENT':
          url.pathname = '/parent/dashboard'
          break
        default:
          url.pathname = '/login'
      }
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    // Invalid token - redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
