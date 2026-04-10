<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h1 class="text-white font-bold text-xl">สมัครสมาชิก</h1>
          <p class="text-blue-200 text-sm mt-1">สำหรับครูและบุคลากรโรงเรียน</p>
        </div>

        <div class="p-8">
          <form @submit.prevent="handleRegister" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">ชื่อ</label>
                <input v-model="form.firstName" type="text" required placeholder="ชื่อ" class="input-field" />
              </div>
              <div>
                <label class="label">นามสกุล</label>
                <input v-model="form.lastName" type="text" required placeholder="นามสกุล" class="input-field" />
              </div>
            </div>

            <div>
              <label class="label">อีเมล</label>
              <input v-model="form.email" type="email" required placeholder="example@email.com" class="input-field" />
            </div>

            <div>
              <label class="label">รหัสผ่าน</label>
              <input v-model="form.password" type="password" required placeholder="อย่างน้อย 6 ตัวอักษร" class="input-field" />
            </div>

            <div>
              <label class="label">ยืนยันรหัสผ่าน</label>
              <input v-model="form.confirmPassword" type="password" required placeholder="ยืนยันรหัสผ่าน" class="input-field" />
            </div>

            <div>
              <label class="label">รหัสลงทะเบียน <span class="text-gray-400 text-xs font-normal">(สอบถามจากผู้ดูแลระบบ)</span></label>
              <input v-model="form.registerCode" type="text" placeholder="กรอกรหัสที่ได้รับจากโรงเรียน"
                class="input-field font-mono" autocomplete="off" />
            </div>

            <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {{ errorMsg }}</div>
            <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">✅ สมัครสมาชิกสำเร็จ! รอการอนุมัติจากผู้ดูแลระบบ</div>

            <button type="submit" :disabled="isLoading || success"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">มีบัญชีแล้ว?
              <RouterLink to="/login" class="text-blue-600 font-semibold hover:text-blue-800">เข้าสู่ระบบ</RouterLink>
            </p>
          </div>
          <div class="mt-3 text-center">
            <RouterLink to="/" class="text-sm text-gray-400 hover:text-gray-600">← กลับหน้าแรก</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { supabase } from '../../lib/supabase'

const { signUp } = useAuth()
const form = ref({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', registerCode: '' })
const isLoading = ref(false)
const errorMsg = ref('')
const success = ref(false)

async function handleRegister() {
  errorMsg.value = ''
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }
  if (form.value.password.length < 6) {
    errorMsg.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }
  isLoading.value = true
  try {
    // ตรวจสอบรหัสลงทะเบียนผ่าน RPC (server-side — รหัสจริงไม่หลุด)
    const { data: codeOk, error: codeErr } = await supabase.rpc('check_register_code', {
      input_code: form.value.registerCode || ''
    })
    if (codeErr) throw new Error('ไม่สามารถตรวจสอบรหัสลงทะเบียนได้: ' + codeErr.message)
    if (!codeOk) {
      errorMsg.value = 'รหัสลงทะเบียนไม่ถูกต้อง — กรุณาสอบถามจากผู้ดูแลระบบ'
      isLoading.value = false
      return
    }

    await signUp(form.value.email, form.value.password, `${form.value.firstName} ${form.value.lastName}`)
    success.value = true
  } catch (err) {
    if (err.message?.includes('already registered')) errorMsg.value = 'อีเมลนี้มีในระบบแล้ว'
    else errorMsg.value = err.message || 'เกิดข้อผิดพลาด'
  } finally {
    isLoading.value = false
  }
}
</script>
