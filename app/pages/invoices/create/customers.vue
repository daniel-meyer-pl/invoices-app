<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-semibold mb-4">Manage customers (for creating invoice)</h1>
    <CustomerManager @selected="onSelected" />
  </div>
</template>

<script setup lang="ts">
import CustomerManager from '~/components/CustomerManager.vue'
import { useRouter } from '#imports'
const router = useRouter()

function onSelected(id: string) {
  // navigate back to invoice create page and pass selected customer id via query
  router.push({ path: '/invoices/create', query: { customer: id } })
}
</script>
