<template>
  <div>
    <div v-if="loading" class="text-sm text-gray-500">Loading...</div>
    <div v-else>
      <div v-if="error" class="mb-4 text-red-600">{{ error }}</div>

      <form @submit.prevent="onSubmit" class="bg-white p-4 rounded shadow">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm mb-1">Invoice number</label>
            <input v-model="form.invoiceNumber" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block text-sm mb-1">Customer</label>
            <div v-if="customers.length">
              <div class="flex items-center gap-2">
                <select v-model="form.customerId" required class="w-full border p-2 rounded">
                  <option value="" disabled>Select a customer</option>
                  <option v-for="c in customers" :key="c.id" :value="c.id">
                    {{ c.companyName || `${c.firstname || ''} ${c.lastname || ''}`.trim() || c.id }}
                  </option>
                </select>
                <button type="button" @click="goToCustomers" class="bg-gray-200 px-2 py-1 rounded text-sm hover:bg-gray-300">
                  Manage customers
                </button>
              </div>
            </div>
            <div v-else>
              <input v-model="form.customerId" placeholder="Customer ID (no customers yet)" class="w-full border p-2 rounded" />
              <div class="mt-2">
                <button type="button" @click="goToCustomers" class="text-sm underline">Manage customers</button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm mb-1">Payment deadline</label>
            <input v-model="form.paymentDeadline" type="date" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block text-sm mb-1">Payment type</label>
            <input v-model="form.paymentType" class="w-full border p-2 rounded" />
          </div>

          <div>
            <label class="block text-sm mb-1">Currency</label>
            <input v-model="form.currencyCode" class="w-full border p-2 rounded" />
          </div>

          <div class="flex items-center space-x-2">
            <label class="inline-flex items-center">
              <input type="checkbox" v-model="form.paidStatus" class="mr-2" />
              <span class="text-sm">Paid</span>
            </label>
            <input v-if="form.paidStatus" v-model="form.paidDate" type="date" class="w-full border p-2 rounded" />
          </div>
        </div>

        <h3 class="font-medium mb-2">Items</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full border">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-2 py-1 text-left">Product</th>
                <th class="px-2 py-1 text-left">Amount</th>
                <th class="px-2 py-1 text-left">Unit</th>
                <th class="px-2 py-1 text-left">Price netto</th>
                <th class="px-2 py-1 text-left">Price gross</th>
                <th class="px-2 py-1 text-left">Tax %</th>
                <th class="px-2 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in form.items" :key="item.id ?? idx" class="border-t">
                <td class="px-2 py-1"><input v-model="item.productName" class="w-full border p-1 rounded" /></td>
                <td class="px-2 py-1"><input v-model="item.amount" type="number" min="0" class="w-full border p-1 rounded" /></td>
                <td class="px-2 py-1"><input v-model="item.unit" class="w-full border p-1 rounded" /></td>
                <td class="px-2 py-1"><input v-model="item.priceNetto" class="w-full border p-1 rounded" /></td>
                <td class="px-2 py-1"><input v-model="item.priceGross" class="w-full border p-1 rounded" /></td>
                <td class="px-2 py-1"><input v-model.number="item.tax" type="number" min="0" class="w-full border p-1 rounded" /></td>
                <td class="px-2 py-1">
                  <button type="button" @click="removeItem(idx)" class="text-red-600 text-sm">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-2 mb-4">
          <button type="button" @click="addItem" class="text-sm underline">+ Add item</button>
        </div>

        <div class="flex items-center space-x-2">
          <button :disabled="submitting" type="submit" class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
            Save
          </button>
          <button type="button" @click="onCancel" class="text-sm text-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { PropType } from 'vue'
import { useRouter, navigateTo } from '#imports'

const props = defineProps({
  invoiceId: { type: String as PropType<string>, required: true }
})
const emit = defineEmits<{
  (e: 'saved', id: string): void
  (e: 'cancel'): void
}>()

