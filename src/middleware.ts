import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BASIC_PATHS = [/^\/admin(\/.*)?$/, /^\/api\/admin(\/.*)?$/]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const needsAuth = BASIC_PATHS.some((re) => re.test(pathname))
  if (!needsAuth) return NextResponse.next()

  const header = req.headers.get('authorization')
  const expectedUser = process.env.ADMIN_USER || ''
  const expectedPass = process.env.ADMIN_PASS || ''

  if (!header?.startsWith('Basic ')) {
    return unauthorized()
  }
  try {
    const b64 = header.slice('Basic '.length)
    const decoded = atob(b64)
    const [user, pass] = decoded.split(':')
    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next()
    }
  } catch {
    // fallthrough
  }
  return unauthorized()
}

function unauthorized() {
  const res = new NextResponse('Unauthorized', { status: 401 })
  res.headers.set('WWW-Authenticate', 'Basic realm="Admin", charset="UTF-8"')
  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
