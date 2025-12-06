export type Customer = {
  id: string
  userId: string
  firstname?: string | null
  lastname?: string | null
  companyName?: string | null
  address?: string | null
  nip?: string | null
  createdAt: string |Date
}

export type InvoiceItem = {
  id: string
  invoiceId: string
  productName: string
  amount: string
  unit: string
  priceNetto: number
  priceGross: number
  tax: number
}

export type Invoice = {
  id: string
  userId: string
  customerId: string
  invoiceNumber: string
  paidStatus: boolean
  paidDate?: string | Date | null
  priceNetto: number
  priceGross: number
  currencyCode: string
  paymentDeadline: string | Date
  paymentType: string
  createdAt: string | Date
  customer: Customer
  items: InvoiceItem[]
}

export type CreateInvoiceData = {
  customerId: string
  invoiceNumber: string
  priceNetto: string | number
  priceGross: string | number
  currencyCode?: string
  paymentDeadline: string
  paymentType?: string
  paidStatus?: boolean
  paidDate?: Date | string | null
  items?: InvoiceItemData[]
}

export type PatchInvoiceData = Partial<CreateInvoiceData>
export type InvoiceItemData = Omit<InvoiceItem, 'id' | 'invoiceId'>

export type InvoiceApiResponse = {
  success: boolean
  invoice?: Invoice | null
  message?: string
}

export type InvoicesListResponse = {
  invoices: Invoice[]
}

