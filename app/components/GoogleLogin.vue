<template>
  <div>
    <div id="google-btn"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { useAuthStore } from "../stores/auth"

const auth = useAuthStore()

onMounted(() => {
  google.accounts.id.initialize({
    client_id: useRuntimeConfig().public.googleClientId,
    callback: handleLogin
  })

  google.accounts.id.renderButton(
    document.getElementById("google-btn"),
    { theme: "outline", size: "large", shape: "pill" }
  )
})

async function handleLogin(response) {
  const token = response.credential
  await auth.googleLogin(token)
}
</script>
