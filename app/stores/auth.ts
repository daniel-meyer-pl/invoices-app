import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    jwt: null
  }),

  actions: {
    async googleLogin(token: string) {
      const res = await $fetch("/api/auth/google", {
        method: "POST",
        body: { token }
      })

      this.user = res.user
      this.jwt = res.jwt
      localStorage.setItem("jwt", res.jwt)
    }
  }
})
