import { getCurrentUser } from '../../repositories/userRepository'
import { createCustomer } from '../../repositories/customerRepository'
import { stripTags } from '../../utils/sanitize'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const payload = {
    firstname: typeof body.firstname === 'string' ? stripTags(body.firstname) : null,
    lastname: typeof body.lastname === 'string' ? stripTags(body.lastname) : null,
    companyName: typeof body.companyName === 'string' ? stripTags(body.companyName) : null,
    address: typeof body.address === 'string' ? stripTags(body.address) : null,
    nip: typeof body.nip === 'string' ? stripTags(body.nip) : null,
  }

  const customer = await createCustomer(currentUser.id, payload)
  return { success: true, customer }
})
