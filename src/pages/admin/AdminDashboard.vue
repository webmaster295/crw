<template>
  <AdminLayout>
    <div class="space-y-5">

      <!-- Welcome Bar -->
      <div class="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-sm">
        <div>
          <p class="text-blue-200 text-xs mb-0.5">ยินดีต้อนรับ</p>
          <h1 class="text-lg font-bold leading-snug">{{ profile?.full_name || user?.email }}</h1>
          <p class="text-blue-200 text-sm mt-0.5">{{ config?.name_th || 'ระบบบริหารโรงเรียน' }}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-black leading-none">{{ todayDay }}</p>
          <p class="text-blue-200 text-xs mt-0.5">{{ todayFull }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="stat in stats" :key="stat.label"
          class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xl">{{ stat.icon }}</span>
            <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', stat.badgeCls]">{{ stat.badge }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-gray-900 leading-none">
              <span v-if="stat.loading" class="text-gray-300 text-lg">...</span>
              <span v-else>{{ stat.value.toLocaleString() }}</span>
            </p>
            <p class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content: 2 columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Left: Upcoming Events + Recent News -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Upcoming Calendar Events -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 class="font-bold text-gray-900 flex items-center gap-2">
                <span class="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
                กิจกรรมที่กำลังจะมาถึง
              </h2>
              <RouterLink to="/admin/calendar" class="text-xs text-blue-600 hover:text-blue-800">ดูทั้งหมด →</RouterLink>
            </div>
            <div v-if="loadingCalendar" class="px-6 pb-5 text-center py-8">
              <div class="w-7 h-7 border-2 border-gray-200 border-t-indigo-400 rounded-full animate-spin mx-auto"></div>
            </div>
            <div v-else-if="!upcomingEvents.length" class="px-6 pb-5 text-center py-8 text-gray-300 text-sm">
              📭 ไม่มีกิจกรรมที่กำลังจะมาถึง
            </div>
            <div v-else class="divide-y divide-gray-50">
              <div v-for="ev in upcomingEvents" :key="ev.id"
                class="flex items-start gap-4 px-6 py-3 hover:bg-gray-50/60 transition-colors">
                <div class="flex-shrink-0 text-center w-10 pt-0.5">
                  <p class="text-xl font-black text-gray-800 leading-none">{{ dayNum(ev.start_date) }}</p>
                  <p class="text-[10px] text-gray-400">{{ monthShort(ev.start_date) }}</p>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{{ ev.title }}</p>
                  <span :class="['inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium', typeChip(ev.event_type)]">
                    {{ typeLabel(ev.event_type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent News -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 class="font-bold text-gray-900 flex items-center gap-2">
                <span class="w-1.5 h-5 bg-blue-500 rounded-full inline-block"></span>
                ข่าวล่าสุด
              </h2>
              <RouterLink to="/admin/news" class="text-xs text-blue-600 hover:text-blue-800">จัดการข่าว →</RouterLink>
            </div>
            <div v-if="loadingNews" class="px-6 pb-5 text-center py-8">
              <div class="w-7 h-7 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
            </div>
            <div v-else-if="!recentNews.length" class="px-6 pb-5 text-center py-8 text-gray-300 text-sm">
              📭 ยังไม่มีข่าว
            </div>
            <div v-else class="divide-y divide-gray-50">
              <div v-for="n in recentNews" :key="n.id"
                class="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/60 transition-colors">
                <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img v-if="n.image_url" :src="n.image_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-lg">📰</div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{{ n.title }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(n.published_at || n.created_at) }}</p>
                </div>
                <span :class="['text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                  n.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                  {{ n.is_published ? 'เผยแพร่' : 'ร่าง' }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Pending + Quick Actions -->
        <div class="space-y-5">

          <!-- Pending Users -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 class="font-bold text-gray-900 flex items-center gap-2">
                <span class="w-1.5 h-5 bg-red-400 rounded-full inline-block"></span>
                รออนุมัติ
                <span v-if="pendingUsers.length" class="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                  {{ pendingUsers.length }}
                </span>
              </h2>
              <RouterLink to="/admin/users" class="text-xs text-blue-600 hover:text-blue-800">ดูทั้งหมด →</RouterLink>
            </div>
            <div v-if="!pendingUsers.length" class="px-5 pb-5 text-center py-6 text-gray-300 text-sm">
              ✅ ไม่มีรอการอนุมัติ
            </div>
            <div v-else class="px-5 pb-4 space-y-2">
              <div v-for="u in pendingUsers" :key="u.id"
                class="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ u.full_name || u.email }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ u.email }}</p>
                </div>
                <button @click="approveUser(u.id)"
                  class="ml-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0">
                  อนุมัติ
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 pt-5 pb-4">
            <h2 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-5 bg-yellow-400 rounded-full inline-block"></span>
              เมนูด่วน
            </h2>
            <div class="grid grid-cols-3 gap-2">
              <RouterLink v-for="action in quickActions" :key="action.label" :to="action.to"
                class="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-center group">
                <span class="text-xl">{{ action.icon }}</span>
                <span class="text-[10px] font-medium text-gray-600 group-hover:text-blue-700 leading-tight">{{ action.label }}</span>
              </RouterLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { useSchoolConfig } from '../../composables/useSchoolConfig'
import { supabase } from '../../lib/supabase'

const { user, profile } = useAuth()
const { config } = useSchoolConfig()

// ─── Thai date ───────────────────────────────────────────
const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const thaiMonthsShort = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const thaiDays = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']
const now = new Date()
const todayDay  = computed(() => `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`)
const todayFull = computed(() => `วัน${thaiDays[now.getDay()]}ที่ ${now.getDate()} ${thaiMonths[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543}`)

// ─── Stats ───────────────────────────────────────────────
const stats = ref([
  { icon: '👥', label: 'ผู้ใช้ทั้งหมด',  value: 0, loading: true, badge: 'user',      badgeCls: 'bg-blue-100 text-blue-700'    },
  { icon: '👨‍🏫', label: 'ครู/บุคลากร',   value: 0, loading: true, badge: 'teacher',   badgeCls: 'bg-green-100 text-green-700'  },
  { icon: '🎓', label: 'นักเรียน',        value: 0, loading: true, badge: 'student',   badgeCls: 'bg-yellow-100 text-yellow-700'},
  { icon: '📰', label: 'ข่าวทั้งหมด',    value: 0, loading: true, badge: 'news',      badgeCls: 'bg-purple-100 text-purple-700'},
  { icon: '🖼️', label: 'กิจกรรม',        value: 0, loading: true, badge: 'activity',  badgeCls: 'bg-orange-100 text-orange-700'},
  { icon: '📅', label: 'กิจกรรมเดือนนี้', value: 0, loading: true, badge: 'calendar',  badgeCls: 'bg-indigo-100 text-indigo-700'},
])

// ─── Calendar ────────────────────────────────────────────
const loadingCalendar = ref(true)
const upcomingEvents  = ref([])
const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
const lastOfMonth  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()}`

const typeMap = {
  holiday:  { label: 'วันหยุด',       chip: 'bg-red-100 text-red-700'       },
  exam:     { label: 'สอบ',           chip: 'bg-purple-100 text-purple-700'  },
  activity: { label: 'กิจกรรม',       chip: 'bg-emerald-100 text-emerald-700'},
  term:     { label: 'เปิด-ปิดภาค',  chip: 'bg-blue-100 text-blue-700'      },
  meeting:  { label: 'ประชุม',        chip: 'bg-amber-100 text-amber-700'    },
  other:    { label: 'อื่นๆ',         chip: 'bg-gray-100 text-gray-600'      },
}
function typeChip(t)  { return typeMap[t]?.chip  || 'bg-gray-100 text-gray-600' }
function typeLabel(t) { return typeMap[t]?.label || t }
function dayNum(ds)     { return ds ? parseInt(ds.split('-')[2]) : '' }
function monthShort(ds) { return ds ? thaiMonthsShort[parseInt(ds.split('-')[1]) - 1] : '' }

// ─── Recent News ─────────────────────────────────────────
const loadingNews = ref(true)
const recentNews  = ref([])

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${thaiMonthsShort[d.getMonth()]} ${d.getFullYear() + 543}`
}

// ─── Pending Users ────────────────────────────────────────
const pendingUsers = ref([])

async function approveUser(id) {
  await supabase.from('profiles').update({ is_approved: true, role: 'teacher' }).eq('id', id)
  pendingUsers.value = pendingUsers.value.filter(u => u.id !== id)
  stats.value[0].value++
  stats.value[1].value++
}

// ─── Quick Actions ────────────────────────────────────────
const quickActions = [
  { icon: '📰', label: 'ข่าว',        to: '/admin/news'        },
  { icon: '🖼️', label: 'กิจกรรม',    to: '/admin/activities'   },
  { icon: '📚', label: 'คลังสื่อ',    to: '/admin/media'        },
  { icon: '📅', label: 'ปฏิทิน',     to: '/admin/calendar'     },
  { icon: '🎓', label: 'นักเรียน',    to: '/admin/students'     },
  { icon: '👨‍🏫', label: 'ครู',       to: '/admin/teachers'     },
  { icon: '👥', label: 'ผู้ใช้',      to: '/admin/users'        },
  { icon: '📂', label: 'วPA',         to: '/admin/wpa'          },
  { icon: '📄', label: 'ข้อมูลพื้นฐาน', to: '/admin/org-pages' },
  { icon: '🔗', label: 'เมนูระบบ',   to: '/admin/nav-systems'  },
  { icon: '⚙️', label: 'ตั้งค่า',    to: '/admin/config'       },
  { icon: '🏠', label: 'หน้าเว็บ',    to: '/'                  },
]

// ─── Load All ────────────────────────────────────────────
onMounted(async () => {
  const thaiYear = now.getFullYear() + 543

  const [usersRes, teachersRes, studentsRes, newsCountRes, activitiesRes, calendarMonthRes, upcomingRes, recentNewsRes, pendingRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('students').select('student_code', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('news').select('id', { count: 'exact', head: true }),
    supabase.from('activities').select('id', { count: 'exact', head: true }),
    supabase.from('academic_calendar')
      .select('id', { count: 'exact', head: true })
      .eq('academic_year', thaiYear)
      .gte('start_date', firstOfMonth)
      .lte('start_date', lastOfMonth),
    supabase.from('academic_calendar')
      .select('id,title,start_date,end_date,event_type')
      .eq('academic_year', thaiYear)
      .gte('end_date', todayStr)
      .order('start_date')
      .limit(5),
    supabase.from('news')
      .select('id,title,image_url,is_published,published_at,created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('profiles').select('id,email,full_name').eq('is_approved', false),
  ])

  stats.value[0] = { ...stats.value[0], value: usersRes.count || 0,        loading: false }
  stats.value[1] = { ...stats.value[1], value: teachersRes.count || 0,     loading: false }
  stats.value[2] = { ...stats.value[2], value: studentsRes.count || 0,     loading: false }
  stats.value[3] = { ...stats.value[3], value: newsCountRes.count || 0,    loading: false }
  stats.value[4] = { ...stats.value[4], value: activitiesRes.count || 0,   loading: false }
  stats.value[5] = { ...stats.value[5], value: calendarMonthRes.count || 0, loading: false }

  upcomingEvents.value = upcomingRes.data || []
  loadingCalendar.value = false

  recentNews.value = recentNewsRes.data || []
  loadingNews.value = false

  pendingUsers.value = pendingRes.data || []
})
</script>
