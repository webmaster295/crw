<template>
  <PublicLayout>
    <!-- Hero -->
    <div class="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-10 px-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold">👨‍🏫 คณะครูและบุคลากร</h1>
          <p class="text-blue-200 mt-1 text-sm">{{ config?.name_th || '' }}</p>
        </div>
        <RouterLink to="/personnel/stats"
          class="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          📊 สารสนเทศบุคลากร
        </RouterLink>
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

      <template v-else>
        <!-- Empty -->
        <div v-if="!allTeachers.length" class="text-center py-20 text-gray-400">
          <div class="text-5xl mb-3">👨‍🏫</div>
          <p class="font-medium">ยังไม่มีข้อมูลบุคลากร</p>
        </div>

        <template v-else>
          <!-- ══ Level 1: Group Tabs ══ -->
          <div class="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6 overflow-x-auto">
            <button v-for="g in groupTabs" :key="g.key" @click="selectGroup(g.key)"
              :class="['flex-shrink-0 flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                activeGroup === g.key
                  ? 'bg-white shadow-sm text-blue-700'
                  : 'text-gray-500 hover:text-gray-700']">
              {{ g.icon }} {{ g.label }}
              <span class="text-xs px-2 py-0.5 rounded-full font-bold"
                :class="activeGroup === g.key ? 'bg-blue-100 text-blue-600' : 'bg-white/60 text-gray-400'">
                {{ g.count }}
              </span>
            </button>
          </div>

          <!-- ══ Level 2: Sub-tabs (กลุ่มบริหารงาน) ══ -->
          <div v-if="activeGroup === 'departments' && adminDeptGroups.length > 1"
            class="flex gap-2 overflow-x-auto pb-2 mb-8" style="-webkit-overflow-scrolling:touch">
            <button v-for="g in adminDeptGroups" :key="g.name" @click="activeDept = g.name"
              :class="['flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                activeDept === g.name
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600']">
              {{ shortDeptName(g.name) }}
            </button>
          </div>

          <!-- ══ Level 2: Sub-tabs (กลุ่มสาระ) ══ -->
          <div v-if="activeGroup === 'subjects' && subjectGroupsData.length > 1"
            class="flex gap-2 overflow-x-auto pb-2 mb-8" style="-webkit-overflow-scrolling:touch">
            <button v-for="g in subjectGroupsData" :key="g.name" @click="activeSubject = g.name"
              :class="['flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                activeSubject === g.name
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600']">
              {{ groupIcon(g.name) }} {{ g.name }}
              <span class="text-xs opacity-70">({{ (g.head ? 1 : 0) + g.members.length }})</span>
            </button>
          </div>

          <!-- ══ Content: ผู้บริหาร ══ -->
          <section v-if="activeGroup === 'executives'">
            <!-- ผอ. — การ์ดใหญ่กลางจอ -->
            <div v-if="director" class="flex justify-center mb-10">
              <PersonCard :teacher="director" size="lg" />
            </div>
            <!-- รอง ผอ. — การ์ดกลาง -->
            <div v-if="viceDirectors.length">
              <p class="text-center text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">รองผู้อำนวยการโรงเรียน</p>
              <div class="flex flex-wrap justify-center gap-5">
                <PersonCard v-for="t in viceDirectors" :key="t.id" :teacher="t" size="md" />
              </div>
            </div>
          </section>

          <!-- ══ Content: กลุ่มบริหารงาน ══ -->
          <section v-else-if="activeGroup === 'departments' && currentDeptGroup">
            <!-- ผอ./ประธานกลุ่ม -->
            <div v-if="currentDeptGroup.director" class="flex justify-center mb-8">
              <PersonCard :teacher="currentDeptGroup.director" size="lg"
                :extra-label="deptRoleLabel(currentDeptGroup.director, activeDept)"
                extra-label-color="text-blue-600" />
            </div>
            <!-- row2: รอง ผอ. + หัวหน้ากลุ่ม -->
            <div v-if="currentDeptGroup.row2.length" class="flex flex-wrap justify-center gap-5 mb-6">
              <PersonCard v-for="t in currentDeptGroup.row2" :key="t.id + activeDept" :teacher="t" size="md"
                :extra-label="deptRoleLabel(t, activeDept)" extra-label-color="text-indigo-600" />
            </div>
            <!-- สมาชิก -->
            <div v-if="currentDeptGroup.members.length" class="flex flex-wrap justify-center gap-3">
              <PersonCard v-for="t in currentDeptGroup.members" :key="t.id + '_m_' + activeDept" :teacher="t" size="sm"
                :extra-label="deptRoleLabel(t, activeDept)" extra-label-color="text-gray-500" />
            </div>
          </section>

          <!-- ══ Content: กลุ่มสาระ ══ -->
          <section v-else-if="activeGroup === 'subjects' && currentSubjectGroup">
            <!-- หัวหน้ากลุ่มสาระ -->
            <div v-if="currentSubjectGroup.head" class="flex justify-center mb-8">
              <PersonCard :teacher="currentSubjectGroup.head" size="md"
                extra-label="⭐ หัวหน้ากลุ่มสาระ" extra-label-color="text-indigo-600" />
            </div>
            <!-- สมาชิก -->
            <div v-if="currentSubjectGroup.members.length" class="flex flex-wrap justify-center gap-3">
              <PersonCard v-for="t in currentSubjectGroup.members" :key="t.id" :teacher="t" size="sm"
                :extra-label="t.group_role === 'รองหัวหน้ากลุ่มสาระ' ? '★ รองหัวหน้ากลุ่มสาระ' : ''"
                extra-label-color="text-indigo-500" />
            </div>
          </section>

          <!-- ══ Content: ฝ่ายสนับสนุน ══ -->
          <section v-else-if="activeGroup === 'support'">
            <div class="flex flex-wrap justify-center gap-3">
              <PersonCard v-for="t in otherStaff" :key="t.id" :teacher="t" size="sm" />
            </div>
          </section>

        </template>
      </template>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineComponent, h } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'
