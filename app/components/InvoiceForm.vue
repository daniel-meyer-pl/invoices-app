<template>
  <form @submit.prevent="onSubmit" class="max-w-3xl mx-auto p-4 bg-white rounded shadow">
    <h2 class="text-lg font-medium mb-4">Create invoice</h2>

    <div class="grid grid-cols-2 gap-4 mb-4">
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
          <input v-model="form.customerId" placeholder="Customer ID (no customers yet)" required class="w-full border p-2 rounded" />
          <div class="mt-2">
            <button type="button" @click="goToCustomers" class="text-sm underline">Manage customers</button>
          </div>
        </div>
      </div>
      <div>
        <label class="block text-sm mb-1">Invoice number</label>
        <input v-model="form.invoiceNumber" required class="w-full border p-2 rounded" />
      </div>

      <div>
        <label class="block text-sm mb-1">Payment deadline</label>
        <input v-model="form.paymentDeadline" type="date" required class="w-full border p-2 rounded" />
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
    <div v-for="(item, idx) in form.items" :key="idx" class="mb-3 border p-3 rounded">
      <div class="grid grid-cols-4 gap-2">
        <input v-model="item.productName" placeholder="Product name" class="col-span-2 border p-2 rounded" />
        <input v-model.number="item.amount" type="number" min="0" placeholder="Amount" class="border p-2 rounded" />
        <input v-model="item.unit" placeholder="Unit" class="border p-2 rounded" />
      </div>

      <div class="grid grid-cols-3 gap-2 mt-2">
        <input v-model="item.priceNetto" placeholder="Price netto" class="border p-2 rounded" />
        <input v-model="item.priceGross" placeholder="Price gross" class="border p-2 rounded" />
        <input v-model.number="item.tax" type="number" min="0" placeholder="Tax %" class="border p-2 rounded" />
      </div>

      <div class="mt-2 flex justify-end">
        <button type="button" @click="removeItem(idx)" class="text-sm text-red-600">Remove</button>
      </div>
    </div>

    <div class="mb-4">
      <button type="button" @click="addItem" class="text-sm underline">+ Add item</button>
    </div>

    <div class="flex items-center space-x-2">
      <button :disabled="submitting" type="submit" class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
        Create
      </button>
      <button type="button" @click="reset" class="text-sm text-gray-600">Reset</button>
      <div v-if="error" class="text-sm text-red-600 ml-3">{{ error }}</div>
      <div v-if="success" class="text-sm text-green-600 ml-3">Created</div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { navigateTo } from '#imports'

const emit = defineEmits<{
  (e: 'created', invoiceId: string): void
}>()

const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

type Item = {
  productName: string
  amount: number | string
  unit: string
  priceNetto: string | number
  priceGross: string | number
  tax: number
}

const defaultItem = (): Item => ({
  productName: '',
  amount: 1,
  unit: 'pcs',
  priceNetto: '',
  priceGross: '',
  tax: 23
})

const form = reactive({
  customerId: '',
  invoiceNumber: '',
  paymentDeadline: '',
  paymentType: 'transfer',
  currencyCode: 'PLN',
  paidStatus: false,
  paidDate: '' as string | null,
  priceNetto: '' as string | number,
  priceGross: '' as string | number,
  items: [defaultItem()] as Item[]
})

// new: customers list
const customers = ref<Array<{ id: string; companyName?: string | null; firstname?: string | null; lastname?: string | null }>>([])

async function loadCustomers() {
  try {
    const res = await $fetch('/api/customers', { credentials: 'include' })
    customers.value = res.customers || []
  } catch (e) {
    // ignore; user can still enter ID manually
    customers.value = []
  }
}

onMounted(() => {
  loadCustomers()
})

function addItem() {
  form.items.push(defaultItem())
}

function removeItem(idx: number) {
  form.items.splice(idx, 1)
}

function reset() {
  form.customerId = ''
  form.invoiceNumber = ''
  form.paymentDeadline = ''
  form.paymentType = 'transfer'
  form.currencyCode = 'PLN'
  form.paidStatus = false
  form.paidDate = ''
  form.priceNetto = ''
  form.priceGross = ''
  form.items = [defaultItem()]
  success.value = false
  error.value = null
}

function goToCustomers() {
  navigateTo('customers')
}

async function onSubmit() {
  error.value = null
  success.value = false
  submitting.value = true

  if (!form.customerId || !form.invoiceNumber || !form.paymentDeadline) {
    error.value = 'Missing required fields'
    submitting.value = false
    return
  }

  try {
    const payload = {
      customerId: form.customerId,
      invoiceNumber: form.invoiceNumber,
      paymentDeadline: form.paymentDeadline,
      paymentType: form.paymentType,
      currencyCode: form.currencyCode,
      paidStatus: form.paidStatus,
      paidDate: form.paidDate || null,
      priceNetto: String(form.priceNetto || 0),
      priceGross: String(form.priceGross || 0),
      items: form.items.map(i => ({
        productName: i.productName,
        amount: String(i.amount),
        unit: i.unit,
        priceNetto: String(i.priceNetto),
        priceGross: String(i.priceGross),
        tax: Number(i.tax)
      }))
    }

    const res = await $fetch('/api/invoices', {
      method: 'POST',
      body: payload,
      credentials: 'include'
    })

    // try to get id from response
    const created: any = res
    const id = created?.invoice?.id
    success.value = true
    emit('created', id || '')
    // redirect to created invoice or list
    if (id) navigateTo(`/invoices/${id}`)
    else navigateTo('/')

  } catch (err: any) {
    error.value = err?.statusMessage || err?.message || 'Failed to create'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* minimal spacing handled by utility classes */
</style>
