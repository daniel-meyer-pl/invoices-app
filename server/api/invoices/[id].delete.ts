import { getCurrentUser } from '../../repositories/userRepository'
import { findInvoiceById, deleteInvoiceById } from '../../repositories/invoiceRepository'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const existing = await findInvoiceById(id)
  if (!existing || existing.userId !== currentUser.id) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  await deleteInvoiceById(id)
  return { success: true, message: 'Deleted' }
})
