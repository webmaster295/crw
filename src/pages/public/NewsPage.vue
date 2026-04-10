<template>
  <PublicLayout>
    <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-10">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ pageIcon }} {{ pageTitle }}ทั้งหมด</h1>
        <div class="w-10 h-1 bg-blue-600 rounded-full"></div>
      </div>

      <!-- Search & Filter -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาข่าว..."
            class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div class="flex gap-2 flex-wrap">
          <button v-for="c in categories" :key="c.key" @click="activeCategory = c.key"
            :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeCategory === c.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600']">
            {{ c.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <div v-for="i in 8" :key="i" class="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm">
          <div class="h-44 bg-gray-200"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-4/5"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Pinned News -->
        <div v-if="pinnedNews.length" class="mb-6">
          <RouterLink v-for="item in pinnedNews" :key="item.id" :to="`/news/${item.id}`"
            class="group flex flex-col sm:flex-row gap-0 bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-0.5 mb-4 border border-yellow-200">
            <div class="sm:w-72 h-52 sm:h-auto overflow-hidden bg-gray-100 flex-shrink-0">
              <img v-if="item.cover_image_url" :src="item.cover_image_url" :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div v-else class="w-full h-full bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center text-5xl">📌</div>
            </div>
            <div class="p-5 flex flex-col justify-center">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-yellow-500 text-sm">📌</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{{ item.category }}</span>
                <span v-if="item.external_url" class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">🔗 ภายนอก</span>
              </div>
              <h2 class="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">{{ item.title }}</h2>
              <p v-if="item.excerpt" class="text-sm text-gray-500 line-clamp-2 mb-3">{{ item.excerpt }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(item.published_at) }}</p>
            </div>
          </RouterLink>
        </div>

        <!-- News Grid -->
        <div v-if="pagedNews.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <RouterLink v-for="item in pagedNews" :key="item.id" :to="`/news/${item.id}`"
            class="group bg-white rounded-2xl shadow-md border border-gray-200/70 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div class="aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0 relative">
              <img v-if="item.cover_image_url" :src="item.cover_image_url" :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div v-else class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-4xl">📰</div>
              <span v-if="item.external_url" class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600/90 text-white shadow-sm">🔗</span>
            </div>
            <div class="p-4 flex flex-col flex-1">
              <span class="text-xs text-blue-600 font-medium mb-1">{{ item.category }}</span>
              <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug mb-1">{{ item.title }}</h3>
              <p v-if="item.excerpt" class="text-xs text-gray-500 line-clamp-2 flex-1 leading-relaxed">{{ item.excerpt }}</p>
              <p v-else class="text-xs text-gray-400 flex-1 italic">คลิกเพื่ออ่านรายละเอียด →</p>
              <p class="text-xs text-gray-400 mt-2">{{ formatDate(item.published_at) }}</p>
            </div>
          </RouterLink>
        </div>

        <!-- Empty -->
        <div v-else-if="!loading" class="text-center py-20 text-gray-400">
          <div class="text-5xl mb-3">📰</div>
          <p>ไม่พบข่าว{{ searchQuery ? 'ที่ค้นหา' : '' }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
          <button @click="goPage(currentPage - 1)" :disabled="currentPage === 1"
            class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            ←
          </button>

          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="text-gray-400 px-1">···</span>
            <button v-else @click="goPage(p)"
              :class="['w-9 h-9 rounded-full text-sm font-medium transition-all',
                p === currentPage
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100']">
              {{ p }}
            </button>
          </template>

          <button @click="goPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            →
          </button>
        </div>
        <p v-if="totalPages > 1" class="text-center text-xs text-gray-400 mt-2">
          หน้า {{ currentPage }} / {{ totalPages }} · ทั้งหมด {{ filteredNews.length }} รายการ
        </p>
      </div>

    </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'
import { useSchoolConfig } from '../../composables/useSchoolConfig.js'

const { config, fetchConfig } = useSchoolConfig()
const pageTitle = ref('ข่าวประชาสัมพันธ์')
const pageIcon  = ref('📰')

const PER_PAGE = 12

const allNews      = ref([])
const categories   = ref([{ key: 'all', label: 'ทั้งหมด' }])
const loading      = ref(true)
const searchQuery  = ref('')
const activeCategory = ref('all')
const currentPage  = ref(1)

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}


const pinnedNews = computed(() =>
  allNews.value.filter(n => n.is_pinned).slice(0, 1)
)

const filteredNews = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return allNews.value.filter(n => {
    if (n.is_pinned) return false
    const matchSearch = !q || n.title.toLowerCase().includes(q) || (n.excerpt || '').toLowerCase().includes(q)
    const matchCat = activeCategory.value === 'all' || n.category === activeCategory.value
    return matchSearch && matchCat
  })
})

const totalPages = computed(() => Math.ceil(filteredNews.value.length / PER_PAGE))

const pagedNews = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return filteredNews.value.slice(start, start + PER_PAGE)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (cur <= 4) {
    pages.push(...[1, 2, 3, 4, 5], '...', total)
  } else if (cur >= total - 3) {
    pages.push(1, '...', ...[total - 4, total - 3, total - 2, total - 1, total])
  } else {
    pages.push(1, '...', cur - 1, cur, cur + 1, '...', total)
  }
  return pages
})

function goPage(p) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch([searchQuery, activeCategory], () => { currentPage.value = 1 })

async function fetchNews() {
  loading.value = true
  await fetchConfig()
  const raw = config.value?.homepage_sections
  const sections = typeof raw === 'string' ? JSON.parse(raw) : (raw || [])
  const sec = sections.find(s => s.id === 'news')
  if (sec?.title) pageTitle.value = sec.title
  if (sec?.icon)  pageIcon.value  = sec.icon

  const [{ data: news }, { data: cats }] = await Promise.all([
    supabase.from('news')
      .select('id,title,excerpt,cover_image_url,category,published_at,is_pinned,external_url')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false }),
    supabase.from('news_categories')
      .select('name').order('sort_order').order('name')
  ])
  allNews.value = news || []
  categories.value = [
    { key: 'all', label: 'ทั้งหมด' },
    ...(cats || []).map(c => ({ key: c.name, label: c.name }))
  ]
  loading.value = false
}

onMounted(fetchNews)
</script>
