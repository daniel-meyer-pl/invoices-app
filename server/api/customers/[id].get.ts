import { getCurrentUser } from '../../repositories/userRepository'
import { findCustomerById } from '../../repositories/customerRepository'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const customer = await findCustomerById(id)
  if (!customer || customer.userId !== currentUser.id) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return { success: true, customer }
})
