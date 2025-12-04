function isAuthenticated() {
    return true
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (!to.path.startsWith('/login') && isAuthenticated() === false) {
    return navigateTo('/login')
  }
})