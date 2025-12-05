import { prisma } from '../utils/prisma'
import type { Invoice, CreateInvoiceData, PatchInvoiceData } from '../../types/invoice'

const publicInvoiceFields = {
    id: true,
    userId: true,
    customerId: true,
    invoiceNumber: true,
    paidStatus: true,
    paidDate: true,
    priceNetto: true,
    priceGross: true,
    currencyCode: true,
    paymentDeadline: true,
    paymentType: true,
    createdAt: true,
    customer: {
        select: {
            id: true,
            userId: true, // added userId
            firstname: true,
            lastname: true,
            companyName: true,
            address: true,
            nip: true,
        }
    },
    items: {
        select: {
            id: true,
            invoiceId: true,
            productName: true,
            amount: true,
            unit: true,
            priceNetto: true,
            priceGross: true,
            tax: true,
        }
    }
}
export async function findInvoicesByUserId(userId: string): Promise<Invoice[]> {
  return prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: publicInvoiceFields,
  })
}

export async function findInvoiceById(id: string): Promise<Invoice | null> {
  return prisma.invoice.findUnique({
    where: { id },
    select: publicInvoiceFields,
  })
}

export async function createInvoice(userId: string, data: CreateInvoiceData): Promise<Invoice> {
  const items = (data.items || []).map(i => ({
    productName: i.productName,
    amount: i.amount as any,
    unit: i.unit,
    priceNetto: i.priceNetto as any,
    priceGross: i.priceGross as any,
    tax: i.tax,
  }))

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        userId,
        customerId: data.customerId,
        invoiceNumber: data.invoiceNumber,
        paidStatus: data.paidStatus ?? false,
        paidDate: data.paidDate ?? null,
        priceNetto: data.priceNetto as any,
        priceGross: data.priceGross as any,
        currencyCode: data.currencyCode ?? 'PLN',
        paymentDeadline: new Date(data.paymentDeadline),
        paymentType: data.paymentType ?? 'transfer',
        items: items.length ? { create: items } : undefined,
      },
      select: publicInvoiceFields,
    })

    return invoice
  })
}

export async function updateInvoiceById(id: string, data: PatchInvoiceData): Promise<Invoice> {
  return prisma.$transaction(async (tx) => {
    if (data.items !== undefined) {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } })

      const itemsToCreate = (data.items || []).map(i => ({
        invoiceId: id,
        productName: i.productName,
        amount: i.amount as any,
        unit: i.unit,
        priceNetto: i.priceNetto as any,
        priceGross: i.priceGross as any,
        tax: i.tax,
      }))

      if (itemsToCreate.length) {
        await tx.invoiceItem.createMany({ data: itemsToCreate })
      }
    }

    const updated = await tx.invoice.update({
      where: { id },
      data: {
        ...(data.customerId !== undefined ? { customerId: data.customerId } : {}),
        ...(data.invoiceNumber !== undefined ? { invoiceNumber: data.invoiceNumber } : {}),
        ...(data.paidStatus !== undefined ? { paidStatus: data.paidStatus } : {}),
        ...(data.paidDate !== undefined ? { paidDate: data.paidDate } : {}),
        ...(data.priceNetto !== undefined ? { priceNetto: data.priceNetto as any } : {}),
        ...(data.priceGross !== undefined ? { priceGross: data.priceGross as any } : {}),
        ...(data.currencyCode !== undefined ? { currencyCode: data.currencyCode } : {}),
        ...(data.paymentDeadline !== undefined ? { paymentDeadline: new Date(data.paymentDeadline) } : {}),
        ...(data.paymentType !== undefined ? { paymentType: data.paymentType } : {}),
      },
      select: publicInvoiceFields,
    })

    return updated
  })
}

export async function deleteInvoiceById(id: string): Promise<void> {
  await prisma.invoice.delete({ where: { id } })
}
