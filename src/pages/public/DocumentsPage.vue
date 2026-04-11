<template>
  <PublicLayout>
    <section class="py-14 bg-gray-50 min-h-screen">
      <div class="max-w-5xl mx-auto px-4">

        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-3xl mb-4">📂</div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">เอกสาร / ดาวน์โหลด</h1>
          <p class="text-gray-400 text-sm">แบบฟอร์ม ระเบียบ คู่มือ และเอกสารต่างๆ ของโรงเรียน</p>
        </div>

        <!-- Search + Filter -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Search -->
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input v-model="search" type="text" placeholder="ค้นหาเอกสาร..."
                class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent" />
            </div>
            <!-- Category filter -->
            <div class="flex flex-wrap gap-2">
              <button v-for="cat in [{ key: 'all', label: 'ทั้งหมด', icon: '📁' }, ...CATEGORIES]" :key="cat.key"
                @click="activeCat = cat.key"
                :class="['px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                  activeCat === cat.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
                {{ cat.icon }} {{ cat.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-16">
          <div class="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-400 text-sm">กำลังโหลด...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredDocs.length" class="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p class="text-5xl mb-3">📭</p>
          <p class="text-gray-400">{{ search ? 'ไม่พบเอกสารที่ค้นหา' : 'ยังไม่มีเอกสารในหมวดนี้' }}</p>
        </div>

        <!-- Doc Grid by Category -->
        <div v-else class="space-y-8">
          <div v-for="group in groupedDocs" :key="group.key">
            <!-- Category heading (แสดงเฉพาะเมื่อดู "ทั้งหมด") -->
            <div v-if="activeCat === 'all'" class="flex items-center gap-3 mb-3">
              <span class="text-xl">{{ group.icon }}</span>
              <h2 class="font-bold text-gray-700 text-base">{{ group.label }}</h2>
              <div class="flex-1 h-px bg-gray-200"></div>
              <span class="text-xs text-gray-400">{{ group.docs.length }} รายการ</span>
            </div>

            <!-- Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="doc in group.docs" :key="doc.id"
                class="bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all group flex flex-col gap-3">

                <!-- File icon + type badge -->
                <div class="flex items-start justify-between">
                  <span class="text-3xl">{{ fileIcon(doc.file_type) }}</span>
                  <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                    {{ doc.file_type }}
                  </span>
                </div>

                <!-- Info -->
                <div class="flex-1">
                  <p class="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                    {{ doc.title }}
                  </p>
                  <p v-if="doc.description" class="text-xs text-gray-400 mt-1 leading-relaxed">{{ doc.description }}</p>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span class="text-xs text-gray-300 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    {{ doc.download_count }} ครั้ง
                  </span>
                  <button @click="download(doc)"
                    class="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-xl transition-all">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    ดาวน์โหลด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'

const CATEGORIES = [
  { key: 'form',         label: 'แบบฟอร์ม',        icon: '📝' },
  { key: 'regulation',   label: 'ระเบียบ/ข้อบังคับ', icon: '📋' },
  { key: 'manual',       label: 'คู่มือ',            icon: '📖' },
  { key: 'report',       label: 'รายงาน',            icon: '📊' },
  { key: 'announcement', label: 'ประกาศ',            icon: '📢' },
  { key: 'other',        label: 'อื่นๆ',             icon: '📁' },
]

const FILE_ICONS = { pdf: '📄', doc: '📝', xls: '📊', ppt: '📑', link: '🔗' }
function fileIcon(t) { return FILE_ICONS[t] || '📁' }

const docs      = ref([])
const loading   = ref(true)
const search    = ref('')
const activeCat = ref('all')

const filteredDocs = computed(() => {
  let list = docs.value
  if (activeCat.value !== 'all') list = list.filter(d => d.category === activeCat.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(d => d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q))
  }
  return list
})

const groupedDocs = computed(() => {
  if (activeCat.value !== 'all') {
    const cat = CATEGORIES.find(c => c.key === activeCat.value) || { key: activeCat.value, label: activeCat.value, icon: '📁' }
    return [{ ...cat, docs: filteredDocs.value }]
  }
  return CATEGORIES
    .map(cat => ({ ...cat, docs: filteredDocs.value.filter(d => d.category === cat.key) }))
    .filter(g => g.docs.length > 0)
})

async function download(doc) {
  window.open(doc.file_url, '_blank', 'noopener,noreferrer')
  doc.download_count++
  await supabase.rpc('increment_download_count', { doc_id: doc.id })
}

onMounted(async () => {
  const { data } = await supabase.from('documents')
    .select('id,title,description,category,file_type,file_url,download_count')
    .eq('is_public', true)
    .order('category')
    .order('sort_order')
    .order('created_at', { ascending: false })
  docs.value = data || []
  loading.value = false
})
</script>