import { useSchoolConfig } from '../../composables/useSchoolConfig'

const { config } = useSchoolConfig()

// ── PersonCard Component ──────────────────────────────────────
const SIZES = {
  lg: { w: 220, h: 290, nameFs: '15px', posFs: '13px', standFs: '12px', extraFs: '12px', px: '14px', py: '14px' },
  md: { w: 190, h: 248, nameFs: '13px', posFs: '12px', standFs: '11px', extraFs: '11px', px: '10px', py: '12px' },
  sm: { w: 160, h: 206, nameFs: '12px', posFs: '11px', standFs: '10px', extraFs: '10px', px: '8px',  py: '10px' },
}

const PersonCard = defineComponent({
  props: {
    teacher:         Object,
    size:            { type: String, default: 'sm' },
    extraLabel:      { type: String, default: '' },
    extraLabelColor: { type: String, default: 'text-indigo-600' },
  },
  setup(props) {
    return () => {
      const t  = props.teacher
      const sz = SIZES[props.size] || SIZES.sm
      const hasPhoto = !!t?.profile_image_url

      return h('div', {
        class: 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex-shrink-0',
        style: `width:${sz.w}px`,
      }, [
        // ── รูปภาพ ──
        h('div', {
          class: 'relative bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center overflow-hidden',
          style: `height:${sz.h}px`,
        }, [
          ...(hasPhoto
            ? [h('img', { src: t.profile_image_url, class: 'w-full h-full object-cover object-top', loading: 'lazy', alt: `${t.prefix || ''}${t.first_name} ${t.last_name}` })]
            : [
                h('svg', { viewBox: '0 0 80 100', class: 'w-16 opacity-20', fill: '#6b7280' }, [
                  h('ellipse', { cx: 40, cy: 28, rx: 20, ry: 24 }),
                  h('path', { d: 'M5,100 Q5,60 40,60 Q75,60 75,100 Z' }),
                ]),
                h('p', { style: 'font-size:10px;color:#9ca3af;margin-top:4px' }, 'ยังไม่มีภาพถ่าย'),
              ]
          ),
          // ลิงก์ผลงาน
          t?.website_url
            ? h('a', {
                href: t.website_url, target: '_blank', rel: 'noopener noreferrer',
                class: 'absolute bottom-0 left-0 right-0 bg-blue-600/90 hover:bg-blue-700 text-white text-center py-1.5 transition-colors',
                style: 'font-size:10px;font-weight:600;letter-spacing:0.02em',
                onClick: (e) => e.stopPropagation(),
              }, '🌐 เยี่ยมชมผลงาน')
            : null,
        ]),

        // ── ข้อความ 3 บรรทัด ──
        h('div', {
          class: 'text-center',
          style: `padding:${sz.py} ${sz.px}`,
        }, [
          // บรรทัด 1: ชื่อ-นามสกุล
          h('p', {
            class: 'font-bold text-gray-900 leading-snug',
            style: `font-size:${sz.nameFs};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em`,
          }, `${t?.prefix || ''}${t?.first_name || ''} ${t?.last_name || ''}`),

          // บรรทัด 2: ตำแหน่ง
          h('p', {
            class: 'text-blue-700 font-semibold mt-1 leading-snug',
            style: `font-size:${sz.posFs};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em`,
          }, t?.position || 'ครู'),

          // บรรทัด 3: วิทยฐานะ (แสดงเสมอ แม้ว่าง)
          h('p', {
            class: 'text-gray-500 mt-0.5',
            style: `font-size:${sz.standFs};min-height:1.4em`,
          }, t?.academic_standing || ''),

          // Extra: บทบาทในกลุ่ม (ถ้ามี)
          props.extraLabel
            ? h('p', {
                class: `font-semibold mt-0.5 ${props.extraLabelColor}`,
                style: `font-size:${sz.extraFs}`,
              }, props.extraLabel)
            : null,
        ]),
      ])
    }
  },
})

