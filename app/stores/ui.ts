import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const message = ref<string | null>(null)
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function setMessage(msg: string, duration = 5000) {
    message.value = msg
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      message.value = null
      timeoutId = null
    }, duration)
  }

  function clearMessage() {
    if (timeoutId) clearTimeout(timeoutId)
    message.value = null
    timeoutId = null
  }

  return { message, setMessage, clearMessage }
})
