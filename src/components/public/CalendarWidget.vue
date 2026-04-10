<template>
  <section class="py-14 bg-gray-50">
    <div class="max-w-5xl mx-auto px-4">

      <!-- Header -->
      <div class="text-center mb-10">
        <VineDivider :variant="props.variant" :stem-color="props.stemColor" :leaf-color="props.leafColor" class="mb-3">
          <span class="text-xl">📅</span>
          <span class="w-px h-5 mx-0.5" :style="{ background: props.stemColor + '99' }"></span>
          <h2 class="text-xl font-extrabold tracking-wide text-gray-800">{{ props.title }}</h2>
        </VineDivider>
        <p class="text-gray-400 text-sm">{{ props.subtitle }}</p>
      </div>

      <!-- Calendar Card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Month Navigation -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button @click="prevMonth"
            class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="text-center">
            <h3 class="font-bold text-gray-900 text-lg">{{ thaiMonths[currentMonth] }} {{ currentYear }}</h3>
          </div>
          <button @click="nextMonth"
            class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Day Headers -->
        <div class="grid grid-cols-7 border-b border-gray-100">
          <div v-for="d in dayHeaders" :key="d"
            class="py-2.5 text-center text-xs font-semibold text-gray-400 tracking-wide"
            :class="d === 'อา' ? 'text-red-400' : ''">
            {{ d }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 divide-x divide-y divide-gray-100">
          <div v-for="(cell, idx) in calendarCells" :key="idx"
            class="min-h-[90px] md:min-h-[110px] p-1.5 relative"
            :class="[
              !cell ? 'bg-gray-50/60' : 'bg-white hover:bg-gray-50/40',
              cell && isSunday(idx) ? 'bg-red-50/30' : ''
            ]">

            <!-- Day number -->
            <div v-if="cell" class="mb-1 flex items-center justify-between">
              <span :class="[
                'w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold',
                isToday(cell)
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : isSunday(idx) ? 'text-red-400' : 'text-gray-700'
              ]">{{ cell }}</span>
            </div>

            <!-- Events in cell -->
            <div v-if="cell" class="space-y-0.5">
              <button v-for="ev in eventsOnDay(cell)" :key="ev.id"
                @click="openPopup(ev)"
                :class="['w-full text-left text-xs px-1.5 py-0.5 rounded-md truncate font-medium transition-all hover:opacity-80', typeChip(ev.event_type)]">
                {{ ev.title }}
              </button>
              <!-- overflow indicator -->
              <p v-if="eventsOnDay(cell).length > 3" class="text-xs text-gray-400 pl-1">
                +{{ eventsOnDay(cell).length - 3 }} อีก
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="mt-8">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
          กิจกรรมที่กำลังจะมาถึง
        </h3>

        <div v-if="loading" class="text-center py-8 text-gray-300">
          <div class="w-8 h-8 border-2 border-gray-200 border-t-indigo-400 rounded-full animate-spin mx-auto"></div>
        </div>

        <div v-else-if="!upcomingEvents.length"
          class="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p class="text-4xl mb-2">📭</p>
          <p class="text-sm">ไม่มีกิจกรรมในช่วงนี้</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div v-for="ev in upcomingEvents" :key="ev.id"
            @click="openPopup(ev)"
            class="bg-white border border-gray-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 text-center w-12">
                <p class="text-2xl font-black text-gray-800 leading-none">{{ dayNum(ev.start_date) }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ monthShort(ev.start_date) }}</p>
              </div>
              <div class="flex-1 min-w-0 pt-0.5">
                <p class="font-semibold text-gray-900 text-sm leading-snug truncate group-hover:text-indigo-700 transition-colors">{{ ev.title }}</p>
                <span :class="['inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium', typeChip(ev.event_type)]">
                  {{ typeLabel(ev.event_type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center mt-8">
        <router-link to="/calendar"
          class="inline-flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold px-8 py-3 rounded-2xl transition-all">
          ดูปฏิทินทั้งหมด
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Event Popup -->
    <div v-if="popup" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      @click.self="popup = null">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        <div class="flex items-start justify-between mb-4">
          <span :class="['text-xs px-3 py-1 rounded-full font-semibold', typeChip(popup.event_type)]">
            {{ typeLabel(popup.event_type) }}
          </span>
          <button @click="popup = null" class="text-gray-300 hover:text-gray-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2 leading-snug">{{ popup.title }}</h3>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{{ formatDate(popup.start_date) }}</span>
          <span v-if="popup.end_date && popup.end_date !== popup.start_date">
            — {{ formatDate(popup.end_date) }}
          </span>
        </div>
        <p v-if="popup.description" class="text-sm text-gray-600 leading-relaxed">{{ popup.description }}</p>
        <p v-else class="text-sm text-gray-400 italic">ไม่มีรายละเอียดเพิ่มเติม</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import VineDivider from './VineDivider.vue'

const props = defineProps({
  title:     { type: String, default: 'ปฏิทินวิชาการ' },
  subtitle:  { type: String, default: 'กิจกรรมและกำหนดการสำคัญของโรงเรียน' },
  variant:   { type: String, default: 'wave' },
  stemColor: { type: String, default: '#6366f1' },
  leafColor: { type: String, default: '#a5b4fc' },
})

const loading      = ref(true)
const events       = ref([])
const popup        = ref(null)
const today        = new Date()
const currentYear  = ref(today.getFullYear() + 543)
const currentMonth = ref(today.getMonth())

const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const thaiMonthsShort = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const dayHeaders = ['จ','อ','พ','พฤ','ศ','ส','อา']

const typeMap = {
  holiday:  { label: 'วันหยุดราชการ',   chip: 'bg-red-100 text-red-700'       },
  exam:     { label: 'สอบ',              chip: 'bg-purple-100 text-purple-700'  },
  activity: { label: 'กิจกรรมโรงเรียน', chip: 'bg-emerald-100 text-emerald-700'},
  term:     { label: 'เปิด-ปิดภาคเรียน',chip: 'bg-blue-100 text-blue-700'      },
  meeting:  { label: 'ประชุม',           chip: 'bg-amber-100 text-amber-700'    },
  other:    { label: 'อื่นๆ',            chip: 'bg-gray-100 text-gray-600'      },
}
function typeChip(t)  { return typeMap[t]?.chip  || 'bg-gray-100 text-gray-600' }
function typeLabel(t) { return typeMap[t]?.label || t }

// Calendar grid
const daysInMonth = computed(() => new Date(currentYear.value - 543, currentMonth.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => {
  const d = new Date(currentYear.value - 543, currentMonth.value, 1).getDay()
  return d === 0 ? 6 : d - 1
})
const calendarCells = computed(() => {
  const cells = []
  for (let i = 0; i < firstDayOfMonth.value; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth.value; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

function dateStr(day) {
  const ce = currentYear.value - 543
  return `${ce}-${String(currentMonth.value + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}
function eventsOnDay(day) {
  if (!day) return []
  const ds = dateStr(day)
  return events.value.filter(e => ds >= e.start_date && ds <= (e.end_date || e.start_date))
}
function isToday(day) {
  return today.getFullYear() === currentYear.value - 543 &&
    today.getMonth() === currentMonth.value && today.getDate() === day
}
function isSunday(idx) { return idx % 7 === 6 }

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

// Upcoming
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
const upcomingEvents = computed(() =>
  [...events.value]
    .filter(e => (e.end_date || e.start_date) >= todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 6)
)

// Format
function dayNum(ds)     { return ds ? parseInt(ds.split('-')[2]) : '' }
function monthShort(ds) { return ds ? thaiMonthsShort[parseInt(ds.split('-')[1]) - 1] : '' }
function formatDate(ds) {
  if (!ds) return ''
  const [, m, d] = ds.split('-')
  return `${parseInt(d)} ${thaiMonths[parseInt(m) - 1]}`
}

function openPopup(ev) { popup.value = ev }

onMounted(async () => {
  const thaiYear = today.getFullYear() + 543
  const { data } = await supabase.from('academic_calendar')
    .select('id,title,description,start_date,end_date,event_type')
    .eq('is_public', true)
    .eq('academic_year', thaiYear)
    .order('start_date')
  events.value = data || []
  loading.value = false
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fade-in { animation: fade-in 0.18s ease-out; }
</style>
