import { getCookie } from "h3"
import { verifyToken } from "../utils/jwt"

export default defineEventHandler(async (event) => {
  const path = event.node.req.url || ''

  if (path === '/' || path.startsWith('/api/auth') || path.startsWith('/login')) return

  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const user = verifyToken(token)
    event.context.user = user
  } catch (err) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
})