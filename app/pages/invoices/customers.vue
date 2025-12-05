<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-semibold mb-4">Manage customers</h1>
    <CustomerManager @selected="onSelected" />
  </div>
</template>

<script setup lang="ts">
import CustomerManager from '../../components/CustomerManager.vue'
const router = useRouter()

function onSelected(id: string) {
  navigateTo(`/invoices/create?customer=${id}`)
}
</script>
