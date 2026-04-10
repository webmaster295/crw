<template>
  <PublicLayout>
    <!-- Hero -->
    <div class="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-700 text-white py-10 px-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-2xl md:text-3xl font-bold">📂 {{ config?.wpa_title || 'ข้อตกลงและผลงาน (วPA)' }}</h1>
        <p class="text-purple-200 mt-1 text-sm">{{ config?.name_th || 'โรงเรียน' }}</p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8">

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">🔍 ค้นหา</label>
          <input v-model="search" type="text" placeholder="ชื่อ-นามสกุล..." class="input-field text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">📅 ปีการศึกษา</label>
          <select v-model="filterYear" class="input-field text-sm">
            <option value="">ทั้งหมด</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">📚 กลุ่มสาระ</label>
          <select v-model="filterSubject" class="input-field text-sm">
            <option value="">ทั้งหมด</option>
            <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">🎖️ วิทยฐานะ</label>
          <select v-model="filterStanding" class="input-field text-sm">
            <option value="">ทั้งหมด</option>
            <option v-for="s in standings" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-4 mb-4 text-sm">
        <span class="text-gray-500">พบทั้งหมด <span class="font-bold text-purple-700">{{ filtered.length }}</span> รายการ</span>
        <button v-if="hasFilter" @click="clearFilters" class="text-xs text-blue-600 hover:underline">↻ ล้างตัวกรอง</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center py-16 text-gray-400">
        <div class="text-3xl animate-spin mb-3">⏳</div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div class="text-5xl mb-3">📭</div>
        <p class="text-gray-500">ไม่พบข้อมูล วPA</p>
      </div>

      <!-- Table (desktop) -->
      <div v-else class="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ครู</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">กลุ่มสาระ</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">วิทยฐานะ</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ปี</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ลิงก์</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="r in filtered" :key="r.id" class="hover:bg-purple-50/40 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                    <img v-if="r.profile_image_url" :src="r.profile_image_url" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-lg">👤</div>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 leading-tight">{{ (r.prefix || '') + (r.full_name || '-') }}</p>
                    <p class="text-xs text-gray-400">{{ r.position || '-' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ r.subject_group || '-' }}</td>
              <td class="px-4 py-3">
                <span class="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                  {{ r.academic_standing || '-' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center font-bold text-purple-700">{{ r.year }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2 justify-center">
                  <a v-if="r.agreement_url" :href="r.agreement_url" target="_blank" rel="noopener"
                    title="ลิงก์ข้อตกลง"
                    class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors">
                    📄 ข้อตกลง
                  </a>
                  <a v-if="r.portfolio_url" :href="r.portfolio_url" target="_blank" rel="noopener"
                    title="ลิงก์ผลงาน"
                    class="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium transition-colors">
                    🏆 ผลงาน
                  </a>
                  <span v-if="!r.agreement_url && !r.portfolio_url" class="text-xs text-gray-300">-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards (mobile) -->
      <div v-if="!loading && filtered.length > 0" class="md:hidden space-y-3">
        <div v-for="r in filtered" :key="r.id" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
              <img v-if="r.profile_image_url" :src="r.profile_image_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-lg">👤</div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ (r.prefix || '') + (r.full_name || '-') }}</p>
              <p class="text-xs text-gray-400 truncate">{{ r.position }} · {{ r.academic_standing }}</p>
            </div>
            <span class="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold">{{ r.year }}</span>
          </div>
          <p class="text-xs text-gray-500 mb-3">📚 {{ r.subject_group || '-' }}</p>
          <div class="flex gap-2">
            <a v-if="r.agreement_url" :href="r.agreement_url" target="_blank" rel="noopener"
              class="flex-1 text-center px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">📄 ข้อตกลง</a>
            <a v-if="r.portfolio_url" :href="r.portfolio_url" target="_blank" rel="noopener"
              class="flex-1 text-center px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">🏆 ผลงาน</a>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { useSchoolConfig } from '../../composables/useSchoolConfig'
import { supabase } from '../../lib/supabase'

const { config } = useSchoolConfig()

const records       = ref([])
const loading       = ref(true)
const search        = ref('')
const filterYear    = ref('')
const filterSubject = ref('')
const filterStanding = ref('')

const years = computed(() => [...new Set(records.value.map(r => r.year))].sort((a, b) => b - a))
const subjects = computed(() => [...new Set(records.value.map(r => r.subject_group).filter(Boolean))].sort())
const standings = computed(() => [...new Set(records.value.map(r => r.academic_standing).filter(Boolean))].sort())

const hasFilter = computed(() => search.value || filterYear.value || filterSubject.value || filterStanding.value)

const filtered = computed(() => {
  let list = records.value
  if (filterYear.value)     list = list.filter(r => r.year === Number(filterYear.value))
  if (filterSubject.value)  list = list.filter(r => r.subject_group === filterSubject.value)
  if (filterStanding.value) list = list.filter(r => r.academic_standing === filterStanding.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(r => (r.full_name || '').toLowerCase().includes(q))
  }
  return list
})

function clearFilters() {
  search.value = ''
  filterYear.value = ''
  filterSubject.value = ''
  filterStanding.value = ''
}

onMounted(async () => {
  const { data, error } = await supabase.rpc('get_public_wpa')
  if (!error) records.value = data || []
  loading.value = false
})
</script>
