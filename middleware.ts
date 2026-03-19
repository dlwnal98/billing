import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/', '/issue', '/history', '/clients', '/mypage']

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname
  const isProtected = protectedRoutes.some(
    r => pathname === r || pathname.startsWith(r + '/')
  )
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
