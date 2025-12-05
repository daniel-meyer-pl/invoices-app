import { defineStore } from "pinia"
import { ref } from "vue"

interface User {
  id: string
  email: string
  name: string
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref<Boolean | null>(null)

  async function init() {
    if (isLoggedIn.value !== null) return
    try {
      const res = await $fetch("/api/auth/me", {
        credentials: "include"
      })
      isLoggedIn.value = res.loggedIn
      if (res.loggedIn) user.value = res.user
    } catch (e) {
      isLoggedIn.value = false
      user.value = null
    }
  }

  async function googleLogin(token: string) {
    const res = await $fetch("/api/auth/google", {
      method: "POST",
      body: { credential: token },
      credentials: "include"
    })
    user.value = res.user
    isLoggedIn.value = res.loggedIn
    navigateTo("/")
  }

  async function logout() {
    await $fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    })
    user.value = null
    isLoggedIn.value = false
    navigateTo("/login")
  }

  return { user, isLoggedIn, init, googleLogin, logout }
})