// ── Constants ─────────────────────────────────────────────────
const SUBJECT_GROUP_ORDER = [
  'ภาษาไทย','คณิตศาสตร์','วิทยาศาสตร์และเทคโนโลยี','สังคมศึกษาฯ',
  'ภาษาต่างประเทศ','สุขศึกษาและพลศึกษา','ศิลปะ','การงานอาชีพ','กิจกรรมพัฒนาผู้เรียน',
]
const STANDING_ORDER = {
  'ผู้อำนวยการเชี่ยวชาญ': 0, 'ผู้อำนวยการชำนาญการพิเศษ': 1, 'ผู้อำนวยการชำนาญการ': 2,
  'รองผู้อำนวยการเชี่ยวชาญ': 3, 'รองผู้อำนวยการชำนาญการพิเศษ': 4, 'รองผู้อำนวยการชำนาญการ': 5,
  'ครูเชี่ยวชาญพิเศษ': 6, 'ครูเชี่ยวชาญ': 7, 'ครูชำนาญการพิเศษ': 8, 'ครูชำนาญการ': 9, '': 10,
}
const GROUP_ROLE_ORDER  = { 'หัวหน้ากลุ่มสาระ': 0, 'รองหัวหน้ากลุ่มสาระ': 1, '': 2 }
const EXEC_POSITIONS    = ['ผู้อำนวยการโรงเรียน', 'รองผู้อำนวยการ']
const SUPPORT_POSITIONS = ['พนักงานราชการ', 'ลูกจ้างประจำ', 'ลูกจ้างชั่วคราว', 'ธุรการโรงเรียน']
const GROUP_ICONS = {
  'ภาษาไทย': '📚', 'คณิตศาสตร์': '🔢', 'วิทยาศาสตร์และเทคโนโลยี': '🔬',
  'สังคมศึกษาฯ': '🌍', 'ภาษาต่างประเทศ': '🌐', 'สุขศึกษาและพลศึกษา': '⚽',
  'ศิลปะ': '🎨', 'การงานอาชีพ': '🔧', 'กิจกรรมพัฒนาผู้เรียน': '🌱',
}

// ── State ─────────────────────────────────────────────────────
const allTeachers = ref([])
const deptMap     = ref({})
const loading     = ref(true)
const fetchError  = ref('')

const activeGroup   = ref('executives')
const activeDept    = ref('')
const activeSubject = ref('')

// ── Config ────────────────────────────────────────────────────
const DEFAULT_DEPTS = ['กลุ่มบริหารวิชาการ','กลุ่มบริหารงบประมาณ','กลุ่มบริหารงานบุคคล','กลุ่มบริหารทั่วไป']
const adminDeptList = computed(() =>
  Array.isArray(config.value?.admin_departments) && config.value.admin_departments.length
    ? config.value.admin_departments : DEFAULT_DEPTS
)

