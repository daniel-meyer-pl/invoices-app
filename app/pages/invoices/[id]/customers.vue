<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-semibold mb-4">Invoice {{ id }} — Customers</h1>
    <CustomerManager :invoiceId="id" @selected="onSelected" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import CustomerManager from '../../../components/CustomerManager.vue'
import { useUiStore } from '../../../stores/ui'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const id = String(route.params.id || '')

function onSelected(customerId: string) {
  ui.setMessage('Customer selected')
  router.push(`/invoices/${id}`)
}
</script>
