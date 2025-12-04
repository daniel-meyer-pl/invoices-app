<template>
  <div>
    <button @click="generatePdf">Generate PDF</button>
  </div>
</template>

<script setup>
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

pdfMake.vfs = pdfFonts.pdfMake.vfs

const generatePdf = () => {
  const invoiceData = {
    invoiceNumber: "FV/2025/001",
    date: "2025-12-04",
    dueDate: "2025-12-14",
    company: {
      name: "Twoja Firma Sp. z o.o.",
      address: "ul. Przykładowa 10, 00-001 Warszawa",
      nip: "1234567890"
    },
    customer: {
      name: "Jan Kowalski",
      address: "ul. Klienta 5, 00-002 Warszawa",
      nip: "0987654321"
    },
    items: [
      { name: "Produkt A", qty: 2, unit: "szt.", priceNet: 50, tax: 23 },
      { name: "Produkt B", qty: 1, unit: "szt.", priceNet: 100, tax: 23 }
    ],
    currency: "PLN"
  }

  const tableBody = [
    ["Lp.", "Nazwa produktu", "Ilość", "Jedn.", "Cena netto", "VAT", "Cena brutto"]
  ]

  invoiceData.items.forEach((item, index) => {
    const priceGross = item.priceNet * (1 + item.tax / 100)
    tableBody.push([
      index + 1,
      item.name,
      item.qty,
      item.unit,
      item.priceNet.toFixed(2),
      item.tax + "%",
      priceGross.toFixed(2)
    ])
  })

  const docDefinition = {
    content: [
      { text: `Faktura ${invoiceData.invoiceNumber}`, style: "header" },
      { text: `Data wystawienia: ${invoiceData.date}` },
      { text: `Termin płatności: ${invoiceData.dueDate}\n\n` },

      { text: "Sprzedawca:", style: "subheader" },
      {
        text: `${invoiceData.company.name}\n${invoiceData.company.address}\nNIP: ${invoiceData.company.nip}\n\n`
      },

      { text: "Nabywca:", style: "subheader" },
      {
        text: `${invoiceData.customer.name}\n${invoiceData.customer.address}\nNIP: ${invoiceData.customer.nip}\n\n`
      },

      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto"],
          body: tableBody
        }
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
    },
    defaultStyle: { fontSize: 12 }
  }

  pdfMake.createPdf(docDefinition).download(`${invoiceData.invoiceNumber}.pdf`)
}
</script>
