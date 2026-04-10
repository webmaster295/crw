<template>
  <PublicLayout>
    <!-- Hero -->
    <div class="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-10 px-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-2xl md:text-3xl font-bold">👨‍🏫 คณะครูและบุคลากร</h1>
        <p class="text-blue-200 mt-1 text-sm">{{ config?.name_th || 'โรงเรียน' }}</p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8">

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center py-20 text-gray-400">
        <svg class="w-10 h-10 animate-spin text-blue-400 mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="text-center py-16 text-red-400">
        <div class="text-4xl mb-2">⚠️</div>
        <p class="font-medium">โหลดข้อมูลไม่สำเร็จ</p>
        <p class="text-xs mt-1 text-gray-400">{{ fetchError }}</p>
      </div>

      <div v-else>
        <!-- Empty -->
        <div v-if="!allTeachers.length" class="text-center py-20 text-gray-400">
          <div class="text-5xl mb-3">👨‍🏫</div>
          <p class="font-medium">ยังไม่มีข้อมูลบุคลากร</p>
        </div>

        <!-- ───── ผู้บริหาร ───── -->
        <section v-if="executives" class="mb-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-lg">🏫</div>
            <h2 class="text-lg font-bold text-gray-800">ผู้บริหารโรงเรียน</h2>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>
          <!-- ผอ. คนเดียว ตรงกลาง -->
          <div v-if="director" class="flex justify-center mb-5">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" style="width:180px">
              <div class="relative bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden" style="height:216px">
                <img v-if="director.profile_image_url" :src="director.profile_image_url" class="w-full h-full object-cover object-top" loading="lazy" />
                <div v-else class="text-5xl opacity-20">👤</div>
              </div>
              <div class="px-2 py-2.5 text-center">
                <p class="font-semibold text-gray-900" style="font-size:13px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ director.prefix }}{{ director.first_name }} {{ director.last_name }}</p>
                <p class="text-blue-600 font-medium mt-0.5" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ positionLine(director) }}</p>
              </div>
            </div>
          </div>
          <!-- รอง ผอ. — flex wrap จัดกลาง -->
          <div v-if="viceDirectors.length" class="flex flex-wrap justify-center gap-4">
            <div v-for="t in viceDirectors" :key="t.id"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" style="width:160px">
              <div class="relative bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden" style="height:192px">
                <img v-if="t.profile_image_url" :src="t.profile_image_url" class="w-full h-full object-cover object-top" loading="lazy" />
                <div v-else class="text-5xl opacity-20">👤</div>
              </div>
              <div class="px-2 py-2.5 text-center">
                <p class="font-semibold text-gray-900" style="font-size:12px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ t.prefix }}{{ t.first_name }} {{ t.last_name }}</p>
                <p class="text-blue-600 font-medium mt-0.5" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ positionLine(t) }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ───── กลุ่มสาระ ───── -->
        <section v-for="group in subjectGroupsData" :key="group.name" class="mb-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-lg">{{ groupIcon(group.name) }}</div>
            <h2 class="text-lg font-bold text-gray-800">{{ group.name }}</h2>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>
          <!-- หัวหน้ากลุ่ม คนเดียว ตรงกลาง -->
          <div v-if="group.head" class="flex justify-center mb-4">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" style="width:168px">
              <div class="relative bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden" style="height:200px">
                <img v-if="group.head.profile_image_url" :src="group.head.profile_image_url" class="w-full h-full object-cover object-top" loading="lazy" />
                <div v-else class="text-5xl opacity-20">👤</div>
              </div>
              <div class="px-2 py-2.5 text-center">
                <p class="font-semibold text-gray-900" style="font-size:12px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ group.head.prefix }}{{ group.head.first_name }} {{ group.head.last_name }}</p>
                <p class="text-blue-600 font-medium mt-0.5" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ positionLine(group.head) }}</p>
                <p class="text-indigo-600 font-semibold mt-0.5" style="font-size:11px">⭐ หัวหน้ากลุ่มสาระ</p>
              </div>
            </div>
          </div>
          <!-- สมาชิกที่เหลือ — flex wrap จัดกลาง -->
          <div v-if="group.members.length" class="flex flex-wrap justify-center gap-3">
            <div v-for="t in group.members" :key="t.id"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" style="width:152px">
              <div class="relative bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden" style="height:180px">
                <img v-if="t.profile_image_url" :src="t.profile_image_url" class="w-full h-full object-cover object-top" loading="lazy" />
                <div v-else class="text-5xl opacity-20">👤</div>
              </div>
              <div class="px-2 py-2.5 text-center">
                <p class="font-semibold text-gray-900" style="font-size:12px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ t.prefix }}{{ t.first_name }} {{ t.last_name }}</p>
                <p class="text-blue-600 font-medium mt-0.5" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ positionLine(t) }}</p>
                <p v-if="t.group_role === 'รองหัวหน้ากลุ่มสาระ'" class="text-indigo-500 font-medium mt-0.5" style="font-size:11px">★ รองหัวหน้ากลุ่มสาระ</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ───── บุคลากรสนับสนุน ───── -->
        <section v-if="otherStaff.length" class="mb-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-lg">👷</div>
            <h2 class="text-lg font-bold text-gray-800">บุคลากรสนับสนุน</h2>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <div v-for="t in otherStaff" :key="t.id"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" style="width:152px">
              <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden" style="height:180px">
                <img v-if="t.profile_image_url" :src="t.profile_image_url" class="w-full h-full object-cover object-top" loading="lazy" />
                <div v-else class="text-5xl opacity-20">👤</div>
              </div>
              <div class="px-2 py-2.5 text-center">
                <p class="font-semibold text-gray-900" style="font-size:12px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ t.prefix }}{{ t.first_name }} {{ t.last_name }}</p>
                <p class="text-gray-500 font-medium mt-0.5" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ positionLine(t) }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'
