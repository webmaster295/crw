<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div class="w-20 h-20 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center overflow-hidden">
            <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-contain p-1" alt="logo" />
            <span v-else class="text-white text-3xl">🏫</span>
          </div>
          <h1 class="text-white font-bold text-xl">{{ schoolName }}</h1>
          <p class="text-blue-200 text-sm mt-1">เข้าสู่ระบบสมาชิก</p>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-5">

          <div>
            <label class="label">อีเมล</label>
            <input
              v-model="email"
              type="email"
              placeholder="example@email.com"
              class="input-field"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="label">รหัสผ่าน</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                placeholder="••••••••"
                class="input-field pr-10"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPass = !showPass"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {{ showPass ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
            <span>⚠️</span> {{ errorMsg }}
          </div>

          <!-- Login Button — NO form wrapper, pure @click -->
          <button
            type="button"
            :disabled="isLoading"
            @click="handleLogin"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              ยังไม่มีบัญชี?
              <RouterLink to="/register" class="text-blue-600 font-semibold hover:text-blue-800">สมัครสมาชิก</RouterLink>
            </p>
          </div>

          <div class="text-center">
            <RouterLink to="/" class="text-sm text-gray-400 hover:text-gray-600">← กลับหน้าแรก</RouterLink>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'

const router   = useRouter()
const email    = ref('')
const password = ref('')
const showPass = ref(false)
const isLoading = ref(false)
const errorMsg  = ref('')
const schoolName = ref('ระบบโรงเรียน')
const logoUrl = ref('')

// โหลดชื่อโรงเรียนและโลโก้หลัง mount
onMounted(async () => {
  try {
    const { data } = await supabase
      .from('school_config')
      .select('name_th, logo_url')
      .eq('id', 1)
      .maybeSingle()
    if (data?.name_th) schoolName.value = data.name_th
    if (data?.logo_url) logoUrl.value = data.logo_url
  } catch (_) { /* ไม่เป็นไรถ้า config ยังไม่มี */ }
})

async function handleLogin() {
  const emailVal    = email.value?.trim()
  const passwordVal = password.value

  if (!emailVal || !passwordVal) {
    errorMsg.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }

  isLoading.value = true
  errorMsg.value  = ''

  try {
    // 1. Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailVal,
      password: passwordVal,
    })
    if (error) throw error

    // 2. ดึง profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_approved')
      .eq('id', data.user.id)
      .maybeSingle()

    // 3. Redirect ตาม role
    if (profile?.role === 'admin' && profile?.is_approved) {
      router.push('/admin')
    } else if (profile?.is_approved) {
      router.push('/dashboard')
    } else {
      router.push('/request-access')
    }

  } catch (err) {
    const msg = err?.message || ''
    if (msg.includes('Invalid login credentials')) {
      errorMsg.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    } else if (msg.includes('Email not confirmed')) {
      errorMsg.value = 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
    } else {
      errorMsg.value = msg || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
