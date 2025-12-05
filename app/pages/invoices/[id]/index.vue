<script setup lang="ts">
definePageMeta({
  pageTransition: {
    name: 'slide-right',
    mode: 'out-in',
  },
  middleware (to, from) {
    if (to.meta.pageTransition && typeof to.meta.pageTransition !== 'boolean') {
      to.meta.pageTransition.name = +to.params.id! > +from.params.id! ? 'slide-left' : 'slide-right'
    }
  },
})

import { useRoute, useRouter } from '#imports'
import { useUiStore } from '../../../stores/ui'
import InvoiceEditForm from '../../../components/InvoiceEditForm.vue'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const id = String(route.params.id || '')

function onSaved(invoiceId: string) {
  ui.setMessage('Invoice saved')
  router.push('/')
}

function onCancel() {
  router.back()
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <InvoiceEditForm :invoiceId="id" @saved="onSaved" @cancel="onCancel" />
  </div>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translate(50px, 0);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translate(-50px, 0);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}
</style>