import { useSchoolConfig } from '../../composables/useSchoolConfig'

const { config } = useSchoolConfig()

// ── Constants ─────────────────────────────────────────────────
const SUBJECT_GROUP_ORDER = [
  'ภาษาไทย','คณิตศาสตร์','วิทยาศาสตร์และเทคโนโลยี','สังคมศึกษาฯ',
  'ภาษาต่างประเทศ','สุขศึกษาและพลศึกษา','ศิลปะ','การงานอาชีพ','กิจกรรมพัฒนาผู้เรียน',
]
const STANDING_ORDER = { 'ครูเชี่ยวชาญพิเศษ': 0, 'ครูเชี่ยวชาญ': 1, 'ครูชำนาญการพิเศษ': 2, 'ครูชำนาญการ': 3, '': 4 }
const STANDING_LABEL = { 'ครูเชี่ยวชาญพิเศษ': 'คศ.4', 'ครูเชี่ยวชาญ': 'คศ.3', 'ครูชำนาญการพิเศษ': 'คศ.2', 'ครูชำนาญการ': 'คศ.1' }
const GROUP_ROLE_ORDER = { 'หัวหน้ากลุ่มสาระ': 0, 'รองหัวหน้ากลุ่มสาระ': 1, '': 2 }
const EXEC_POSITIONS    = ['ผู้อำนวยการโรงเรียน', 'รองผู้อำนวยการ']
const SUPPORT_POSITIONS = ['พนักงานราชการ', 'ลูกจ้างประจำ', 'ลูกจ้างชั่วคราว', 'ธุรการโรงเรียน']
const GROUP_ICONS = {
  'ภาษาไทย': '📚', 'คณิตศาสตร์': '🔢', 'วิทยาศาสตร์และเทคโนโลยี': '🔬',
  'สังคมศึกษาฯ': '🌍', 'ภาษาต่างประเทศ': '🌐', 'สุขศึกษาและพลศึกษา': '⚽',
  'ศิลปะ': '🎨', 'การงานอาชีพ': '🔧', 'กิจกรรมพัฒนาผู้เรียน': '🌱',
}

// ── State ─────────────────────────────────────────────────────
const allTeachers = ref([])
const loading     = ref(true)
const fetchError  = ref('')

// ── Fetch ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('first_name')
    if (error) throw error
    allTeachers.value = data || []
  } catch (e) {
    fetchError.value = e.message
  } finally {
    loading.value = false
  }
})

// ── Helpers ───────────────────────────────────────────────────
function standingLabel(t) {
  return STANDING_LABEL[t.academic_standing] || ''
}
// มีวิทยฐานะ → แสดงวิทยฐานะอย่างเดียว | ไม่มี → แสดงตำแหน่ง
function positionLine(t) {
  return t.academic_standing || t.position || 'ครู'
}
function groupIcon(name) {
  return GROUP_ICONS[name] || '📖'
}
function sortTeachers(list) {
  return [...list].sort((a, b) => {
    const rA = GROUP_ROLE_ORDER[a.group_role ?? ''] ?? 2
    const rB = GROUP_ROLE_ORDER[b.group_role ?? ''] ?? 2
    if (rA !== rB) return rA - rB
    const sA = STANDING_ORDER[a.academic_standing ?? ''] ?? 4
    const sB = STANDING_ORDER[b.academic_standing ?? ''] ?? 4
    if (sA !== sB) return sA - sB
    return (a.first_name ?? '').localeCompare(b.first_name ?? '', 'th')
  })
}

// ── Computed ──────────────────────────────────────────────────
// ผู้อำนวยการ (คนเดียว)
const director = computed(() =>
  allTeachers.value.find(t => t.position === 'ผู้อำนวยการโรงเรียน') || null
)

// รอง ผอ. และผู้บริหารอื่น (ไม่รวม ผอ.)
const viceDirectors = computed(() =>
  allTeachers.value
    .filter(t => t.position === 'รองผู้อำนวยการ')
    .sort((a, b) => (a.first_name ?? '').localeCompare(b.first_name ?? '', 'th'))
)

// executives รวม (ใช้ตรวจสอบว่ามีหรือไม่)
const executives = computed(() => director.value || viceDirectors.value.length)

const subjectGroupsData = computed(() => {
  const teachers = allTeachers.value.filter(
    t => t.subject_group && !EXEC_POSITIONS.includes(t.position) && !SUPPORT_POSITIONS.includes(t.position)
  )
  const map = {}
  for (const t of teachers) {
    if (!map[t.subject_group]) map[t.subject_group] = []
    map[t.subject_group].push(t)
  }
  const result = []
  const buildGroup = (name, list) => {
    const sorted = sortTeachers(list)
    // แยก หัวหน้ากลุ่ม ออก (คนแรกที่เป็นหัวหน้า)
    const headIdx = sorted.findIndex(t => t.group_role === 'หัวหน้ากลุ่มสาระ')
    const head    = headIdx >= 0 ? sorted[headIdx] : null
    const members = sorted.filter((_, i) => i !== headIdx)
    return { name, head, members }
  }
  for (const g of SUBJECT_GROUP_ORDER) {
    if (map[g]) result.push(buildGroup(g, map[g]))
  }
  for (const g of Object.keys(map)) {
    if (!SUBJECT_GROUP_ORDER.includes(g)) result.push(buildGroup(g, map[g]))
  }
  return result
})

const otherStaff = computed(() =>
  sortTeachers(
    allTeachers.value.filter(
      t => SUPPORT_POSITIONS.includes(t.position) ||
           (!t.subject_group && !EXEC_POSITIONS.includes(t.position))
    )
  )
)
</script>
