<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="stat in stats" :key="stat.label"
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-2xl', stat.bg]">{{ stat.icon }}</div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-xs text-gray-500">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-bold text-gray-900 mb-4">การดำเนินการด่วน</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <RouterLink v-for="action in quickActions" :key="action.label" :to="action.to"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-center"
          >
            <span class="text-2xl">{{ action.icon }}</span>
            <span class="text-xs font-medium text-gray-700">{{ action.label }}</span>
          </RouterLink>
        </div>
      </div>

      <!-- Pending Users -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-900">รอการอนุมัติ <span v-if="pendingUsers.length" class="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{{ pendingUsers.length }}</span></h2>
          <RouterLink to="/admin/users" class="text-sm text-blue-600 hover:text-blue-800">ดูทั้งหมด →</RouterLink>
        </div>
        <div v-if="pendingUsers.length" class="space-y-3">
          <div v-for="u in pendingUsers" :key="u.id" class="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ u.full_name || u.email }}</p>
              <p class="text-xs text-gray-500">{{ u.email }}</p>
            </div>
            <button @click="approveUser(u.id)" class="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">อนุมัติ</button>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400 text-sm">ไม่มีผู้ใช้รอการอนุมัติ ✅</div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { supabase } from '../../lib/supabase'

const stats = ref([
  { icon: '👥', label: 'ผู้ใช้ทั้งหมด', value: 0, bg: 'bg-blue-100' },
  { icon: '👨‍🏫', label: 'ครู/บุคลากร', value: 0, bg: 'bg-green-100' },
  { icon: '🎓', label: 'นักเรียน', value: 0, bg: 'bg-yellow-100' },
  { icon: '📰', label: 'ข่าวสาร', value: 0, bg: 'bg-purple-100' },
])
const pendingUsers = ref([])
const quickActions = [
  { icon: '👤', label: 'เพิ่มครู', to: '/admin/teachers' },
  { icon: '🎓', label: 'นำเข้านักเรียน', to: '/admin/students' },
  { icon: '📰', label: 'เพิ่มข่าว', to: '/admin/news' },
  { icon: '⚙️', label: 'ตั้งค่าโรงเรียน', to: '/admin/config' },
]

async function approveUser(id) {
  await supabase.from('profiles').update({ is_approved: true, role: 'teacher' }).eq('id', id)
  pendingUsers.value = pendingUsers.value.filter(u => u.id !== id)
  stats.value[0].value++
  stats.value[1].value++
}

onMounted(async () => {
  const [usersRes, studentsRes, newsRes, pendingRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('news').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id, email, full_name').eq('is_approved', false),
  ])
  stats.value[0].value = usersRes.count || 0
  stats.value[1].value = (usersRes.count || 0) - (pendingRes.data?.length || 0)
  stats.value[2].value = studentsRes.count || 0
  stats.value[3].value = newsRes.count || 0
  pendingUsers.value = pendingRes.data || []
})
</script>
