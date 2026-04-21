<template>
  <PublicLayout>
    <!-- Hero -->
    <div class="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 text-white py-10 px-4">
      <div class="max-w-5xl mx-auto text-center">
        <h1 class="text-2xl md:text-3xl font-bold">🎓 สารสนเทศข้อมูลนักเรียน</h1>
        <p class="text-blue-200 mt-1 text-sm">{{ config?.name_th || 'โรงเรียน' }}</p>
        <p class="text-blue-300 text-xs mt-1">ข้อมูลนักเรียนปัจจุบัน</p>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-8">

      <div v-if="loading" class="py-20 text-center text-gray-400">
        <div class="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p>กำลังโหลด...</p>
      </div>

      <div v-else-if="!stats" class="py-20 text-center text-gray-400">
        <div class="text-5xl mb-3">📊</div>
        <p>ยังไม่มีข้อมูลนักเรียน</p>
      </div>

      <template v-else>

        <!-- ===== FILTER TOOLS (centered, responsive) ===== -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <p class="text-sm font-semibold text-gray-600 text-center mb-4">🔍 กรองข้อมูลนักเรียน</p>

          <!-- Education group chips -->
          <div class="flex flex-wrap justify-center gap-2 mb-4">
            <button
              @click="selectGroup('')"
              :class="['px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                filterGroup === ''
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300']">
              ทั้งหมด
            </button>
            <button v-for="g in eduGroups" :key="g.key"
              @click="selectGroup(g.key)"
              :class="['px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                filterGroup === g.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300']">
              {{ g.label }}
              <span class="ml-1 text-xs opacity-60">({{ groupCount(g.key) }})</span>
            </button>
          </div>

          <!-- Grade + Room dropdowns -->
          <div class="flex flex-wrap justify-center gap-3">
            <select v-model="filterLevel" @change="filterRoom=''"
              class="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]">
              <option value="">— ทุกระดับชั้น —</option>
              <option v-for="l in filteredLevels" :key="l" :value="l">{{ l }}</option>
            </select>
            <select v-model="filterRoom"
              class="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]">
              <option value="">— ทุกห้อง —</option>
              <option v-for="r in roomsForLevel" :key="r" :value="r">ห้อง {{ r }}</option>
            </select>
            <button v-if="filterGroup || filterLevel || filterRoom"
              @click="clearFilter"
              class="px-4 py-2 rounded-xl text-sm border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all">
              ✕ ล้างตัวกรอง
            </button>
          </div>
        </div>

        <!-- ===== REAL-TIME SUMMARY DASHBOARD ===== -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <p class="text-xs text-gray-400 mb-1">นักเรียนทั้งหมด</p>
            <p class="text-4xl font-black text-blue-600">{{ filteredTotals.total.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">
              <span v-if="isFiltered" class="text-blue-500">จาก {{ stats.total?.toLocaleString() }} คน</span>
              <span v-else>คน</span>
            </p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <p class="text-xs text-gray-400 mb-1">👦 นักเรียนชาย</p>
            <p class="text-4xl font-black text-sky-500">{{ filteredTotals.male.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ filteredTotals.total ? Math.round(filteredTotals.male/filteredTotals.total*100) : 0 }}%
            </p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <p class="text-xs text-gray-400 mb-1">👧 นักเรียนหญิง</p>
            <p class="text-4xl font-black text-pink-500">{{ filteredTotals.female.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ filteredTotals.total ? Math.round(filteredTotals.female/filteredTotals.total*100) : 0 }}%
            </p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <p class="text-xs text-gray-400 mb-1">🏫 ห้องเรียน</p>
            <p class="text-4xl font-black text-purple-600">{{ filteredRoomCount }}</p>
            <p class="text-xs text-gray-400 mt-1">ห้อง</p>
          </div>
        </div>

        <!-- Level summary cards (real-time) — flex + centered last row -->
        <div v-if="!filterLevel" class="flex flex-wrap justify-center gap-3 mb-6">
          <div v-for="[lvl, cnt] in filteredByLevel" :key="lvl"
            @click="filterLevel = lvl; filterRoom = ''"
            class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)]">
            <p class="font-bold text-gray-800 text-lg">{{ lvl }}</p>
            <p class="text-2xl font-black text-blue-600 mt-1">{{ cnt.total.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              <span class="text-sky-500">{{ cnt.male }}</span> /
              <span class="text-pink-500">{{ cnt.female }}</span>
            </p>
          </div>
        </div>

        <!-- By Level/Room Table -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-gray-900">📊 จำนวนนักเรียนแยกตามชั้น-ห้อง</h3>
            <span class="text-xs text-gray-400">{{ filteredTotals.total.toLocaleString() }} คน · {{ filteredRoomCount }} ห้อง</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th class="py-3 px-5 text-left">ชั้น-ห้อง</th>
                  <th class="py-3 px-5 text-center">👦 ชาย</th>
                  <th class="py-3 px-5 text-center">👧 หญิง</th>
                  <th class="py-3 px-5 text-center font-bold text-gray-700">รวม</th>
                  <th class="py-3 px-5 text-left hidden md:table-cell">สัดส่วน</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in filteredTableRows" :key="row.key">
                  <tr v-if="row.isLevel" class="bg-blue-50">
                    <td class="py-2 px-5 font-bold text-blue-800" colspan="5">{{ row.label }}</td>
                  </tr>
                  <tr v-else class="border-b border-gray-50 hover:bg-gray-50/50">
                    <td class="py-2 px-5 pl-8 text-gray-700">{{ row.label }}</td>
                    <td class="py-2 px-5 text-center text-sky-600 font-medium">{{ row.male }}</td>
                    <td class="py-2 px-5 text-center text-pink-500 font-medium">{{ row.female }}</td>
                    <td class="py-2 px-5 text-center font-bold text-gray-900">{{ row.total }}</td>
                    <td class="py-2 px-5 hidden md:table-cell">
                      <div class="flex items-center gap-2">
                        <div class="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div class="h-2 bg-sky-400 rounded-l-full"
                            :style="`width:${row.total ? Math.round(row.male/row.total*100) : 0}%`"></div>
                        </div>
                        <span class="text-xs text-gray-400">
                          {{ row.total ? Math.round(row.male/row.total*100) : 0 }}% ชาย
                        </span>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr class="bg-blue-600 text-white">
                  <td class="py-3 px-5 font-bold">รวมทั้งหมด</td>
                  <td class="py-3 px-5 text-center font-bold">{{ filteredTotals.male.toLocaleString() }}</td>
                  <td class="py-3 px-5 text-center font-bold">{{ filteredTotals.female.toLocaleString() }}</td>
                  <td class="py-3 px-5 text-center font-black text-lg">{{ filteredTotals.total.toLocaleString() }}</td>
                  <td class="py-3 px-5 hidden md:table-cell text-blue-200 text-xs">
                    ชาย {{ filteredTotals.total ? Math.round(filteredTotals.male/filteredTotals.total*100) : 0 }}%
                    · หญิง {{ filteredTotals.total ? Math.round(filteredTotals.female/filteredTotals.total*100) : 0 }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ══ BMI Health Section ══════════════════════════════════════════════════ -->
        <div v-if="showPublicBMI" class="mt-8">
          <div class="flex items-center gap-3 mb-5">
            <span class="w-1.5 h-6 bg-green-500 rounded-full inline-block"></span>
            <h2 class="font-bold text-gray-900 text-lg">🏥 สุขภาพนักเรียน (BMI)</h2>
            <span v-if="bmiLoading" class="text-xs text-gray-400 animate-pulse">กำลังโหลด...</span>
            <span v-else-if="bmiStats.length" class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ bmiStats.length.toLocaleString() }} คน มีข้อมูล
            </span>
          </div>

          <div v-if="bmiLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div class="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-gray-400 text-sm">กำลังโหลดข้อมูล BMI...</p>
          </div>

          <div v-else-if="!bmiStats.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
            <div class="text-4xl mb-3">⚖️</div>
            <p>ยังไม่มีข้อมูลน้ำหนัก/ส่วนสูง</p>
          </div>

          <template v-else>
            <!-- BMI เฉลี่ย — แถวบน เต็มความกว้าง -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-3">
              <div class="text-5xl font-black text-blue-700 tracking-tight">
                {{ bmiAvg !== null ? bmiAvg.toFixed(1) : '-' }}
              </div>
              <div class="text-sm text-gray-400 mt-1 font-medium">BMI เฉลี่ย · {{ bmiStats.length.toLocaleString() }} คน มีข้อมูล</div>
            </div>

            <!-- ผอม / สมส่วน / น้ำหนักเกิน / อ้วน — แถวล่าง 4 คอลัมน์ -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div v-for="cat in BMI_CATS_PUB" :key="cat.key"
                :class="['rounded-2xl shadow-sm border p-4 text-center', cat.light, cat.border]">
                <div :class="['text-3xl font-black', cat.text]">
                  {{ (bmiCounts[cat.key]||0).toLocaleString() }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">{{ cat.key }}</div>
                <div :class="['text-[11px] font-medium mt-0.5', cat.text]">
                  {{ bmiStats.length ? ((bmiCounts[cat.key]||0)/bmiStats.length*100).toFixed(1) : 0 }}%
                </div>
              </div>
            </div>

            <!-- Stacked distribution bar -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <div class="font-semibold text-gray-700 mb-3 text-sm">สัดส่วนภาวะโภชนาการ</div>
              <div class="flex h-10 rounded-2xl overflow-hidden gap-px mb-3">
                <div v-for="cat in BMI_CATS_PUB" :key="'bar-'+cat.key"
                  :class="[cat.color, 'flex items-center justify-center transition-all duration-700 overflow-hidden']"
                  :style="{ width: `${Math.max(0,(bmiCounts[cat.key]||0)/bmiStats.length*100)}%` }">
                  <span v-if="(bmiCounts[cat.key]||0)/bmiStats.length > 0.07"
                    class="text-white text-xs font-bold drop-shadow">
                    {{ ((bmiCounts[cat.key]||0)/bmiStats.length*100).toFixed(1) }}%
                  </span>
                </div>
              </div>
              <div class="flex flex-wrap gap-4 justify-center">
                <div v-for="cat in BMI_CATS_PUB" :key="'leg-'+cat.key" class="flex items-center gap-1.5">
                  <div :class="['w-3 h-3 rounded-full', cat.color]"></div>
                  <span class="text-sm text-gray-600">{{ cat.key }}</span>
                  <span :class="['text-sm font-bold', cat.text]">{{ (bmiCounts[cat.key]||0).toLocaleString() }}</span>
                  <span class="text-xs text-gray-300">
                    ({{ bmiStats.length ? ((bmiCounts[cat.key]||0)/bmiStats.length*100).toFixed(0) : 0 }}%)
                  </span>
                </div>
              </div>
            </div>

            <!-- By Grade table -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 class="font-bold text-gray-900">BMI แยกตามชั้นเรียน</h3>
                <span class="text-xs text-gray-400">น้ำหนัก/ส่วนสูงล่าสุดของนักเรียนแต่ละคน</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th class="py-3 px-5 text-left">ชั้น</th>
                      <th class="py-3 px-4 text-center text-blue-500">ผอม</th>
                      <th class="py-3 px-4 text-center text-green-600">สมส่วน</th>
                      <th class="py-3 px-4 text-center text-amber-500">น้ำหนักเกิน</th>
                      <th class="py-3 px-4 text-center text-red-500">อ้วน</th>
                      <th class="py-3 px-4 text-center text-teal-600">BMI เฉลี่ย</th>
                      <th class="py-3 px-5 text-left hidden md:table-cell">สัดส่วน</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="g in bmiByGrade" :key="'pub-'+g.grade" class="hover:bg-gray-50 transition">
                      <td class="py-3 px-5 font-bold text-gray-800">{{ g.grade }}</td>
                      <td class="py-3 px-4 text-center font-semibold text-blue-500">{{ g['ผอม']||0 }}</td>
                      <td class="py-3 px-4 text-center font-semibold text-green-600">{{ g['สมส่วน']||0 }}</td>
                      <td class="py-3 px-4 text-center font-semibold text-amber-500">{{ g['น้ำหนักเกิน']||0 }}</td>
                      <td class="py-3 px-4 text-center font-semibold text-red-500">{{ g['อ้วน']||0 }}</td>
                      <td class="py-3 px-4 text-center font-mono font-bold"
                        :class="g.total&&(g.bmiSum/g.total)<18.5?'text-blue-500':g.total&&(g.bmiSum/g.total)<23?'text-green-600':g.total&&(g.bmiSum/g.total)<27.5?'text-amber-500':'text-red-500'">
                        {{ g.total ? (g.bmiSum/g.total).toFixed(1) : '-' }}
                      </td>
                      <td class="py-3 px-5 hidden md:table-cell">
                        <div class="flex h-5 rounded-full overflow-hidden gap-px w-32" v-if="g.total">
                          <div v-for="cat in BMI_CATS_PUB" :key="'st-'+cat.key+g.grade"
                            :class="cat.color"
                            :style="{ width: `${(g[cat.key]||0)/g.total*100}%` }">
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- เกณฑ์อ้างอิง -->
            <div class="mt-4 bg-gray-50 rounded-2xl border border-gray-100 p-4 text-xs text-gray-500 text-center">
              เกณฑ์ BMI มาตรฐานไทย:
              <span class="text-blue-500 font-semibold ml-2">ผอม &lt;18.5</span> ·
              <span class="text-green-600 font-semibold">สมส่วน 18.5–22.9</span> ·
              <span class="text-amber-500 font-semibold">น้ำหนักเกิน 23–27.4</span> ·
              <span class="text-red-500 font-semibold">อ้วน ≥27.5</span>
              <span class="ml-2 text-gray-400">· สูตร BMI = น้ำหนัก(กก.) ÷ ส่วนสูง²(ม.)</span>
            </div>
          </template>
        </div>

        <!-- ══ เปรียบเทียบสถิตินักเรียน ══════════════════════════════════════════ -->
        <div v-if="showPublicSIS" class="mt-8">
          <div class="flex items-center gap-3 mb-5">
            <span class="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
            <h2 class="font-bold text-gray-900 text-lg">📊 เปรียบเทียบสถิตินักเรียน</h2>
            <span v-if="sisLoading" class="text-xs text-gray-400 animate-pulse">กำลังโหลด...</span>
          </div>

          <div v-if="sisLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div class="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
          </div>

          <div v-else-if="!sisSessions.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
            <div class="text-4xl mb-3">📊</div><p>ยังไม่มีข้อมูลสถิติ</p>
          </div>

          <template v-else>
            <!-- SVG Bar + Trend Chart -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-gray-700">จำนวนนักเรียนรวมแต่ละปี</p>
                <div class="flex items-center gap-3 text-xs text-gray-400">
                  <span class="flex items-center gap-1"><span class="w-6 h-2.5 rounded bg-indigo-400 inline-block"></span>รวม</span>
                  <span class="flex items-center gap-1">
                    <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#f97316" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="4" r="2.5" fill="white" stroke="#f97316" stroke-width="1.5"/></svg>
                    แนวโน้ม
                  </span>
                </div>
              </div>
              <div class="w-full overflow-x-auto">
                <svg :viewBox="`0 0 ${SC.W} ${SC.H}`" class="w-full" style="min-width:280px;overflow:visible">
                  <defs>
                    <linearGradient id="pubSisGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#4f46e5"/>
                    </linearGradient>
                  </defs>
                  <!-- Y-axis grid -->
                  <g v-for="tick in sisTicks" :key="tick.v">
                    <line :x1="SC.PL" :y1="tick.y" :x2="SC.W-SC.PR" :y2="tick.y"
                      :stroke="tick.v===0?'#cbd5e1':'#f1f5f9'" :stroke-width="tick.v===0?1.5:1"/>
                    <text :x="SC.PL-5" :y="tick.y+4" text-anchor="end" font-size="9" fill="#94a3b8">{{ tick.label }}</text>
                  </g>
                  <!-- Bars -->
                  <g v-for="bar in sisBars" :key="bar.s.id">
                    <rect :x="bar.x" :y="bar.y" :width="bar.w" :height="bar.h" rx="4" fill="url(#pubSisGrad)" opacity="0.9"/>
                    <text v-if="bar.h > 18" :x="bar.cx" :y="bar.y-4" text-anchor="middle" font-size="9" font-weight="700" fill="#4f46e5">
                      {{ bar.val >= 1000 ? `${(bar.val/1000).toFixed(1)}k` : bar.val }}
                    </text>
                    <text :x="bar.cx" :y="SC.H-SC.PB+14" text-anchor="middle" font-size="9" fill="#475569" font-weight="600">{{ bar.s.academic_year }}</text>
                    <text v-if="bar.s.checkpoint_label" :x="bar.cx" :y="SC.H-SC.PB+25" text-anchor="middle" font-size="7.5" fill="#94a3b8">
                      {{ bar.s.checkpoint_label.length > 12 ? bar.s.checkpoint_label.slice(0,11)+'…' : bar.s.checkpoint_label }}
                    </text>
                  </g>
                  <!-- Trend -->
                  <path v-if="sisTrend" :d="sisTrend" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle v-for="bar in sisBars" :key="'d'+bar.s.id" :cx="bar.cx" :cy="bar.ty" r="4" fill="white" stroke="#f97316" stroke-width="2"/>
                  <!-- Axes -->
                  <line :x1="SC.PL" :y1="SC.PT" :x2="SC.PL" :y2="SC.H-SC.PB" stroke="#e2e8f0" stroke-width="1.5"/>
                  <line :x1="SC.PL" :y1="SC.H-SC.PB" :x2="SC.W-SC.PR" :y2="SC.H-SC.PB" stroke="#e2e8f0" stroke-width="1.5"/>
                </svg>
              </div>
            </div>

            <!-- ตารางสรุป -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th class="py-2.5 px-4 text-left">รอบข้อมูล</th>
                    <th class="py-2.5 px-4 text-center">ปี</th>
                    <th class="py-2.5 px-4 text-center font-bold text-gray-700">รวม</th>
                    <th class="py-2.5 px-4 text-center">👦 ชาย</th>
                    <th class="py-2.5 px-4 text-center">👧 หญิง</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in [...sisSessions].reverse()" :key="'pub-'+s.id" class="border-b border-gray-50">
                    <td class="py-2.5 px-4 text-gray-700 text-xs">{{ s.checkpoint_label || `ช่วง ${s.checkpoint}` }}</td>
                    <td class="py-2.5 px-4 text-center font-bold text-indigo-600">{{ s.academic_year }}</td>
                    <td class="py-2.5 px-4 text-center font-black text-gray-900">{{ (s.stats_json?.total||0).toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-center text-sky-500">{{ (s.stats_json?.male||0).toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-center text-pink-500">{{ (s.stats_json?.female||0).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>

      </template>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { useSchoolConfig } from '../../composables/useSchoolConfig'
import { supabase } from '../../lib/supabase'

const { config, fetchConfig } = useSchoolConfig()
const showPublicBMI = ref(false)
const showPublicSIS = ref(false)
const loading       = ref(true)
const stats         = ref(null)

// ── เปรียบเทียบสถิติ (SIS) ────────────────────────────────────────────────────
const sisLoading  = ref(false)
const sisSessions = ref([])   // เรียงเก่า→ใหม่

const SC = { W: 680, H: 230, PL: 46, PR: 16, PT: 18, PB: 44 }

const sisMax = computed(() =>
  Math.max(...sisSessions.value.map(s => s.stats_json?.total || 0), 1)
)
function sisTyAt(val) {
  return SC.PT + (SC.H - SC.PT - SC.PB) * (1 - val / sisMax.value)
}
const sisTicks = computed(() => {
  const max = sisMax.value
  let step = Math.pow(10, Math.floor(Math.log10(max / 4)))
  if (max / step > 8) step *= 2
  const ticks = []
  for (let v = 0; v <= max * 1.08; v += step)
    ticks.push({ v, y: sisTyAt(v), label: v >= 1000 ? `${(v/1000).toFixed(v%1000===0?0:1)}k` : v })
  return ticks
})
const sisBars = computed(() => {
  const n = sisSessions.value.length
  if (!n) return []
  const slotW = (SC.W - SC.PL - SC.PR) / n
  const barW  = Math.min(slotW * 0.52, 50)
  return sisSessions.value.map((s, i) => {
    const cx = SC.PL + slotW * i + slotW / 2
    const val = s.stats_json?.total || 0
    const ty  = sisTyAt(val)
    return { s, cx, x: cx - barW / 2, y: ty, w: barW, h: SC.H - SC.PB - ty, val, ty }
  })
})
const sisTrend = computed(() => {
  if (sisBars.value.length < 2) return ''
  return sisBars.value.map((b, i) => `${i===0?'M':'L'}${b.cx},${b.ty}`).join(' ')
})

async function loadSisSessions() {
  sisLoading.value = true
  try {
    const { data } = await supabase.rpc('get_public_sis_sessions')
    sisSessions.value = Array.isArray(data) ? data : []
  } catch (e) { console.error(e) }
  finally { sisLoading.value = false }
}

const filterGroup = ref('')
const filterLevel = ref('')
const filterRoom  = ref('')

// กลุ่มการศึกษา
const eduGroups = [
  { key: 'kinder',  label: 'อนุบาล',           levels: ['อ.1','อ.2','อ.3'] },
  { key: 'pri-lo',  label: 'ประถมต้น',          levels: ['ป.1','ป.2','ป.3'] },
  { key: 'pri-hi',  label: 'ประถมปลาย',         levels: ['ป.4','ป.5','ป.6'] },
  { key: 'sec-lo',  label: 'มัธยมศึกษาตอนต้น',  levels: ['ม.1','ม.2','ม.3'] },
  { key: 'sec-hi',  label: 'มัธยมศึกษาตอนปลาย', levels: ['ม.4','ม.5','ม.6'] },
]

function levelOrder(lvl) {
  if (!lvl) return 9999
  const n = parseInt(lvl.replace(/\D/g, '')) || 0
  if (lvl.startsWith('อ')) return n
  if (lvl.startsWith('ป')) return 100 + n
  if (lvl.startsWith('ม')) return 200 + n
  return 500 + n
}

const allLevels = computed(() =>
  Object.keys(stats.value?.byLevel || {}).sort((a, b) => levelOrder(a) - levelOrder(b))
)

// ระดับชั้นที่กรองตาม group
const filteredLevels = computed(() => {
  if (!filterGroup.value) return allLevels.value
  const g = eduGroups.find(g => g.key === filterGroup.value)
  return g ? allLevels.value.filter(l => g.levels.includes(l)) : allLevels.value
})

const isFiltered = computed(() => !!(filterGroup.value || filterLevel.value || filterRoom.value))

// นับจำนวนนักเรียนใน group
function groupCount(key) {
  const g = eduGroups.find(g => g.key === key)
  if (!g || !stats.value?.byLevel) return 0
  return g.levels.reduce((s, l) => s + (stats.value.byLevel[l] || 0), 0)
}

function selectGroup(key) {
  filterGroup.value = key
  filterLevel.value = ''
  filterRoom.value  = ''
}

function clearFilter() {
  filterGroup.value = ''
  filterLevel.value = ''
  filterRoom.value  = ''
}

const roomsForLevel = computed(() => {
  if (!filterLevel.value || !stats.value?.byRoom) return []
  return Object.keys(stats.value.byRoom)
    .filter(k => k.startsWith(filterLevel.value + '/'))
    .map(k => parseInt(k.split('/')[1]))
    .sort((a, b) => a - b)
})

// สร้าง rows ทั้งหมด
const allTableRows = computed(() => {
  if (!stats.value?.byRoom) return []
  const levelGroups = {}
  for (const [key, data] of Object.entries(stats.value.byRoom)) {
    const [level, room] = key.split('/')
    if (!levelGroups[level]) levelGroups[level] = []
    levelGroups[level].push({ room: parseInt(room), ...data, key })
  }
  const rows = []
  for (const level of Object.keys(levelGroups).sort((a, b) => levelOrder(a) - levelOrder(b))) {
    rows.push({ isLevel: true, label: level, key: 'hd-' + level, levelKey: level })
    for (const r of levelGroups[level].sort((a, b) => a.room - b.room)) {
      rows.push({
        isLevel: false, label: `ห้อง ${r.room}`,
        key: r.key, levelKey: level, roomKey: r.room,
        total: r.total, male: r.male, female: r.female,
      })
    }
  }
  return rows
})

const filteredTableRows = computed(() => {
  const groupLevels = filterGroup.value
    ? (eduGroups.find(g => g.key === filterGroup.value)?.levels || [])
    : null

  return allTableRows.value.filter(row => {
    if (row.isLevel) {
      if (groupLevels && !groupLevels.includes(row.levelKey)) return false
      if (filterLevel.value && row.levelKey !== filterLevel.value) return false
      return true
    }
    if (groupLevels && !groupLevels.includes(row.levelKey)) return false
    if (filterLevel.value && row.levelKey !== filterLevel.value) return false
    if (filterRoom.value && row.roomKey !== parseInt(filterRoom.value)) return false
    return true
  })
})

const filteredTotals = computed(() => {
  const dataRows = filteredTableRows.value.filter(r => !r.isLevel)
  const fromRoom = {
    total:  dataRows.reduce((s, r) => s + (r.total  || 0), 0),
    male:   dataRows.reduce((s, r) => s + (r.male   || 0), 0),
    female: dataRows.reduce((s, r) => s + (r.female || 0), 0),
  }
  // fallback: ถ้า byRoom ว่าง (room = NULL ทั้งหมด) ใช้ byLevelGender แทน
  if (fromRoom.total === 0 && stats.value?.byLevelGender) {
    const lvl = stats.value.byLevelGender
    const groupLevels = filterGroup.value
      ? (eduGroups.find(g => g.key === filterGroup.value)?.levels || null)
      : null
    let total = 0, male = 0, female = 0
    for (const [l, d] of Object.entries(lvl)) {
      if (filterLevel.value && l !== filterLevel.value) continue
      if (groupLevels && !groupLevels.includes(l)) continue
      total  += d.total  || 0
      male   += d.male   || 0
      female += d.female || 0
    }
    return { total, male, female }
  }
  return fromRoom
})

const filteredRoomCount = computed(() =>
  filteredTableRows.value.filter(r => !r.isLevel).length
)

// cards สรุปต่อชั้น (real-time ตาม group) — คืนเป็น array of [lvl, {total,male,female}]
const filteredByLevel = computed(() => {
  const groupLevels = filterGroup.value
    ? (eduGroups.find(g => g.key === filterGroup.value)?.levels || null)
    : null

  const acc = {}
  allTableRows.value
    .filter(r => !r.isLevel && (!groupLevels || groupLevels.includes(r.levelKey)))
    .forEach(r => {
      if (!acc[r.levelKey]) acc[r.levelKey] = { total: 0, male: 0, female: 0 }
      acc[r.levelKey].total  += r.total  || 0
      acc[r.levelKey].male   += r.male   || 0
      acc[r.levelKey].female += r.female || 0
    })
  return Object.entries(acc).sort((a, b) => levelOrder(a[0]) - levelOrder(b[0]))
})

// ══ BMI Section ════════════════════════════════════════════════════════════════
const bmiLoading  = ref(false)
const bmiRawData  = ref([])   // { grade_level, weight, height } จาก snapshots ล่าสุดของนักเรียนปัจจุบัน

const BMI_CATS_PUB = [
  { key: 'ผอม',          color: 'bg-blue-400',  light: 'bg-blue-50',  text: 'text-blue-500',  border: 'border-blue-200'  },
  { key: 'สมส่วน',      color: 'bg-green-400', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  { key: 'น้ำหนักเกิน', color: 'bg-amber-400', light: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-200' },
  { key: 'อ้วน',        color: 'bg-red-400',   light: 'bg-red-50',   text: 'text-red-500',   border: 'border-red-200'   },
]

function calcBMIPub(weight, height) {
  const w = parseFloat(weight), h = parseFloat(height)
  if (!w || !h || h < 50) return null
  return w / ((h / 100) ** 2)
}
function bmiCatPub(bmi) {
  if (bmi === null) return null
  if (bmi < 18.5) return 'ผอม'
  if (bmi < 23)   return 'สมส่วน'
  if (bmi < 27.5) return 'น้ำหนักเกิน'
  return 'อ้วน'
}
function numFromGradePub(v) { return parseFloat(String(v).replace(/[^\d.]/g,'')) || 0 }

const bmiStats = computed(() =>
  bmiRawData.value
    .map(s => ({ ...s, bmi: calcBMIPub(s.weight, s.height) }))
    .filter(s => s.bmi !== null)
)
const bmiAvg = computed(() =>
  bmiStats.value.length ? bmiStats.value.reduce((a,s)=>a+s.bmi,0)/bmiStats.value.length : null
)
const bmiCounts = computed(() => {
  const c = { 'ผอม': 0, 'สมส่วน': 0, 'น้ำหนักเกิน': 0, 'อ้วน': 0 }
  bmiStats.value.forEach(s => { const cat = bmiCatPub(s.bmi); if (cat) c[cat]++ })
  return c
})
const bmiByGrade = computed(() => {
  const map = {}
  bmiStats.value.forEach(s => {
    const g = s.grade_level || 'ไม่ระบุ'
    if (!map[g]) map[g] = { grade:g, total:0, ผอม:0, สมส่วน:0, 'น้ำหนักเกิน':0, อ้วน:0, bmiSum:0 }
    const cat = bmiCatPub(s.bmi)
    if (cat) { map[g][cat]++; map[g].total++; map[g].bmiSum += s.bmi }
  })
  return Object.values(map).sort((a,b) => numFromGradePub(a.grade)-numFromGradePub(b.grade))
})

async function loadPublicBMI() {
  bmiLoading.value = true
  try {
    // ใช้ RPC ที่รัน SECURITY DEFINER พร้อม paginate (PostgREST limit 1000/request)
    const all = []
    let from = 0
    while (true) {
      const { data, error } = await supabase
        .rpc('get_public_bmi_stats')
        .range(from, from + 999)
      if (error) { console.error(error); break }
      if (!data?.length) break
      all.push(...data)
      if (data.length < 1000) break
      from += 1000
    }
    bmiRawData.value = all
  } catch (e) { console.error(e) }
  finally { bmiLoading.value = false }
}

onMounted(async () => {
  await fetchConfig()
  showPublicBMI.value = config.value?.show_public_bmi ?? false
  showPublicSIS.value = config.value?.show_public_sis_comparison ?? false

  const { data } = await supabase.rpc('get_current_student_stats')
  stats.value = data || null
  loading.value = false

  if (showPublicBMI.value) loadPublicBMI()
  if (showPublicSIS.value) loadSisSessions()
})
</script>
