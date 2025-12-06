import { PDFDocument, rgb } from 'pdf-lib'
import * as fontkit from 'fontkit'
import fs from 'fs'
import path from 'path'
import { formatDate } from '../../../utils/date'
import { getCurrentUser } from '../../../repositories/userRepository'
import { findInvoiceById } from '../../../repositories/invoiceRepository'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const invoice = await findInvoiceById(id)
  if (!invoice || invoice.userId !== currentUser.id) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const page = pdfDoc.addPage()
  const regularFontBytes = fs.readFileSync(path.resolve('./assets/fonts/Roboto-Regular.ttf'))
  const boldFontBytes = fs.readFileSync(path.resolve('./assets/fonts/Roboto-Bold.ttf'))

  const font = await pdfDoc.embedFont(regularFontBytes)
  const fontBold = await pdfDoc.embedFont(boldFontBytes)

  let y = 800

  page.drawText(`Faktura ${invoice.invoiceNumber}`, { x: 40, y, size: 20, font: fontBold })
  y -= 30
  page.drawText(`Data wystawienia: ${formatDate(invoice.createdAt as Date)}`, { x: 40, y, size: 12, font })
  y -= 20
  page.drawText(`Termin platnosci: ${formatDate(invoice.paymentDeadline as Date)}`, { x: 40, y, size: 12, font })
  y -= 30

  page.drawText('Sprzedawca:', { x: 40, y, size: 14, font: fontBold })
  y -= 20
  page.drawText(`${currentUser.companyName}`, { x: 40, y, size: 12, font })
  y -= 15
  page.drawText(`${currentUser.address}`, { x: 40, y, size: 12, font })
  y -= 15
  page.drawText(`NIP: ${currentUser.nip}`, { x: 40, y, size: 12, font })
  y -= 30

  page.drawText('Nabywca:', { x: 40, y, size: 14, font: fontBold })
  y -= 20
  const customer = invoice.customer
  page.drawText(`${customer.companyName || customer.firstname + ' ' + customer.lastname}`, { x: 40, y, size: 12, font })
  y -= 15
  page.drawText(`${customer.address}`, { x: 40, y, size: 12, font })
  y -= 15
  page.drawText(`NIP: ${customer.nip}`, { x: 40, y, size: 12, font })
  y -= 30

  const tableX = 40
  let tableY = y
  const rowHeight = 20
  const colWidths = [30, 120, 40, 40, 60, 40, 60]


  const headers = ['Lp.', 'Produkt', 'Ilość', 'Jedn.', 'Cena netto', 'VAT %', 'Cena brutto']
  headers.forEach((text, i) => {
    page.drawText(text, { x: tableX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y: tableY, size: 10, font: fontBold })
  })
  tableY -= rowHeight


  invoice.items.forEach((item, idx) => {
    const priceGross = item.priceNetto * (1 + (item.tax ?? 0)/100)
    const values = [
      (idx + 1).toString(),
      item.productName,
      item.amount.toString(),
      item.unit,
      item.priceNetto.toFixed(2),
      (item.tax ?? 0).toString(),
      priceGross.toFixed(2)
    ]
    values.forEach((text, i) => {
      page.drawText(text, { x: tableX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y: tableY, size: 10, font })
    })
    tableY -= rowHeight
  })

  if (invoice.paidStatus) {
    tableY -= 20
    page.drawText(`Zapłacono dnia: ${invoice.paidDate}`, { x: 40, y: tableY, size: 12, font })
  }

  const pdfBytes = await pdfDoc.save()

  event.node.res.setHeader("Content-Type", "application/pdf")
  return pdfBytes
})
