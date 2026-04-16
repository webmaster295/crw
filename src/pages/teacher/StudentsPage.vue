<template>
  <AdminLayout>
    <div class="p-6">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">รายชื่อนักเรียน</h1>
        <p class="text-gray-500 text-sm mt-1">ข้อมูลนักเรียนทั้งหมด กรองตามชั้นและห้องได้</p>
      </div>

      <!-- Filter + Actions Bar -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div class="flex flex-wrap items-end gap-3">

          <!-- ชั้น -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-600">ชั้น</label>
            <select
              v-model="selectedGrade"
              @change="selectedRoom = ''; currentPage = 1"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[130px]"
            >
              <option value="">-- ทุกชั้น --</option>
              <option v-for="g in gradeOptions" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <!-- ห้อง -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-600">ห้อง</label>
            <select
              v-model="selectedRoom"
              @change="currentPage = 1"
              :disabled="!selectedGrade"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">-- ทุกห้อง --</option>
              <option v-for="r in roomOptions" :key="r" :value="r">ห้อง {{ r }}</option>
            </select>
          </div>

          <!-- ค้นหา -->
          <div class="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label class="text-xs font-medium text-gray-600">ค้นหา</label>
            <input
              v-model="searchQuery"
              @input="currentPage = 1"
              type="text"
              placeholder="ชื่อ / นามสกุล / รหัส..."
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <!-- Spacer -->
          <div class="flex-1"></div>

          <!-- Export + Print -->
          <div class="flex items-end gap-2">
            <button
              @click="exportExcel"
              :disabled="loading || filteredStudents.length === 0"
              class="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
              Export Excel
            </button>
            <button
              @click="handlePrint"
              :disabled="loading || filteredStudents.length === 0"
              class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              พิมพ์
            </button>
          </div>

        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-24">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-500">กำลังโหลด...</span>
      </div>

      <template v-else>
        <!-- Data Table Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          <!-- Table Header Meta: จำนวน + rows per page -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span class="text-sm text-gray-600">
              ทั้งหมด
              <span class="font-semibold text-gray-800">{{ filteredStudents.length }}</span> คน
              <template v-if="selectedGrade"> · ชั้น {{ selectedGrade }}</template>
              <template v-if="selectedRoom"> ห้อง {{ selectedRoom }}</template>
            </span>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span>แสดง</span>
              <select
                v-model="pageSize"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
                <option :value="9999">ทั้งหมด</option>
              </select>
              <span>รายการ</span>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-blue-700 w-12">#</th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer select-none hover:bg-blue-100 transition"
                    @click="toggleSort('student_code')"
                  >
                    รหัส <span class="ml-0.5">{{ sortIcon('student_code') }}</span>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-blue-700">คำนำหน้า</th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer select-none hover:bg-blue-100 transition"
                    @click="toggleSort('first_name')"
                  >
                    ชื่อ <span class="ml-0.5">{{ sortIcon('first_name') }}</span>
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold text-blue-700 cursor-pointer select-none hover:bg-blue-100 transition"
                    @click="toggleSort('last_name')"
                  >
                    นามสกุล <span class="ml-0.5">{{ sortIcon('last_name') }}</span>
                  </th>
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold text-blue-700 cursor-pointer select-none hover:bg-blue-100 transition"
                    @click="toggleSort('grade_level')"
                  >
                    ชั้น <span class="ml-0.5">{{ sortIcon('grade_level') }}</span>
                  </th>
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold text-blue-700 cursor-pointer select-none hover:bg-blue-100 transition"
                    @click="toggleSort('room')"
                  >
                    ห้อง <span class="ml-0.5">{{ sortIcon('room') }}</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="(student, idx) in pagedStudents"
                  :key="student.student_code || idx"
                  class="hover:bg-blue-50/40 transition"
                >
                  <td class="px-4 py-2.5 text-center text-gray-400 text-xs">
                    {{ (currentPage - 1) * pageSize + idx + 1 }}
                  </td>
                  <td class="px-4 py-2.5 font-mono text-gray-700">{{ student.student_code }}</td>
                  <td class="px-4 py-2.5 text-gray-700">{{ student.prefix }}</td>
                  <td class="px-4 py-2.5 text-gray-800 font-medium">{{ student.first_name }}</td>
                  <td class="px-4 py-2.5 text-gray-800">{{ student.last_name }}</td>
                  <td class="px-4 py-2.5 text-center text-gray-700">{{ student.grade_level }}</td>
                  <td class="px-4 py-2.5 text-center text-gray-700">{{ student.room }}</td>
                </tr>
                <tr v-if="pagedStudents.length === 0">
                  <td colspan="7" class="text-center py-16 text-gray-400">ไม่พบข้อมูลนักเรียน</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span class="text-xs text-gray-500">
              หน้า {{ currentPage }} / {{ totalPages }}
              &nbsp;·&nbsp;
              แสดง {{ pageStart }}–{{ pageEnd }} จาก {{ filteredStudents.length }} คน
            </span>
            <div class="flex items-center gap-1">
              <button
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                class="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >«</button>
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >‹ ก่อน</button>

              <!-- Page buttons (max 5) -->
              <template v-for="p in pageButtons" :key="p">
                <button
                  @click="currentPage = p"
                  :class="[
                    'px-3 py-1 text-xs rounded-md border transition',
                    p === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  ]"
                >{{ p }}</button>
              </template>

              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >ถัดไป ›</button>
              <button
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                class="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >»</button>
            </div>
          </div>

        </div>
      </template>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { supabase } from '../../lib/supabase'
