<template>
  <div class="container mx-auto p-4 max-w-xl">
    <h1 class="text-2xl font-semibold mb-4">Account</h1>

    <div v-if="loading" class="text-sm text-gray-500">Loading...</div>
    <div v-else>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Full name</label>
          <input v-model="form.fullname" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Company name</label>
          <input v-model="form.companyName" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Bank account number</label>
          <input v-model="form.bankAccountNumber" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Address</label>
          <input v-model="form.address" type="text" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">NIP</label>
          <input v-model="form.nip" type="text" class="w-full border p-2 rounded" />
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="submit"
            :disabled="submitting"
            class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Save
          </button>
          <button type="button" @click="resetForm" class="text-sm text-gray-600">Reset</button>
        </div>

        <div v-if="success" class="text-sm text-green-600">Saved successfully.</div>
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue'
import { useHead } from '#imports'
import { useAuthStore } from '~~/app/stores/auth'
import type { UserApiResponse, PatchUserData } from '~~/types/user'

useHead({ title: 'Account' })

const auth = useAuthStore()
const loading = ref(true)
const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const defaultForm = reactive<PatchUserData>({
  fullname: null,
  email: '',
  companyName: null,
  bankAccountNumber: null,
  address: null,
  nip: null,
})

const form = reactive<PatchUserData>({ ...defaultForm })

function populateFormFromUser() {
  const u = auth.user
  if (!u) return
  form.fullname = (u.fullname ?? null) as string | null
  form.email = (u.email ?? '') as string
  form.companyName = (u.companyName ?? null) as string | null
  form.bankAccountNumber = (u.bankAccountNumber ?? null) as string | null
  form.address = (u.address ?? null) as string | null
  form.nip = (u.nip ?? null) as string | null
}

function resetForm() {
  Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
  populateFormFromUser()
  success.value = false
  error.value = null
}

watch(
  () => auth.user,
  () => {
    populateFormFromUser()
  },
  { immediate: true }
)

async function init() {
  try {
    await auth.init()
  } finally {
    loading.value = false
  }
}

await init()

async function onSubmit() {
  error.value = null
  success.value = false
  submitting.value = true

  const payload: PatchUserData = {}
  for (const key of Object.keys(form) as (keyof PatchUserData)[]) {
    if (form[key] !== undefined) {
      // @ts-ignore
      payload[key] = form[key] === '' ? null : form[key]
    }
  }

  if (Object.keys(payload).length === 0) {
    error.value = 'No changes to save.'
    submitting.value = false
    return
  }

  try {
    const res = await $fetch<UserApiResponse>('/api/users', {
      method: 'PATCH',
      body: payload,
      credentials: 'include'
    })
    if (res.loggedIn) {
      auth.user = res.user || null
      success.value = true
    } else {
      error.value = 'Not logged in.'
    }
  } catch (err: any) {
    error.value = err?.statusMessage || err?.message || 'Failed to save'
  } finally {
    submitting.value = false
  }
}
</script>