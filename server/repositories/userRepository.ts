import { prisma } from '../utils/prisma'
import type { H3Event } from 'h3'
import type { PublicUser, InsertUserData, PatchUserData } from '../../types/user'

const publicUserFields = {
  id: true,
  email: true,
  fullname: true,
  avatar: true,
  companyName: true,
  bankAccountNumber: true,
  address: true,
  nip: true,
}

export async function getCurrentUser(event: H3Event): Promise<PublicUser | null> {
    const token = getAuthCookie(event)
    if (!token) return null
    const payload = verifyToken(token)
    return payload ? findUserById(payload.id) : null
}


export async function findUserById(id: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserFields,
  })
}

export async function upsertUserByGoogleAccountId(googleAccountId: string, data: InsertUserData): Promise<PublicUser> {
  const user = await prisma.user.upsert({
    where: { googleAccountId },
    update: {},
    create: {
      googleAccountId,
      email: data.email || '',
      fullname: data.fullname ?? null,
      avatar: data.avatar ?? null,
    },
    select: publicUserFields,
  })

  return user
}

export async function updateUserById(id: string, data: PatchUserData): Promise<PublicUser> {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: publicUserFields,
  })

  return user
}