import { useSchoolConfig } from '../../composables/useSchoolConfig'
import * as XLSX from 'xlsx'

// ─── School config ─────────────────────────────────────────────────────────────
const { config, fetchConfig } = useSchoolConfig()
const currentSchoolName = computed(() => config.value?.name_th || 'โรงเรียน')
const logoUrl = computed(() => config.value?.logo_url || '')

// ─── Date พ.ศ. ────────────────────────────────────────────────────────────────
const todayFormatted = computed(() => {
  const d = new Date()
  const dd  = String(d.getDate()).padStart(2, '0')
  const mm  = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear() + 543
  return `${dd}/${mm}/${yyyy}`
})

// ─── Raw data ──────────────────────────────────────────────────────────────────
const loading  = ref(false)
const students = ref([])

async function loadStudents() {
  loading.value = true
  try {
    // Supabase จำกัด 1,000 rows ต่อ request — ดึงแบบ batch จนครบ
    const BATCH = 1000
    let allData = []
    let from = 0

    while (true) {
      const { data, error, count } = await supabase
        .from('students')
        .select('student_code, prefix, first_name, last_name, grade_level, room')
        .range(from, from + BATCH - 1)

      if (error) throw error
      if (!data || data.length === 0) break

      allData = allData.concat(data)
      if (data.length < BATCH) break   // ได้ครบแล้ว
      from += BATCH
    }

    students.value = allData
  } catch (e) {
    console.error('loadStudents error:', e)
  } finally {
    loading.value = false
  }
}

// ─── Filter state ──────────────────────────────────────────────────────────────
const selectedGrade = ref('')
const selectedRoom  = ref('')
const searchQuery   = ref('')

// ─── Sort state ────────────────────────────────────────────────────────────────
const sortKey = ref('grade_level')
const sortDir = ref('asc')          // 'asc' | 'desc'

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  currentPage.value = 1
}

