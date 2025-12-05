<template>
    <nav>
        <ul>
        <li><NuxtLink to="/">Invoices</NuxtLink></li>
        <li><NuxtLink to="/account">Account</NuxtLink></li>        
        <!-- <li><NuxtLink to="/posts/1">Post 1</NuxtLink></li>
        <li><NuxtLink to="/posts/2">Post 2</NuxtLink></li> -->
        <li v-if="auth.isLoggedIn"><button @click="auth.logout()">Logout</button></li>
        <li v-else><NuxtLink to="/login">Login</NuxtLink></li>
        </ul>
    </nav>
</template>
<script setup lang="ts">
import { useAuthStore } from "~/stores/auth"

const auth = useAuthStore()

</script>