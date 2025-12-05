<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-semibold mb-4">Invoices</h1>

    <!-- flash message -->
    <div v-if="ui.message" class="mb-4 p-2 bg-green-100 text-green-800 rounded">
      {{ ui.message }}
    </div>

    <!-- Create invoice button -->
    <div class="mb-4">
      <button @click="goToCreate" class="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
        Create invoice
      </button>
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Loading...</div>
    <div v-else>
      <div v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</div>
      <table class="min-w-full bg-white border">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="px-4 py-2">Invoice number</th>
            <th class="px-4 py-2">Created date</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Pay deadline</th>
            <th class="px-4 py-2">Customer company</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id" class="border-t">
            <td class="px-4 py-2 align-top">{{ inv.invoiceNumber }}</td>
            <td class="px-4 py-2 align-top">{{ formatDate(inv.createdAt) }}</td>
            <td class="px-4 py-2 align-top">{{ inv.paidStatus ? 'Paid' : 'Unpaid' }}</td>
            <td class="px-4 py-2 align-top">{{ inv.paymentDeadline ? formatDate(inv.paymentDeadline) : '—' }}</td>
            <td class="px-4 py-2 align-top">{{ inv.customer?.companyName || (inv.customer?.firstname ? inv.customer.firstname : '—') }}</td>
            <td class="px-4 py-2 align-top">
              <button @click="viewInvoice(inv.id)" class="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700">
                Invoice
              </button>
            </td>
          </tr>
          <tr v-if="invoices.length === 0">
            <td colspan="6" class="px-4 py-4 text-center text-gray-500">No invoices found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '#imports'
import { useUiStore } from '../stores/ui'
import type { Invoice, InvoicesListResponse } from '~~/types/invoice'

useHead({ title: 'Invoices' })

const invoices = ref<Invoice[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const ui = useUiStore()

async function loadInvoices() {
  try {
    const res = await $fetch<InvoicesListResponse>('/api/invoices', { credentials: 'include' })
    invoices.value = res.invoices || []
  } catch (e: any) {
    error.value = e?.statusMessage || e?.message || 'Failed to load invoices'
  } finally {
    loading.value = false
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function goToCreate() {
  navigateTo('/invoices/create')
}

function viewInvoice(id: string) {
  navigateTo(`/invoices/${id}`)
}

onMounted(() => {
  loadInvoices()
})
</script>