// ── Helpers ───────────────────────────────────────────────────
function groupIcon(name) { return GROUP_ICONS[name] || '📖' }

function shortDeptName(dept) {
  return dept.replace('กลุ่มบริหาร', '').replace(/^งาน/, '').trim() || dept
}

function getDeptRole(t, deptName) {
  return (deptMap.value[t.id] || []).find(d => d.department_name === deptName)?.department_role || ''
}

function deptRoleLabel(t, deptName) {
  const role = getDeptRole(t, deptName)
  if (role === 'ผู้อำนวยการโรงเรียน')   return '🏫 ผู้อำนวยการโรงเรียน'
  if (role === 'รองผู้อำนวยการโรงเรียน') return '🏫 รองผู้อำนวยการโรงเรียน'
  if (role === 'หัวหน้ากลุ่ม')           return '⭐ หัวหน้ากลุ่ม'
  if (role === 'รองหัวหน้ากลุ่ม')        return '★ รองหัวหน้ากลุ่ม'
  if (role === 'เลขานุการ')              return '📝 เลขานุการ'
  return ''
}

function sortTeachers(list) {
  return [...list].sort((a, b) => {
    const oA = a.sort_order ?? 100, oB = b.sort_order ?? 100
    if (oA !== oB) return oA - oB
    const rA = GROUP_ROLE_ORDER[a.group_role ?? ''] ?? 2
    const rB = GROUP_ROLE_ORDER[b.group_role ?? ''] ?? 2
    if (rA !== rB) return rA - rB
    const sA = STANDING_ORDER[a.academic_standing ?? ''] ?? 10
    const sB = STANDING_ORDER[b.academic_standing ?? ''] ?? 10
    if (sA !== sB) return sA - sB
    return (a.first_name ?? '').localeCompare(b.first_name ?? '', 'th')
  })
}

function sortByStanding(list) {
  return [...list].sort((a, b) => {
    const oA = a.sort_order ?? 100, oB = b.sort_order ?? 100
    if (oA !== oB) return oA - oB
    const sA = STANDING_ORDER[a.academic_standing ?? ''] ?? 10
    const sB = STANDING_ORDER[b.academic_standing ?? ''] ?? 10
    if (sA !== sB) return sA - sB
    return (a.first_name ?? '').localeCompare(b.first_name ?? '', 'th')
  })
}

// ── Computed: ผู้บริหาร ───────────────────────────────────────
const director = computed(() =>
  allTeachers.value.find(t => t.position === 'ผู้อำนวยการโรงเรียน') || null
)

const viceDirectors = computed(() =>
  allTeachers.value
    .filter(t => t.position === 'รองผู้อำนวยการ')
    .sort((a, b) => {
      const oA = a.sort_order ?? 100, oB = b.sort_order ?? 100
      if (oA !== oB) return oA - oB
      return (a.first_name ?? '').localeCompare(b.first_name ?? '', 'th')
    })
)

// ── Computed: กลุ่มบริหารงาน ──────────────────────────────────
const adminDeptGroups = computed(() =>
  adminDeptList.value.map(deptName => {
    const members = allTeachers.value.filter(t =>
      (deptMap.value[t.id] || []).some(d => d.department_name === deptName)
    )
    if (!members.length) return null

    const directorInDept = members.find(t => getDeptRole(t, deptName) === 'ผู้อำนวยการโรงเรียน') || null
    const row2 = members.filter(t => {
      if (getDeptRole(t, deptName) === 'ผู้อำนวยการโรงเรียน') return false
      const role = getDeptRole(t, deptName)
      return role === 'รองผู้อำนวยการโรงเรียน' || role === 'หัวหน้ากลุ่ม'
    }).sort((a, b) => {
      const order = { 'รองผู้อำนวยการโรงเรียน': 0, 'หัวหน้ากลุ่ม': 1 }
      return (order[getDeptRole(a, deptName)] ?? 2) - (order[getDeptRole(b, deptName)] ?? 2)
    })

    const row2Ids = new Set([directorInDept?.id, ...row2.map(t => t.id)].filter(Boolean))
    const rest    = sortByStanding(members.filter(t => !row2Ids.has(t.id)))
    return { name: deptName, director: directorInDept, row2, members: rest }
  }).filter(Boolean)
)

