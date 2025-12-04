<template>
    <form @submit="handleFormSubmit">
        <input v-model="username" type="text" placeholder="Username" />
        <input v-model="password" type="password" placeholder="Password" />
        <button type="submit">Log in</button>
    </form>
</template>

<script setup lang="tsx">
const username = ref('')
const password = ref('')

const { data } = await useFetch('/api/data')

async function handleFormSubmit () {
  const res = await $fetch('/api/auth/login', {
    method: 'POST',
    body: {
      // My form data
    },
  })
}
</script>