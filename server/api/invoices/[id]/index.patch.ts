import { getCurrentUser } from '../../../repositories/userRepository'
import { findInvoiceById, updateInvoiceById } from '../../../repositories/invoiceRepository'
import { stripTags } from '../../../utils/sanitize'
import { findCustomerById } from '../../../repositories/customerRepository'
import type { InvoiceApiResponse, PatchInvoiceData } from '../../../../types/invoice'

export default defineEventHandler(async (event): Promise<InvoiceApiResponse> => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const existing = await findInvoiceById(id)
  if (!existing || existing.userId !== currentUser.id) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const body = await readBody(event)
  const updateData: PatchInvoiceData = {}

  if (body.customerId !== undefined) {
    const cust = await findCustomerById(String(body.customerId))
    if (!cust || cust.userId !== currentUser.id) throw createError({ statusCode: 403, statusMessage: 'Invalid customer' })
    updateData.customerId = String(body.customerId)
  }
  if (body.invoiceNumber !== undefined) updateData.invoiceNumber = typeof body.invoiceNumber === 'string' ? stripTags(body.invoiceNumber) : body.invoiceNumber
  if (body.paidStatus !== undefined) updateData.paidStatus = Boolean(body.paidStatus)
  if (body.paidDate !== undefined) updateData.paidDate = body.paidDate ?? null
  if (body.priceNetto !== undefined) updateData.priceNetto = String(body.priceNetto)
  if (body.priceGross !== undefined) updateData.priceGross = String(body.priceGross)
  if (body.currencyCode !== undefined) updateData.currencyCode = typeof body.currencyCode === 'string' ? stripTags(body.currencyCode) : body.currencyCode
  if (body.paymentDeadline !== undefined) updateData.paymentDeadline = body.paymentDeadline
  if (body.paymentType !== undefined) updateData.paymentType = typeof body.paymentType === 'string' ? stripTags(body.paymentType) : body.paymentType
  if (body.items !== undefined) updateData.items = body.items // items handled in repository transaction

  if (Object.keys(updateData).length === 0) throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })

  try {
    const invoice = await updateInvoiceById(id, updateData as any)
    return { success: true, invoice }
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update invoice' })
  }
})
