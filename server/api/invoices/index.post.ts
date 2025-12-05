import { getCurrentUser } from '../../repositories/userRepository'
import { createInvoice } from '../../repositories/invoiceRepository'
import { stripTags } from '../../utils/sanitize'
import { findCustomerById } from '../../repositories/customerRepository'
import type { CreateInvoiceData, InvoiceApiResponse } from '../../../types/invoice'

export default defineEventHandler(async (event): Promise<InvoiceApiResponse> => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const customerId = typeof body.customerId === 'string' ? body.customerId : ''
  const invoiceNumber = typeof body.invoiceNumber === 'string' ? stripTags(body.invoiceNumber) : ''
  const priceNetto = body.priceNetto
  const priceGross = body.priceGross
  const paymentDeadline = typeof body.paymentDeadline === 'string' ? body.paymentDeadline : ''

  if (!customerId || !invoiceNumber || priceNetto == null || priceGross == null || !paymentDeadline) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // ensure customer exists and belongs to current user
  const customer = await findCustomerById(customerId)
  if (!customer || customer.userId !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid customer' })
  }

  const data: CreateInvoiceData = {
    customerId,
    invoiceNumber,
    priceNetto: String(priceNetto),
    priceGross: String(priceGross),
    currencyCode: typeof body.currencyCode === 'string' ? stripTags(body.currencyCode) : 'PLN',
    paymentDeadline,
    paymentType: typeof body.paymentType === 'string' ? stripTags(body.paymentType) : 'transfer',
    paidStatus: Boolean(body.paidStatus),
    paidDate: body.paidDate ?? null,
    // items may be passed through -> repository handles items if provided
    ...(body.items ? { items: body.items } : {})
  }

  const invoice = await createInvoice(currentUser.id, data as any)
  return { success: true, invoice }
})