const currentDeptGroup = computed(() =>
  adminDeptGroups.value.find(g => g.name === activeDept.value) || adminDeptGroups.value[0] || null
)

// ── Computed: กลุ่มสาระ ───────────────────────────────────────
const subjectGroupsData = computed(() => {
  const teachers = allTeachers.value.filter(
    t => t.subject_group && !EXEC_POSITIONS.includes(t.position) && !SUPPORT_POSITIONS.includes(t.position)
  )
  const map = {}
  for (const t of teachers) {
    if (!map[t.subject_group]) map[t.subject_group] = []
    map[t.subject_group].push(t)
  }
  const build = (name, list) => {
    const sorted  = sortTeachers(list)
    const headIdx = sorted.findIndex(t => t.group_role === 'หัวหน้ากลุ่มสาระ')
    const head    = headIdx >= 0 ? sorted[headIdx] : null
    const members = sorted.filter((_, i) => i !== headIdx)
    return { name, head, members }
  }
  const result = []
  for (const g of SUBJECT_GROUP_ORDER) { if (map[g]) result.push(build(g, map[g])) }
  for (const g of Object.keys(map))    { if (!SUBJECT_GROUP_ORDER.includes(g)) result.push(build(g, map[g])) }
  return result
})

const currentSubjectGroup = computed(() =>
  subjectGroupsData.value.find(g => g.name === activeSubject.value) || subjectGroupsData.value[0] || null
)

// ── Computed: สนับสนุน ────────────────────────────────────────
const otherStaff = computed(() =>
  sortTeachers(
    allTeachers.value.filter(
      t => SUPPORT_POSITIONS.includes(t.position) ||
           (!t.subject_group && !EXEC_POSITIONS.includes(t.position))
    )
  )
)

// ── Computed: Group Tabs ──────────────────────────────────────
const groupTabs = computed(() => [
  {
    key: 'executives', icon: '🏫', label: 'ผู้บริหาร',
    count: (director.value ? 1 : 0) + viceDirectors.value.length,
  },
  {
    key: 'departments', icon: '🏢', label: 'กลุ่มบริหารงาน',
    count: adminDeptGroups.value.length,
  },
  {
    key: 'subjects', icon: '📚', label: 'กลุ่มสาระ',
    count: subjectGroupsData.value.length,
  },
  {
    key: 'support', icon: '👷', label: 'ฝ่ายสนับสนุน',
    count: otherStaff.value.length,
  },
].filter(t => t.count > 0))

// ── Actions ───────────────────────────────────────────────────
function selectGroup(key) {
  activeGroup.value = key
  if (key === 'departments' && !activeDept.value && adminDeptGroups.value.length)
    activeDept.value = adminDeptGroups.value[0].name
  if (key === 'subjects' && !activeSubject.value && subjectGroupsData.value.length)
    activeSubject.value = subjectGroupsData.value[0].name
}

// auto-select first sub-tab เมื่อข้อมูลพร้อม
watch(adminDeptGroups, (list) => {
  if (!activeDept.value && list.length) activeDept.value = list[0].name
}, { immediate: true })

watch(subjectGroupsData, (list) => {
  if (!activeSubject.value && list.length) activeSubject.value = list[0].name
}, { immediate: true })

// ── Fetch ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [{ data: teachers, error }, { data: depts }] = await Promise.all([
      supabase.from('teacher_profiles').select('*')
        .order('sort_order', { nullsFirst: false })
        .order('first_name'),
      supabase.from('teacher_department_assignments')
        .select('teacher_id, department_name, department_role'),
    ])
    if (error) throw error
    allTeachers.value = teachers || []
    const m = {}
    for (const d of (depts || [])) {
      if (!m[d.teacher_id]) m[d.teacher_id] = []
      m[d.teacher_id].push(d)
    }
    deptMap.value = m
  } catch (e) {
    fetchError.value = e.message
  } finally {
    loading.value = false
  }
})
</script>
