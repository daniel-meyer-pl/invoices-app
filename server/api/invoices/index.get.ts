import { getCurrentUser } from '../../repositories/userRepository'
import { findInvoicesByUserId } from '../../repositories/invoiceRepository'
import type { InvoicesListResponse } from '../../../types/invoice'

export default defineEventHandler(async (event): Promise<InvoicesListResponse> => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const invoices = await findInvoicesByUserId(currentUser.id)
  return { invoices }
})
