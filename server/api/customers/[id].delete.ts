import { getCurrentUser } from '../../repositories/userRepository'
import { findCustomerById, deleteCustomerById } from '../../repositories/customerRepository'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const existing = await findCustomerById(id)
  if (!existing || existing.userId !== currentUser.id) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  await deleteCustomerById(id)
  return { success: true }
})
