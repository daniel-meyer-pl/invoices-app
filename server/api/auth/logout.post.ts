import { clearAuthCookie } from '../../utils/authCookie'

export default defineEventHandler((event) => {
  clearAuthCookie(event)

  return { success: true, message: "Logged out" }
})
