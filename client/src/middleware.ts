import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl

  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/verify-code',
    '/reset-password',
    '/contact',
    '/api/auth',
    '/api/contact',
    '/api/waitlist'
  ]

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith('/api/auth/')
  )

  if (!req.auth && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (req.auth && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)',
  ],
}   