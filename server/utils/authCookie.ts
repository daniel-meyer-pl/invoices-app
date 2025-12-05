import { setCookie } from 'h3'
import type { H3Event } from 'h3'

const isProduction = process.env.NODE_ENV === 'production'
const AUTH_COOKIE = 'auth_token'

export function getAuthCookie(event: H3Event): string | undefined {
  console.log('cookie', getCookie(event, 'auth_token'))
  return getCookie(event, AUTH_COOKIE)
}

export function setAuthCookie(event: H3Event, token: string, opts = {}) {
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7, // 7 days by default
    path: '/',
    ...opts
  })
}

export function clearAuthCookie(event: H3Event) {
  setCookie(event, AUTH_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    maxAge: 0,
    path: '/'
  })
}
