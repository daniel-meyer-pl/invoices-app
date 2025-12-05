<template>
  <div class="bg-white p-4 rounded shadow">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium">Customers</h2>
      <div v-if="invoiceId" class="text-sm text-gray-600">Invoice: {{ invoiceId }}</div>
    </div>

    <div v-if="loading" class="text-sm text-gray-500 mb-2">Loading...</div>
    <div v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</div>

    <div class="mb-4">
      <form @submit.prevent="onCreate" class="grid grid-cols-3 gap-2">
        <input v-model="newCustomer.firstname" placeholder="First name" class="border p-2 rounded" />
        <input v-model="newCustomer.lastname" placeholder="Last name" class="border p-2 rounded" />
        <input v-model="newCustomer.companyName" placeholder="Company name" class="border p-2 rounded" />
        <input v-model="newCustomer.address" placeholder="Address" class="border p-2 rounded col-span-2" />
        <input v-model="newCustomer.nip" placeholder="NIP" class="border p-2 rounded" />
        <div class="flex items-center space-x-2">
          <button class="bg-green-600 text-white px-3 py-2 rounded text-sm" :disabled="creating">Create</button>
          <button type="button" @click="resetNew" class="text-sm text-gray-600">Reset</button>
        </div>
      </form>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full border">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="px-3 py-2">Select</th>
            <th class="px-3 py-2">Company</th>
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Address</th>
            <th class="px-3 py-2">NIP</th>
            <th class="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in customers" :key="c.id" class="border-t">
            <td class="px-3 py-2">
              <button @click="selectCustomer(c.id)" class="bg-blue-600 text-white px-2 py-1 rounded text-sm">Select</button>
            </td>
            <td class="px-3 py-2">
              <div v-if="editId !== c.id">{{ c.companyName || '—' }}</div>
              <input v-else v-model="edit.companyName" class="border p-1 rounded w-full" />
            </td>
            <td class="px-3 py-2">
              <div v-if="editId !== c.id">{{ (c.firstname || '') + ' ' + (c.lastname || '') }}</div>
              <div v-else class="grid grid-cols-2 gap-1">
                <input v-model="edit.firstname" placeholder="First" class="border p-1 rounded" />
                <input v-model="edit.lastname" placeholder="Last" class="border p-1 rounded" />
              </div>
            </td>
            <td class="px-3 py-2">
              <div v-if="editId !== c.id">{{ c.address || '—' }}</div>
              <input v-else v-model="edit.address" class="border p-1 rounded w-full" />
            </td>
            <td class="px-3 py-2">
              <div v-if="editId !== c.id">{{ c.nip || '—' }}</div>
              <input v-else v-model="edit.nip" class="border p-1 rounded w-full" />
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button v-if="editId !== c.id" @click="startEdit(c)" class="text-sm text-yellow-600">Edit</button>
                <button v-else @click="saveEdit(c.id)" class="text-sm text-green-600">Save</button>
                <button v-if="editId === c.id" @click="cancelEdit" class="text-sm text-gray-600">Cancel</button>
                <button @click="removeCustomer(c.id)" class="text-sm text-red-600">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="customers.length === 0">
            <td colspan="6" class="px-3 py-4 text-center text-gray-500">No customers yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const props = defineProps<{ invoiceId?: string }>()
const emit = defineEmits<{
  (e: 'selected', id: string): void
}>()

type Customer = {
  id: string
  companyName?: string | null
  firstname?: string | null
  lastname?: string | null
  address?: string | null
  nip?: string | null
}

const customers = ref<Customer[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const creating = ref(false)

// new reactive state for creating a customer
const newCustomer = reactive({
  firstname: '',
  lastname: '',
  companyName: '',
  address: '',
  nip: ''
})

const editId = ref<string | null>(null)
const edit = reactive({
  firstname: '',
  lastname: '',
  companyName: '',
  address: '',
  nip: ''
})

async function loadCustomers() {
  loading.value = true
  error.value = null
  try {
    const res = await $fetch('/api/customers', { credentials: 'include' })
    customers.value = res.customers || []
  } catch (e: any) {
    error.value = e?.statusMessage || e?.message || 'Failed to load customers'
  } finally {
    loading.value = false
  }
}

function resetNew() {
  newCustomer.firstname = ''
  newCustomer.lastname = ''
  newCustomer.companyName = ''
  newCustomer.address = ''
  newCustomer.nip = ''
}

async function onCreate() {
  creating.value = true
  try {
    const payload = {
      firstname: newCustomer.firstname || null,
      lastname: newCustomer.lastname || null,
      companyName: newCustomer.companyName || null,
      address: newCustomer.address || null,
      nip: newCustomer.nip || null,
    }
    const res = await $fetch('/api/customers', { method: 'POST', body: payload, credentials: 'include' })
    customers.value.unshift(res.customer)
    resetNew()
  } catch (e: any) {
    error.value = e?.statusMessage || e?.message || 'Failed to create'
  } finally {
    creating.value = false
  }
}

function startEdit(c: Customer) {
  editId.value = c.id
  edit.firstname = c.firstname || ''
  edit.lastname = c.lastname || ''
  edit.companyName = c.companyName || ''
  edit.address = c.address || ''
  edit.nip = c.nip || ''
}

function cancelEdit() {
  editId.value = null
}

async function saveEdit(id: string) {
  try {
    const payload: any = {
      firstname: edit.firstname || null,
      lastname: edit.lastname || null,
      companyName: edit.companyName || null,
      address: edit.address || null,
      nip: edit.nip || null,
    }
    const res = await $fetch(`/api/customers/${id}`, { method: 'PATCH', body: payload, credentials: 'include' })
    const idx = customers.value.findIndex(x => x.id === id)
    if (idx !== -1) customers.value[idx] = res.customer
    editId.value = null
  } catch (e: any) {
    error.value = e?.statusMessage || e?.message || 'Failed to update'
  }
}

async function removeCustomer(id: string) {
  if (!confirm('Delete this customer?')) return
  try {
    await $fetch(`/api/customers/${id}`, { method: 'DELETE', credentials: 'include' })
    customers.value = customers.value.filter(c => c.id !== id)
  } catch (e: any) {
    error.value = e?.statusMessage || e?.message || 'Failed to delete'
  }
}

function selectCustomer(id: string) {
  emit('selected', id)
}

onMounted(() => {
  loadCustomers()
})
</script>

<style scoped>
/* keep simple styles; layout uses utility classes */
</style>
