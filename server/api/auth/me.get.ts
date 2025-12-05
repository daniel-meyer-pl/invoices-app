import { verifyToken } from "../../utils/jwt"
import { getAuthCookie } from "../../utils/authCookie"
import { findUserById } from "../../repositories/userRepository"
import type { UserApiResponse } from "~~/types/user"

export default defineEventHandler(async (event): Promise<UserApiResponse> => {
  const token = getAuthCookie(event)
  if (!token) {
    return { loggedIn: false }
  }

  try {
    const payload = verifyToken(token)
    const user = await findUserById(payload.id)

    return user ? { loggedIn: true, user } : { loggedIn: false }
  } catch (err) {
    return { loggedIn: false }
  }
})
