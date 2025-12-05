import { useAuthStore } from "../stores/auth"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuthStore()
  await auth.init()

  if (!auth.isLoggedIn && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  if (auth.isLoggedIn && to.path === '/login') {
    return navigateTo('/')
  }
})