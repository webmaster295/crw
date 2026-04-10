<template>
  <PublicLayout>
    <div class="min-h-screen bg-gray-50">

      <!-- ===== HERO SECTION ===== -->
      <div class="bg-gradient-to-br from-indigo-800 to-blue-700 text-white">
        <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                📅 ปฏิทินกิจกรรมโรงเรียน
              </h1>
              <p class="text-indigo-200 text-sm md:text-base">{{ schoolName() }}</p>
              <p class="text-indigo-300 text-xs mt-1">ปีการศึกษา {{ currentYear }}</p>
            </div>
            <div class="flex items-center gap-2">
              <select v-model="currentYear"
                class="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/40">
                <option v-for="y in academicYears" :key="y" :value="y" class="text-gray-800">ปีการศึกษา {{ y }}</option>
              </select>
              <!-- Print Dropdown -->
              <div class="relative">
                <button @click="showPrintMenu = !showPrintMenu"
                  class="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm backdrop-blur hover:bg-white/20 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  พิมพ์
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div v-if="showPrintMenu"
                  class="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden w-56">
                  <div class="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">เลือกรูปแบบพิมพ์</p>
                  </div>
                  <button @click="doPrint('monthly')"
                    class="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors">
                    <span class="text-lg leading-none mt-0.5">📅</span>
                    <div>
                      <div class="text-sm font-semibold text-gray-800">รายเดือน</div>
                      <div class="text-xs text-gray-400">A4 Landscape · 12 หน้า</div>
                    </div>
                  </button>
                  <button @click="doPrint('yearly')"
                    class="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-t border-gray-50">
                    <span class="text-lg leading-none mt-0.5">📆</span>
                    <div>
                      <div class="text-sm font-semibold text-gray-800">ภาพรวมทั้งปี</div>
                      <div class="text-xs text-gray-400">A4 Landscape · 1 หน้า</div>
                    </div>
                  </button>
                  <button @click="doPrint('list')"
                    class="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-t border-gray-50">
                    <span class="text-lg leading-none mt-0.5">📋</span>
                    <div>
                      <div class="text-sm font-semibold text-gray-800">รายการกิจกรรม</div>
                      <div class="text-xs text-gray-400">A4 Portrait · ตารางรายการ</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">

        <!-- ===== UPCOMING EVENTS STRIP ===== -->
        <div v-if="upcomingEvents.length">
          <h2 class="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span class="text-blue-600">🔔</span> กิจกรรมที่กำลังจะมาถึง
          </h2>
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div v-for="ev in upcomingEvents" :key="ev.id"
              @click="selectedEvent = (selectedEvent?.id === ev.id ? null : ev)"
              :class="['flex-shrink-0 w-56 bg-white rounded-2xl shadow-sm border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md',
                selectedEvent?.id === ev.id ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-100']">
              <!-- Color top bar -->
              <div :class="['h-1.5 rounded-t-2xl', eventTypeMap[ev.event_type]?.dot || 'bg-gray-300']"></div>
              <div class="p-4">
                <span :class="['text-[10px] px-2 py-0.5 rounded-full font-medium border',
                  eventTypeMap[ev.event_type]?.color || 'bg-gray-100 text-gray-600 border-gray-200']">
                  {{ eventTypeMap[ev.event_type]?.label || ev.event_type }}
                </span>
                <p class="text-sm font-semibold text-gray-800 mt-2 line-clamp-2 leading-snug">{{ ev.title }}</p>
                <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ formatDateShort(ev.start_date) }}
                  <span v-if="ev.end_date && ev.end_date !== ev.start_date">
                    – {{ formatDateShort(ev.end_date) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== SELECTED EVENT DETAIL CARD ===== -->
        <Transition name="slide-down">
          <div v-if="selectedEvent"
            :class="['bg-white rounded-2xl border shadow-sm overflow-hidden',
              `border-l-4 ${eventTypeMap[selectedEvent.event_type]?.borderLeft || 'border-l-gray-400'}`]">
            <div class="p-5 flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span :class="['text-xs px-2.5 py-1 rounded-full font-medium border',
                    eventTypeMap[selectedEvent.event_type]?.color || 'bg-gray-100 text-gray-600 border-gray-200']">
                    {{ eventTypeMap[selectedEvent.event_type]?.label || selectedEvent.event_type }}
                  </span>
                  <span class="text-xs text-gray-400">ปีการศึกษา {{ selectedEvent.academic_year }}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ selectedEvent.title }}</h3>
                <p class="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ formatDateThai(selectedEvent.start_date) }}
                  <span v-if="selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date">
                    – {{ formatDateThai(selectedEvent.end_date) }}
                  </span>
                </p>
                <p v-if="selectedEvent.description" class="text-sm text-gray-600 mt-2 leading-relaxed">
                  {{ selectedEvent.description }}
                </p>
              </div>
              <button @click="selectedEvent = null"
                class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </Transition>

        <!-- ===== FILTER CHIPS ===== -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button v-for="ft in filterOptions" :key="ft.value" @click="filterType = ft.value"
            :class="['flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
              filterType === ft.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600']">
            <span v-if="ft.dot" :class="['w-2 h-2 rounded-full', ft.dot]"></span>
            {{ ft.label }}
          </button>
        </div>

        <!-- ===== MONTH NAVIGATION ===== -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth"
              class="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="text-center">
              <h3 class="font-bold text-gray-900">{{ thaiMonths[currentMonth] }} {{ currentYear }}</h3>
              <p class="text-xs text-gray-400">{{ filteredEventsThisMonth.length }} กิจกรรม</p>
            </div>
            <button @click="nextMonth"
              class="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <!-- Month tabs -->
          <div class="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            <button v-for="(m, idx) in thaiMonths" :key="idx" @click="currentMonth = idx"
              :class="['flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                currentMonth === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700']">
              {{ m }}
            </button>
          </div>
        </div>

        <!-- ===== CALENDAR GRID (Desktop) ===== -->
        <div class="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div v-if="loading" class="p-12 text-center text-gray-400">
            <div class="text-4xl mb-3 animate-pulse">📅</div>
            <p class="text-sm">กำลังโหลดปฏิทิน...</p>
          </div>

          <template v-else>
            <!-- Day headers -->
            <div class="grid grid-cols-7 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
              <div v-for="d in dayHeaders" :key="d"
                class="py-3 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                {{ d }}
              </div>
            </div>

            <!-- Cells -->
            <div class="grid grid-cols-7">
              <div v-for="(day, idx) in calendarCells" :key="idx"
                :class="[
                  'min-h-[100px] p-2 border-b border-r border-gray-100',
                  !day ? 'bg-gray-50/60' : 'hover:bg-indigo-50/30 transition-colors',
                  idx % 7 === 6 ? 'border-r-0' : '',
                  isToday(day) ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/30' : ''
                ]">
                <!-- Day number -->
                <div v-if="day" class="flex justify-end mb-1">
                  <span :class="[
                    'text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full',
                    isToday(day)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isWeekend(idx) ? 'text-rose-400' : 'text-gray-700'
                  ]">{{ day }}</span>
                </div>

                <!-- Event badges -->
                <div v-if="day" class="space-y-0.5">
                  <div v-for="ev in filteredEventsOnDay(day).slice(0, 3)" :key="ev.id"
                    @click="selectedEvent = (selectedEvent?.id === ev.id ? null : ev)"
                    :class="['text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer font-medium border transition-opacity hover:opacity-75',
                      eventTypeMap[ev.event_type]?.color || 'bg-gray-100 text-gray-600 border-gray-200']">
                    <span :class="['inline-block w-1.5 h-1.5 rounded-full mr-0.5 align-middle flex-shrink-0',
                      eventTypeMap[ev.event_type]?.dot || 'bg-gray-400']"></span>
                    {{ ev.title }}
                  </div>
                  <div v-if="filteredEventsOnDay(day).length > 3"
                    class="text-[10px] text-indigo-500 font-medium pl-1 cursor-pointer hover:underline"
                    @click="showAllDayEvents(day)">
                    +{{ filteredEventsOnDay(day).length - 3 }} เพิ่มเติม
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- ===== MOBILE LIST VIEW ===== -->
        <div class="sm:hidden space-y-3">
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 4" :key="i" class="animate-pulse bg-white rounded-2xl p-4 shadow-sm">
              <div class="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div v-else-if="!filteredEventsThisMonth.length"
            class="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm">
            <div class="text-3xl mb-2">📭</div>
            <p class="text-sm">ไม่มีกิจกรรมในเดือนนี้</p>
          </div>
          <div v-else v-for="ev in filteredEventsThisMonth" :key="ev.id"
            @click="selectedEvent = (selectedEvent?.id === ev.id ? null : ev)"
            :class="['bg-white rounded-2xl shadow-sm border cursor-pointer transition-all',
              selectedEvent?.id === ev.id ? 'ring-2 ring-blue-500 border-blue-100' : 'border-gray-100 hover:border-blue-200']">
            <div :class="['h-1 rounded-t-2xl', eventTypeMap[ev.event_type]?.dot || 'bg-gray-300']"></div>
            <div class="p-4">
              <div class="flex items-start gap-3">
                <!-- Date badge -->
                <div class="flex-shrink-0 text-center bg-indigo-50 rounded-xl p-2 w-12">
                  <div class="text-xs font-bold text-indigo-600">{{ getDayNum(ev.start_date) }}</div>
                  <div class="text-[10px] text-indigo-400">{{ getMonthShort(ev.start_date) }}</div>
                </div>
                <div class="flex-1 min-w-0">
                  <span :class="['text-[10px] px-2 py-0.5 rounded-full font-medium border',
                    eventTypeMap[ev.event_type]?.color || 'bg-gray-100 text-gray-600 border-gray-200']">
                    {{ eventTypeMap[ev.event_type]?.label || ev.event_type }}
                  </span>
                  <p class="text-sm font-semibold text-gray-800 mt-1">{{ ev.title }}</p>
                  <p v-if="ev.description" class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ ev.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== FULL YEAR ACCORDION ===== -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button @click="showYearList = !showYearList"
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-gray-900">รายการกิจกรรมทั้งปี {{ currentYear }}</span>
              <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {{ filteredEvents.length }} รายการ
              </span>
            </div>
            <svg :class="['w-5 h-5 text-gray-400 transition-transform', showYearList ? 'rotate-180' : '']"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <Transition name="accordion">
            <div v-if="showYearList" class="border-t border-gray-100">
              <div v-if="loading" class="p-6 text-center text-gray-400 text-sm">กำลังโหลด...</div>
              <div v-else-if="!filteredEvents.length" class="p-6 text-center text-gray-400 text-sm">
                ไม่มีกิจกรรมที่ตรงกับตัวกรองที่เลือก
              </div>
              <div v-else>
                <!-- Grouped by month -->
                <div v-for="(group, mi) in eventsGroupedByMonth" :key="mi">
                  <div v-if="group.events.length"
                    class="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {{ thaiMonths[group.month] }}
                    </span>
                    <span class="text-xs text-gray-400">{{ group.events.length }} รายการ</span>
                  </div>
                  <div v-for="ev in group.events" :key="ev.id"
                    @click="selectedEvent = (selectedEvent?.id === ev.id ? null : ev)"
                    :class="['px-6 py-3.5 flex items-center gap-3 border-b border-gray-50 cursor-pointer transition-colors',
                      selectedEvent?.id === ev.id ? 'bg-blue-50' : 'hover:bg-gray-50']">
                    <!-- Type dot -->
                    <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', eventTypeMap[ev.event_type]?.dot || 'bg-gray-300']"></span>
                    <!-- Date -->
                    <span class="text-xs text-gray-400 w-24 flex-shrink-0">
                      {{ formatDateShort(ev.start_date) }}
                      <span v-if="ev.end_date && ev.end_date !== ev.start_date">→ {{ formatDateShort(ev.end_date) }}</span>
                    </span>
                    <!-- Title -->
                    <span class="text-sm text-gray-800 font-medium flex-1">{{ ev.title }}</span>
                    <!-- Badge -->
                    <span :class="['text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 hidden sm:inline',
                      eventTypeMap[ev.event_type]?.color || 'bg-gray-100 text-gray-600 border-gray-200']">
                      {{ eventTypeMap[ev.event_type]?.label || ev.event_type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import { useSchoolConfig } from '../../composables/useSchoolConfig'
import { printMonthly, printYearOverview, printEventList } from '../../utils/calendarPrint'
import PublicLayout from '../../layouts/PublicLayout.vue'

// ─── Constants ───────────────────────────────────────────────────────────────
const thaiMonths = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
]
const dayHeaders  = ['จ','อ','พ','พฤ','ศ','ส','อา']
const academicYears = [2566, 2567, 2568, 2569, 2570]

const eventTypes = [
  { value: 'holiday',  label: 'วันหยุดราชการ',    color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',    borderLeft: 'border-l-red-500'    },
  { value: 'exam',     label: 'สอบ',               color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500', borderLeft: 'border-l-purple-500' },
  { value: 'activity', label: 'กิจกรรมโรงเรียน',  color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500',  borderLeft: 'border-l-green-500'  },
  { value: 'term',     label: 'เปิด-ปิดภาคเรียน',  color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',   borderLeft: 'border-l-blue-500'   },
  { value: 'meeting',  label: 'ประชุม',             color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500',  borderLeft: 'border-l-amber-500'  },
  { value: 'other',    label: 'อื่นๆ',              color: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400',   borderLeft: 'border-l-gray-400'   },
]

const eventTypeMap = Object.fromEntries(eventTypes.map(et => [et.value, et]))

const filterOptions = [
  { value: 'all',      label: 'ทั้งหมด',           dot: null         },
  { value: 'holiday',  label: 'วันหยุดราชการ',      dot: 'bg-red-500'    },
  { value: 'exam',     label: 'สอบ',                dot: 'bg-purple-500' },
  { value: 'activity', label: 'กิจกรรม',            dot: 'bg-green-500'  },
  { value: 'term',     label: 'เปิด-ปิดภาคเรียน',   dot: 'bg-blue-500'   },
  { value: 'meeting',  label: 'ประชุม',              dot: 'bg-amber-500'  },
]

// ─── School Config ────────────────────────────────────────────────────────────
const { config, fetchConfig, schoolName, logoUrl } = useSchoolConfig()

// ─── State ────────────────────────────────────────────────────────────────────
const events        = ref([])
const loading       = ref(false)
const filterType    = ref('all')
const selectedEvent = ref(null)
const showYearList  = ref(true)
const showPrintMenu = ref(false)

const now = new Date()
const currentYear  = ref(now.getFullYear() + 543)
const currentMonth = ref(now.getMonth()) // 0-11

// ─── Calendar Computed ────────────────────────────────────────────────────────
const daysInMonth = computed(() => {
  const ce = currentYear.value - 543
  return new Date(ce, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  const ce = currentYear.value - 543
  let day = new Date(ce, currentMonth.value, 1).getDay()
  return day === 0 ? 6 : day - 1
})

const calendarCells = computed(() => {
  const cells = []
  for (let i = 0; i < firstDayOfMonth.value; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth.value; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

// ─── Events Computed ──────────────────────────────────────────────────────────
const filteredEvents = computed(() => {
  if (filterType.value === 'all') return events.value
  return events.value.filter(e => e.event_type === filterType.value)
})

const filteredEventsThisMonth = computed(() => {
  const ce = currentYear.value - 543
  const monthStart = `${ce}-${String(currentMonth.value + 1).padStart(2, '0')}-01`
  const monthEnd   = `${ce}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(daysInMonth.value).padStart(2, '0')}`
  return filteredEvents.value.filter(e => {
    const start = e.start_date || ''
    const end   = e.end_date   || e.start_date || ''
    return start <= monthEnd && end >= monthStart
  })
})

const upcomingEvents = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return events.value
    .filter(e => (e.end_date || e.start_date) >= todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 5)
})

const eventsGroupedByMonth = computed(() => {
  return thaiMonths.map((_, mi) => {
    const ce = currentYear.value - 543
    const mStart = `${ce}-${String(mi + 1).padStart(2, '0')}-01`
    const mEnd   = `${ce}-${String(mi + 1).padStart(2, '0')}-${String(new Date(ce, mi + 1, 0).getDate()).padStart(2,'0')}`
    return {
      month: mi,
      events: filteredEvents.value.filter(e => {
        const s = e.start_date || ''
        const end = e.end_date || e.start_date || ''
        return s <= mEnd && end >= mStart
      })
    }
  })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dateStr(year, month, day) {
  const ce = year - 543
  return `${ce}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function filteredEventsOnDay(day) {
  if (!day) return []
  const ds = dateStr(currentYear.value, currentMonth.value, day)
  return filteredEvents.value.filter(e => {
    const start = e.start_date
    const end   = e.end_date || e.start_date
    return ds >= start && ds <= end
  })
}

function isToday(day) {
  if (!day) return false
  const today = new Date()
  return today.getFullYear() === (currentYear.value - 543) &&
    today.getMonth() === currentMonth.value &&
    today.getDate() === day
}

function isWeekend(cellIndex) {
  // column index 5 = Saturday, 6 = Sunday in our Mon-first grid
  const col = cellIndex % 7
  return col === 5 || col === 6
}

function formatDateThai(ds) {
  if (!ds) return ''
  const [y, m, d] = ds.split('-')
  const thaiYear = parseInt(y) + 543
  return `${parseInt(d)} ${thaiMonths[parseInt(m) - 1]} ${thaiYear}`
}

function formatDateShort(ds) {
  if (!ds) return ''
  const [y, m, d] = ds.split('-')
  return `${parseInt(d)} ${thaiMonths[parseInt(m) - 1]}`
}

function getDayNum(ds) {
  if (!ds) return ''
  return parseInt(ds.split('-')[2])
}

function getMonthShort(ds) {
  if (!ds) return ''
  return thaiMonths[parseInt(ds.split('-')[1]) - 1]
}

function showAllDayEvents(day) {
  const evs = filteredEventsOnDay(day)
  if (evs.length) selectedEvent.value = evs[0]
}

// ─── Print ────────────────────────────────────────────────────────────────────
function doPrint(mode) {
  showPrintMenu.value = false
  const name = schoolName()
  const logo = logoUrl()
  if (mode === 'monthly')  printMonthly(events.value, currentYear.value, name, logo)
  if (mode === 'yearly')   printYearOverview(events.value, currentYear.value, name, logo)
  if (mode === 'list')     printEventList(events.value, currentYear.value, name, logo)
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// ─── Data Fetching ────────────────────────────────────────────────────────────
async function fetchEvents() {
  loading.value = true
  selectedEvent.value = null
  const { data, error } = await supabase
    .from('academic_calendar')
    .select('*')
    .eq('academic_year', currentYear.value)
    .eq('is_public', true)
    .order('start_date')
  if (error) console.error('fetchEvents error:', error)
  events.value = data || []
  loading.value = false
}

// Re-fetch when year changes
watch(currentYear, fetchEvents)

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchConfig()
  await fetchEvents()
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 9999px;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
