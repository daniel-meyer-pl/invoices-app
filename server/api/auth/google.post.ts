import { setCookie } from "h3"
import { signToken } from "../../utils/jwt"
import { prisma } from "../../utils/prisma"
import { OAuth2Client } from "google-auth-library"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const client = new OAuth2Client(config.public.googleClientId)
  const ticket = await client.verifyIdToken({ idToken: body.credential })
  const payload = ticket.getPayload()

  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" })
  }
  
  const { sub, email, name, picture } = payload

  const user = await prisma.user.upsert({
    where: { googleAccountId: sub },
    update: {},
    create: { googleAccountId: sub, email: email || '', fullname: name, avatar: picture || null }
  })

  const token = signToken(user.id)

  setCookie(event, "auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  })

  return { user, loggedIn: true }
})
