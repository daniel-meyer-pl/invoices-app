import { getCurrentUser } from "../../repositories/userRepository"
import type { UserApiResponse } from "~~/types/user"

export default defineEventHandler(async (event): Promise<UserApiResponse> => {
  try {
    const user = await getCurrentUser(event)

    return user ? { loggedIn: true, user } : { loggedIn: false }
  } catch (err) {
    return { loggedIn: false }
  }
})