function sortIcon(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

// ─── Pagination state ──────────────────────────────────────────────────────────
const pageSize    = ref(20)
const currentPage = ref(1)

// ─── Grade / Room options ──────────────────────────────────────────────────────
function numFromGrade(v) {
  return parseFloat(String(v).replace(/[^\d.]/g, '')) || 0
}

const gradeOptions = computed(() => {
  const set = new Set(students.value.map(s => s.grade_level))
  return [...set].sort((a, b) => numFromGrade(a) - numFromGrade(b))
})

const roomOptions = computed(() => {
  if (!selectedGrade.value) return []
  const set = new Set(
    students.value
      .filter(s => String(s.grade_level) === String(selectedGrade.value))
      .map(s => s.room)
  )
  return [...set].sort((a, b) => Number(a) - Number(b))
})

// ─── Filtered + Sorted list ────────────────────────────────────────────────────
const filteredStudents = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  let list = students.value.filter(s => {
    const gMatch = !selectedGrade.value || String(s.grade_level) === String(selectedGrade.value)
    const rMatch = !selectedRoom.value  || String(s.room)        === String(selectedRoom.value)
    const sMatch = !q ||
      (s.student_code || '').toLowerCase().includes(q) ||
      (s.first_name   || '').toLowerCase().includes(q) ||
      (s.last_name    || '').toLowerCase().includes(q)
    return gMatch && rMatch && sMatch
  })

  // Sort
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  list = [...list].sort((a, b) => {
    let va = a[key] ?? ''
    let vb = b[key] ?? ''
    // numeric-aware sort for grade/room
    if (key === 'grade_level') {
      return dir * (numFromGrade(va) - numFromGrade(vb))
    }
    if (key === 'room') {
      return dir * (Number(va) - Number(vb))
    }
    return dir * String(va).localeCompare(String(vb), 'th')
  })

  return list
})

// ─── Pagination computed ───────────────────────────────────────────────────────
const totalPages = computed(() =>
  pageSize.value >= 9999 ? 1 : Math.max(1, Math.ceil(filteredStudents.value.length / pageSize.value))
)

const pageStart = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const pageEnd   = computed(() => Math.min(currentPage.value * pageSize.value, filteredStudents.value.length))

const pagedStudents = computed(() => {
  if (pageSize.value >= 9999) return filteredStudents.value
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStudents.value.slice(start, start + pageSize.value)
})

// page buttons: up to 5 around current
const pageButtons = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  const delta = 2
  let start = Math.max(1, cur - delta)
  let end   = Math.min(total, cur + delta)
  if (end - start < delta * 2) {
    if (start === 1) end = Math.min(total, start + delta * 2)
    else start = Math.max(1, end - delta * 2)
  }
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// reset page when filter changes
watch(filteredStudents, () => {
  if (currentPage.value > totalPages.value) currentPage.value = 1
})

// ─── Print groups ──────────────────────────────────────────────────────────────
const printGroups = computed(() => {
  const map = new Map()
  for (const s of filteredStudents.value) {
    const key = `${s.grade_level}_${s.room}`
    if (!map.has(key)) map.set(key, { grade: s.grade_level, room: s.room, students: [] })
    map.get(key).students.push(s)
  }
  return [...map.values()].sort((a, b) => {
    const gd = numFromGrade(a.grade) - numFromGrade(b.grade)
    return gd !== 0 ? gd : Number(a.room) - Number(b.room)
  })
})

