import { prisma } from '../utils/prisma'
import type { PublicUser, InsertUserData } from '../../types/user'

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
