import { signToken } from "../../utils/jwt"
import { OAuth2Client } from "google-auth-library"
import { setAuthCookie } from "../../utils/authCookie"
import { upsertUserByGoogleAccountId } from "../../repositories/userRepository"
import type { UserApiResponse } from "~~/types/user"

export default defineEventHandler(async (event): Promise<UserApiResponse> => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const client = new OAuth2Client(config.public.googleClientId)
  const ticket = await client.verifyIdToken({ idToken: body.credential })
  const payload = ticket.getPayload()

  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" })
  }
  
  const { sub, email, name, picture } = payload

  const user = await upsertUserByGoogleAccountId(sub, {
    email: email || '',
    fullname: name || null,
    avatar: picture || null
  })

  const token = signToken(user.id)

  setAuthCookie(event, token)

  return { user, loggedIn: true }
})
