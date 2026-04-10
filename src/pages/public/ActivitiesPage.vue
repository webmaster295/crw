<template>
  <PublicLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-br from-orange-500 to-amber-500 text-white py-12 px-4">
        <div class="max-w-7xl mx-auto text-center">
          <div class="text-5xl mb-3">{{ pageIcon }}</div>
          <h1 class="text-3xl font-bold mb-2">{{ pageTitle }}ทั้งหมด</h1>
          <p class="text-orange-100 text-sm">{{ pageSubtitle }}</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Search -->
        <div class="mb-6 relative max-w-md">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อกิจกรรม..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="i in 9" :key="i" class="animate-pulse flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-3.5">
            <div class="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
              <div class="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredAlbums.length" class="text-center py-20 text-gray-400">
          <div class="text-5xl mb-3">📁</div>
          <p>ไม่พบกิจกรรม{{ searchQuery ? 'ที่ค้นหา' : '' }}</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a v-for="(item, idx) in filteredAlbums" :key="item.id"
            :href="item.link_url || '#'"
            :target="item.link_url ? '_blank' : '_self'"
            rel="noopener noreferrer"
            @click="incrementViews(item)"
            class="group flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 hover:border-orange-300 hover:shadow-md transition-all no-underline">
            <!-- Icon -->
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110', FOLDER_COLORS[idx % FOLDER_COLORS.length]]">
              {{ item.cover_emoji || '📁' }}
            </div>
            <!-- Info -->
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-1">
                {{ item.title }}
              </h3>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', linkMeta(item).badgeCls]">
                  {{ linkMeta(item).short }}
                </span>
                <span v-if="item.activity_date" class="text-xs text-gray-400">
                  {{ formatDate(item.activity_date) }}
                </span>
                <span class="text-xs text-gray-400 ml-auto">👁 {{ (item.views || 0).toLocaleString() }}</span>
              </div>
              <p v-if="item.description" class="text-xs text-gray-400 mt-0.5 line-clamp-1">{{ item.description }}</p>
            </div>
            <!-- Arrow -->
            <span class="text-gray-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all flex-shrink-0">→</span>
          </a>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
          <button @click="goPage(currentPage - 1)" :disabled="currentPage === 1"
            class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            ←
          </button>
          <button v-for="p in totalPages" :key="p" @click="goPage(p)"
            :class="['w-9 h-9 rounded-full text-sm font-medium transition-all',
              p === currentPage ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']">
            {{ p }}
          </button>
          <button @click="goPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            →
          </button>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'
import { useSchoolConfig } from '../../composables/useSchoolConfig.js'

const { config, fetchConfig } = useSchoolConfig()
const pageTitle    = ref('ภาพกิจกรรม')
const pageSubtitle = ref('คลังภาพกิจกรรมและความทรงจำของโรงเรียน')
const pageIcon     = ref('🖼️')

const FOLDER_COLORS = [
  'bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100',
  'bg-pink-100', 'bg-yellow-100', 'bg-teal-100', 'bg-red-100',
  'bg-indigo-100', 'bg-amber-100',
]

const LINK_TYPES = {
  drive:    { short: '🗂️ Drive',   badgeCls: 'bg-blue-100 text-blue-700' },
  photos:   { short: '📷 Photos',  badgeCls: 'bg-teal-100 text-teal-700' },
  facebook: { short: '📘 Facebook', badgeCls: 'bg-indigo-100 text-indigo-700' },
  flickr:   { short: '📸 Flickr',  badgeCls: 'bg-pink-100 text-pink-700' },
  youtube:  { short: '▶️ YouTube',  badgeCls: 'bg-red-100 text-red-700' },
  link:     { short: '🔗 ลิงค์',   badgeCls: 'bg-gray-100 text-gray-600' },
  none:     { short: '📁 อัลบั้ม', badgeCls: 'bg-white/60 text-gray-500' },
}

function detectType(url) {
  if (!url) return 'none'
  if (/drive\.google\.com/i.test(url))    return 'drive'
  if (/photos\.google\.com/i.test(url))   return 'photos'
  if (/facebook\.com|fb\.com/i.test(url)) return 'facebook'
  if (/flickr\.com/i.test(url))           return 'flickr'
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube'
  return 'link'
}

function linkMeta(item) { return LINK_TYPES[detectType(item.link_url)] }

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

const allAlbums   = ref([])
const loading     = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const perPage     = 20

const filteredAlbums = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const all = q ? allAlbums.value.filter(a => a.title.toLowerCase().includes(q)) : allAlbums.value
  const from = (currentPage.value - 1) * perPage
  return all.slice(from, from + perPage)
})

const totalItems = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return q ? allAlbums.value.filter(a => a.title.toLowerCase().includes(q)).length : allAlbums.value.length
})

const totalPages = computed(() => Math.ceil(totalItems.value / perPage))

function goPage(p) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(searchQuery, () => { currentPage.value = 1 })

function incrementViews(item) {
  if (item.link_url) {
    item.views = (item.views || 0) + 1
    supabase.rpc('increment_activity_views', { album_id: item.id }).catch(() => {})
  }
}

async function fetchAlbums() {
  loading.value = true
  await fetchConfig()
  const raw = config.value?.homepage_sections
  const sections = typeof raw === 'string' ? JSON.parse(raw) : (raw || [])
  const sec = sections.find(s => s.id === 'activity')
  if (sec?.title)    pageTitle.value    = sec.title
  if (sec?.subtitle) pageSubtitle.value = sec.subtitle
  if (sec?.icon)     pageIcon.value     = sec.icon

  const { data } = await supabase.from('activities')
    .select('id,title,cover_emoji,link_url,description,activity_date,views')
    .eq('is_published', true)
    .order('activity_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  allAlbums.value = data || []
  loading.value = false
}

fetchAlbums()
</script>
