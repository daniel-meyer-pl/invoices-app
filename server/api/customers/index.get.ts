import { getCurrentUser } from '../../repositories/userRepository'
import { findCustomersByUserId } from '../../repositories/customerRepository'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const customers = await findCustomersByUserId(currentUser.id)
  return { customers }
})
