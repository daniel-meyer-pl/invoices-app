<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-semibold mb-4">Create Invoice</h1>
    <InvoiceForm @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
import InvoiceForm from '~/components/InvoiceForm.vue'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

function onCreated(id: string) {
  ui.setMessage('Invoice created')
  navigateTo('/')
}
</script>
