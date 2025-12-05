import { getCurrentUser } from '../../repositories/userRepository'
import { findCustomerById, updateCustomerById } from '../../repositories/customerRepository'
import { stripTags } from '../../utils/sanitize'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const existing = await findCustomerById(id)
  if (!existing || existing.userId !== currentUser.id) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const body = await readBody(event)
  const updateData: any = {}
  if (body.firstname !== undefined) updateData.firstname = typeof body.firstname === 'string' ? stripTags(body.firstname) : null
  if (body.lastname !== undefined) updateData.lastname = typeof body.lastname === 'string' ? stripTags(body.lastname) : null
  if (body.companyName !== undefined) updateData.companyName = typeof body.companyName === 'string' ? stripTags(body.companyName) : null
  if (body.address !== undefined) updateData.address = typeof body.address === 'string' ? stripTags(body.address) : null
  if (body.nip !== undefined) updateData.nip = typeof body.nip === 'string' ? stripTags(body.nip) : null

  if (Object.keys(updateData).length === 0) throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })

  const updated = await updateCustomerById(id, updateData)
  return { success: true, customer: updated }
})