// ─── Export Excel ──────────────────────────────────────────────────────────────
function exportExcel() {
  const rows = filteredStudents.value.map((s, idx) => ({
    'ลำดับ':     idx + 1,
    'รหัส':      s.student_code,
    'คำนำหน้า': s.prefix,
    'ชื่อ':      s.first_name,
    'นามสกุล':  s.last_name,
    'ชั้น':      s.grade_level,
    'ห้อง':      s.room,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 7 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 6 }, { wch: 6 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อนักเรียน')

  const gradePart = selectedGrade.value || 'ทุกชั้น'
  const roomPart  = selectedRoom.value  ? `_ห้อง${selectedRoom.value}` : ''
  XLSX.writeFile(wb, `รายชื่อนักเรียน_${gradePart}${roomPart}.xlsx`)
}

// ─── Print in new tab ──────────────────────────────────────────────────────────
function handlePrint() {
  const groups     = printGroups.value
  const schoolName = currentSchoolName.value
  const logo       = logoUrl.value
  const today      = todayFormatted.value

  const groupsHtml = groups.map((group, gIdx) => {
    const isLast    = gIdx === groups.length - 1
    const smallFont = group.students.length > 30
    const rowsHtml  = group.students.map((s, i) => `
      <tr>
        <td class="col-no">${i + 1}</td>
        <td class="col-code">${s.student_code || ''}</td>
        <td class="col-prefix">${s.prefix || ''}</td>
        <td class="col-fname">${s.first_name || ''}</td>
        <td class="col-lname">${s.last_name || ''}</td>
        <td class="col-sign"></td>
        <td class="col-note"></td>
      </tr>`).join('')

    return `
    <div class="print-page${isLast ? '' : ' page-break'}">
      <div class="print-header">
        <div class="print-header-left">
          ${logo ? `<img src="${logo}" class="print-logo" />` : ''}
        </div>
        <div class="print-header-center">
          <div class="school-name">${schoolName}</div>
          <div class="class-title">รายชื่อนักเรียน ชั้น${group.grade} ห้อง ${group.room} &nbsp; จำนวน ${group.students.length} คน</div>
        </div>
        <div class="print-header-right">
          <div class="print-date">วันที่พิมพ์<br/>${today}</div>
        </div>
      </div>
      <hr class="divider" />
      <table class="print-table${smallFont ? ' small' : ''}">
        <thead>
          <tr>
            <th class="col-no">ลำดับ</th>
            <th class="col-code">รหัส</th>
            <th class="col-prefix">คำนำหน้า</th>
            <th class="col-fname">ชื่อ</th>
            <th class="col-lname">นามสกุล</th>
            <th class="col-sign">ลายมือชื่อ</th>
            <th class="col-note">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>รายชื่อนักเรียน</title>
  <style>
    @page { size: A4 portrait; margin: 1cm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Sarabun','TH Sarabun New','Tahoma',sans-serif;
      font-size: 11pt; margin: 0; padding: 0;
      background: white; color: #000;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .print-page { width: 19cm; margin: 0 auto; padding: 0; }
    .page-break  { page-break-after: always; }
    .print-header { display: flex; align-items: center; gap: 8pt; margin-bottom: 6pt; }
    .print-header-left  { flex: 0 0 1.8cm; }
    .print-logo  { width: 1.6cm; height: 1.6cm; object-fit: contain; }
    .print-header-center { flex: 1; text-align: center; }
    .print-header-right  { flex: 0 0 2.4cm; text-align: right; }
    .school-name  { font-size: 14pt; font-weight: bold; margin-bottom: 2pt; }
    .class-title  { font-size: 12pt; font-weight: bold; }
    .print-date   { font-size: 9pt; color: #333; line-height: 1.4; }
    .divider { border: none; border-top: 1.5px solid #333; margin-bottom: 6pt; }
    .print-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
    .print-table.small { font-size: 8.5pt; }
    .print-table thead tr { background-color: #dde3f0; }
    .print-table th, .print-table td { border: 0.5pt solid #888; padding: 3pt 5pt; vertical-align: middle; }
    .print-table th { font-weight: bold; font-size: 10.5pt; text-align: center; }
    .col-no     { width: 1.1cm; text-align: center; }
    .col-code   { width: 2.4cm; }
    .col-prefix { width: 2cm; }
    .col-fname  { width: 4.5cm; }
    .col-lname  { width: 4.5cm; }
    .col-sign   { width: 3.5cm; text-align: center; }
    .col-note   { width: 2cm; }
  </style>
</head>
<body>
  ${groupsHtml}
  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`

  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}

// ─── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchConfig()
  await loadStudents()
})
</script>
