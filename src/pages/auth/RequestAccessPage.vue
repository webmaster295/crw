<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
      <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-4xl">⏳</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">รอการอนุมัติ</h1>
      <p class="text-gray-600 mb-6">บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ กรุณารอสักครู่</p>

      <div class="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
        <p class="text-sm font-semibold text-blue-900 mb-1">ข้อมูลบัญชี</p>
        <p class="text-sm text-blue-700">อีเมล: {{ user?.email }}</p>
        <p class="text-sm text-blue-700">สถานะ: รอการอนุมัติ</p>
      </div>

      <p class="text-xs text-gray-400 mb-6">หากรอนานเกิน 1 วัน กรุณาติดต่อผู้ดูแลระบบโดยตรง</p>

      <button @click="handleSignOut" class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
        ออกจากระบบ
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
const router = useRouter()
const { user, signOut } = useAuth()
async function handleSignOut() { await signOut(); router.push('/') }
</script>
