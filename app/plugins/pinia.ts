import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia: Pinia = createPinia()
  nuxtApp.vueApp.use(pinia)
})
