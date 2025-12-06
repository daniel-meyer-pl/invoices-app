<template>
<nav class="bg-black text-white">
  <ul class="flex items-center px-6 py-3">
    
    <!-- LEFT -->
    <li>
      <NuxtLink to="/" class="hover:text-gray-300 transition">
        Invoices
      </NuxtLink>
    </li>

    <!-- RIGHT -->
    <div class="flex items-center space-x-6 ml-auto">
      
      <li>
        <NuxtLink to="/account" class="hover:text-gray-300 transition">
          Account
        </NuxtLink>
      </li>

      <li v-if="auth.isLoggedIn">
        <button 
          @click="auth.logout()" 
          class="hover:text-gray-300 transition"
        >
          Logout
        </button>
      </li>

      <li v-else>
        <NuxtLink to="/login" class="hover:text-gray-300 transition">
          Login
        </NuxtLink>
      </li>
      <li v-if="auth.user?.avatar">
        <img 
          :src="auth.user.avatar"
          alt="avatar"
          class="w-8 h-8 rounded-full object-cover border border-gray-600"
        />
      </li>
    </div>

  </ul>
</nav>
</template>
<script setup lang="ts">
import { useAuthStore } from "~/stores/auth"

const auth = useAuthStore()

</script>