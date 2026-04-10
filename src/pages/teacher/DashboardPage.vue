<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-1">สวัสดี, {{ profile?.full_name || 'คุณครู' }} 👋</h1>
        <p class="text-blue-200 text-sm">ยินดีต้อนรับสู่ระบบโรงเรียน</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <RouterLink to="/students" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">🎓</div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ studentCount }}</p>
            <p class="text-xs text-gray-500">นักเรียนทั้งหมด</p>
          </div>
        </RouterLink>
        <RouterLink to="/profile" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">👤</div>
          <div>
            <p class="text-sm font-semibold text-gray-900">โปรไฟล์</p>
            <p class="text-xs text-gray-500">แก้ไขข้อมูลส่วนตัว</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { supabase } from '../../lib/supabase'

const { profile } = useAuth()
const studentCount = ref(0)

onMounted(async () => {
  const { count } = await supabase.from('students').select('id', { count: 'exact', head: true })
  studentCount.value = count || 0
})
</script>
