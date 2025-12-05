import { getCookie } from "h3"
import { verifyToken } from "../../utils/jwt"

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { loggedIn: false }

  try {
    const user = verifyToken(token)
    return { loggedIn: true, user }
  } catch (err) {
    return { loggedIn: false }
  }
})