const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const submitting = ref(false)

type ItemForm = {
  id?: string | null
  productName: string
  amount: string
  unit: string
  priceNetto: string
  priceGross: string
  tax: number
}

const form = reactive({
  invoiceNumber: '',
  paymentDeadline: '',
  paymentType: '',
  currencyCode: 'PLN',
  paidStatus: false,
  paidDate: '' as string | null,
  customerId: '',
  items: [] as ItemForm[],
})

// new: customers list (if not present)
const customers = ref<Array<{ id: string; companyName?: string | null; firstname?: string | null; lastname?: string | null }>>([])

async function loadCustomers() {
  try {
    const res = await $fetch('/api/customers', { credentials: 'include' })
    customers.value = res.customers || []
  } catch (e) {
    customers.value = []
  }
}

async function loadInvoice() {
  loading.value = true
  error.value = null
  try {
    const res = await $fetch(`/api/invoices/${props.invoiceId}`, { credentials: 'include' })
    const invoice = res?.invoice
    if (!invoice) {
      error.value = 'Invoice not found'
      return
    }
    form.invoiceNumber = invoice.invoiceNumber || ''
    form.paymentDeadline = invoice.paymentDeadline ? invoice.paymentDeadline.split('T')[0] : ''
    form.paymentType = invoice.paymentType || ''
    form.currencyCode = invoice.currencyCode || 'PLN'
    form.paidStatus = !!invoice.paidStatus
    form.paidDate = invoice.paidDate ? invoice.paidDate.split('T')[0] : ''
    form.customerId = invoice.customerId || ''
    form.items = (invoice.items || []).map((it: any) => ({
      id: it.id,
      productName: it.productName || '',
      amount: it.amount != null ? String(it.amount) : '0',
      unit: it.unit || '',
      priceNetto: it.priceNetto != null ? String(it.priceNetto) : '0',
      priceGross: it.priceGross != null ? String(it.priceGross) : '0',
      tax: typeof it.tax === 'number' ? it.tax : Number(it.tax) || 0,
    }))
  } catch (e: any) {
    error.value = e?.statusMessage || e?.message || 'Failed to load invoice'
  } finally {
    loading.value = false
  }
}

function addItem() {
  form.items.push({
    productName: '',
    amount: '1',
    unit: 'pcs',
    priceNetto: '0',
    priceGross: '0',
    tax: 23,
  })
}

function removeItem(index: number) {
  form.items.splice(index, 1)
}

function onCancel() {
  emit('cancel')
}

async function onSubmit() {
  error.value = null
  submitting.value = true

  if (!form.invoiceNumber || !form.paymentDeadline) {
    error.value = 'Invoice number and payment deadline are required'
    submitting.value = false
    return
  }

  const payload: any = {
    invoiceNumber: form.invoiceNumber,
    paymentDeadline: form.paymentDeadline,
    paymentType: form.paymentType,
    currencyCode: form.currencyCode,
    paidStatus: Boolean(form.paidStatus),
    paidDate: form.paidStatus && form.paidDate ? form.paidDate : null,
    customerId: form.customerId,
    items: form.items.map(i => ({
      productName: i.productName,
      amount: String(i.amount),
      unit: i.unit,
      priceNetto: String(i.priceNetto),
      priceGross: String(i.priceGross),
      tax: Number(i.tax),
    })),
  }

  try {
    const res = await $fetch(`/api/invoices/${props.invoiceId}`, {
      method: 'PATCH',
      body: payload,
      credentials: 'include'
    })
    const updatedId = res?.invoice?.id ?? props.invoiceId
    emit('saved', updatedId)
  } catch (e: any) {
    error.value = e?.statusMessage || e?.message || 'Failed to save invoice'
  } finally {
    submitting.value = false
  }
}

function goToCustomers() {
  navigateTo('customers')
}

onMounted(() => {
  loadCustomers()
  loadInvoice()
})
</script>

