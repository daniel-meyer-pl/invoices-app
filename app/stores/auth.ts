import { defineStore } from "pinia"
import { ref } from "vue"
import type { PublicUser, UserApiResponse } from "~~/types/user"

export const useAuthStore = defineStore("auth", () => {
  const user = ref<PublicUser | null>(null)
  const isLoggedIn = ref<Boolean | null>(null)

  async function init() {
    console.log("Auth store init")
    if (isLoggedIn.value !== null) return
    try {
      const res = await $fetch<UserApiResponse>("/api/auth/me", {
        credentials: "include"
      })
      isLoggedIn.value = res.loggedIn
      user.value = res.user || null
      console.log("res", res.user)

    } catch (e) {
      console.log(e)
      isLoggedIn.value = false
      user.value = null
    }
  }

  async function googleLogin(token: string) {
    const res = await $fetch<UserApiResponse>("/api/auth/google", {
      method: "POST",
      body: { credential: token },
      credentials: "include"
    })
    user.value = res.user || null
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
