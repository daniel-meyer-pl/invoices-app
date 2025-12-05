import { getCurrentUser , updateUserById } from "../../repositories/userRepository"
import type { UserApiResponse, PatchUserData } from "~~/types/user"
import { stripTags } from "../../utils/sanitize"

const allowedFields = ['fullname', 'avatar', 'email', 'companyName', 'bankAccountNumber', 'address', 'nip'] as const

export default defineEventHandler(async (event): Promise<UserApiResponse> => {
  const body = await readBody(event)
  const currentUser = await getCurrentUser(event)

  if (!currentUser) throw createError({ statusCode: 404, statusMessage: "User not found" })

  const updateData: PatchUserData = {}

  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const raw = body[key]
      const k = key as keyof PatchUserData
      updateData[k] = stripTags(raw) ?? null
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No valid fields to update" })
  }

  try {
    const user = await updateUserById(currentUser.id, updateData)
    return { loggedIn: true, user }
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: "Failed to update user" })
  }
})
