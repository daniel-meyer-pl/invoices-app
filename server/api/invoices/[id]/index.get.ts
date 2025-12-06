import { getCurrentUser } from '../../../repositories/userRepository'
import { findInvoiceById } from '../../../repositories/invoiceRepository'
import type { InvoiceApiResponse } from '../../../../types/invoice'

export default defineEventHandler(async (event): Promise<InvoiceApiResponse> => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const invoice = await findInvoiceById(id)
  if (!invoice || invoice.userId !== currentUser.id) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // map Decimal and Date fields to JSON-friendly values
  const mapped = {
    ...invoice,
    priceNetto: (invoice as any).priceNetto?.toString?.() ?? String((invoice as any).priceNetto),
    priceGross: (invoice as any).priceGross?.toString?.() ?? String((invoice as any).priceGross),
    paidDate: invoice.paidDate ? new Date(invoice.paidDate).toISOString() : null,
    paymentDeadline: invoice.paymentDeadline ? new Date(invoice.paymentDeadline).toISOString() : invoice.paymentDeadline,
    createdAt: invoice.createdAt ? new Date(invoice.createdAt).toISOString() : invoice.createdAt,
    // ensure customer dates are strings
    customer: invoice.customer
      ? {
          ...invoice.customer,
          createdAt: invoice.customer.createdAt ? new Date(invoice.customer.createdAt).toISOString() : invoice.customer.createdAt
        }
      : null,
    // map items numeric/decimal fields
    items: (invoice.items || []).map((it: any) => ({
      ...it,
      amount: it.amount?.toString?.() ?? String(it.amount),
      priceNetto: it.priceNetto?.toString?.() ?? String(it.priceNetto),
      priceGross: it.priceGross?.toString?.() ?? String(it.priceGross),
    }))
  }

  return { success: true, invoice: mapped }
})
