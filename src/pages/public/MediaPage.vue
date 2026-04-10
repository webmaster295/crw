<template>
  <PublicLayout>
    <!-- Hero — ดึงชื่อจาก site_settings เหมือนหน้าแรก -->
    <div class="bg-gradient-to-br from-blue-700 to-indigo-800 text-white py-12 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <div class="text-5xl mb-3">{{ heroIcon }}</div>
        <h1 class="text-3xl font-bold mb-2">{{ heroTitle }}</h1>
        <p class="text-blue-200 text-sm">{{ heroSubtitle }}</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Search + Filter -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาสื่อ..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select v-model="filterType" class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">ทุกประเภท</option>
          <option value="youtube">▶️ YouTube</option>
          <option value="slides">📊 Slides</option>
          <option value="pdf">📄 PDF</option>
          <option value="canva">🎨 Canva</option>
          <option value="link">🌐 ลิงก์</option>
        </select>
      </div>

      <!-- Category tabs -->
      <div class="flex gap-2 flex-wrap mb-3">
        <button v-for="c in categories" :key="c.key" @click="activeCategory = c.key"
          :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all',
            activeCategory === c.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600']">
          {{ c.label }}
        </button>
      </div>

      <!-- Subject area tabs -->
      <div v-if="subjectAreas.length" class="flex gap-2 flex-wrap mb-8">
        <span class="text-xs text-gray-400 self-center mr-1">📚 กลุ่มสาระ:</span>
        <button @click="filterSubject = 'all'"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
            filterSubject === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600']">
          ทั้งหมด
        </button>
        <button v-for="s in subjectAreas" :key="s.name" @click="filterSubject = s.name"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
            filterSubject === s.name ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600']">
          {{ s.name }}
        </button>
      </div>
      <div v-else class="mb-3"></div>

      <!-- Grade level tabs -->
      <div v-if="gradeLevels.length" class="flex gap-2 flex-wrap mb-8">
        <span class="text-xs text-gray-400 self-center mr-1">🎓 ระดับชั้น:</span>
        <button @click="filterGrade = 'all'"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
            filterGrade === 'all' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600']">
          ทั้งหมด
        </button>
        <button v-for="g in gradeLevels" :key="g.name" @click="filterGrade = g.name"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
            filterGrade === g.name ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600']">
          {{ g.name }}
        </button>
      </div>
      <div v-else class="mb-8"></div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div v-for="i in 8" :key="i" class="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div class="aspect-video bg-gray-200"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!filteredMedia.length" class="text-center py-20 text-gray-400">
        <div class="text-5xl mb-3">📭</div>
        <p>ไม่พบสื่อที่ตรงกับการค้นหา</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <RouterLink v-for="item in filteredMedia" :key="item.id" :to="`/media/${item.id}`"
          class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 border border-gray-100">
          <div class="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            <img v-if="item.thumbnail_url" :src="item.thumbnail_url"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl">{{ typeIcon(item) }}</span>
            </div>
            <span :class="['absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm', typeBadgeStyle(item)]">
              {{ typeIcon(item) }} {{ typeShortLabel(item) }}
            </span>
            <span v-if="item.external_url" class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600/90 text-white shadow-sm">🔗</span>
            <span v-else-if="item.is_featured" class="absolute top-2 right-2 text-yellow-400 text-sm drop-shadow">⭐</span>
          </div>
          <div class="p-4">
            <div class="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span class="text-xs text-blue-600 font-medium">{{ item.category }}</span>
              <span v-if="item.subject_area" class="text-xs text-purple-600 font-medium">· {{ item.subject_area }}</span>
              <span v-if="item.grade_level" class="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">{{ item.grade_level }}</span>
            </div>
            <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">{{ item.title }}</h3>
            <p v-if="item.description" class="text-xs text-gray-400 mt-1 line-clamp-1">{{ item.description }}</p>
            <div class="flex items-center justify-between mt-2">
              <span v-if="item.author_name" class="text-xs text-gray-400 truncate max-w-[70%]">👤 {{ item.author_name }}</span>
              <span v-if="item.views != null" class="text-xs text-gray-400 ml-auto">👁 {{ (item.views || 0).toLocaleString() }} ครั้ง</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'
import { useSchoolConfig } from '../../composables/useSchoolConfig.js'

const allMedia       = ref([])
const categories     = ref([{ key: 'all', label: 'ทั้งหมด' }])
const subjectAreas   = ref([])
const gradeLevels    = ref([])
const loading        = ref(true)
const searchQuery    = ref('')
const activeCategory = ref('all')
const filterSubject  = ref('all')
const filterGrade    = ref('all')
const filterType     = ref('all')

// Hero — ดึงจาก school_config.homepage_sections เหมือน HomePage
const { config, fetchConfig } = useSchoolConfig()
const heroTitle    = ref('คลังสื่อการเรียนรู้')
const heroSubtitle = ref('วิดีโอ สื่อนำเสนอ เอกสาร และแหล่งเรียนรู้ออนไลน์')
const heroIcon     = ref('📚')

function detectType(item) {
  if (item.media_type === 'link') return 'link'
  const url = item.content || ''
  const iframeSrc = url.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1] || url
  if (/youtu/.test(iframeSrc)) return 'youtube'
  if (/docs\.google\.com\/presentation/.test(iframeSrc)) return 'slides'
  if (/drive\.google\.com/.test(iframeSrc)) return 'pdf'
  if (/canva\.com/.test(iframeSrc)) return 'canva'
  return 'embed'
}
function typeIcon(item) {
  return { youtube:'▶️', slides:'📊', pdf:'📄', canva:'🎨', link:'🌐', embed:'🔗' }[detectType(item)] || '🔗'
}
function typeShortLabel(item) {
  return { youtube:'Video', slides:'Slides', pdf:'PDF', canva:'Canva', link:'Link', embed:'Embed' }[detectType(item)] || 'Embed'
}
function typeBadgeStyle(item) {
  return {
    youtube: 'bg-red-500 text-white',
    slides:  'bg-green-600 text-white',
    pdf:     'bg-orange-500 text-white',
    canva:   'bg-purple-600 text-white',
    link:    'bg-blue-600 text-white',
    embed:   'bg-gray-600 text-white',
  }[detectType(item)] || 'bg-gray-600 text-white'
}

const filteredMedia = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return allMedia.value.filter(m => {
    const matchQ       = !q || m.title.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q)
    const matchCat     = activeCategory.value === 'all' || m.category === activeCategory.value
    const matchSubject = filterSubject.value === 'all' || m.subject_area === filterSubject.value
    const matchGrade   = filterGrade.value   === 'all' || m.grade_level  === filterGrade.value
    const matchType    = filterType.value    === 'all' || detectType(m)  === filterType.value
    return matchQ && matchCat && matchSubject && matchGrade && matchType
  })
})

async function fetchMedia() {
  loading.value = true
  // ดึง hero config จาก school_config (เหมือน HomePage)
  await fetchConfig()
  const raw = config.value?.homepage_sections
  const sections = typeof raw === 'string' ? JSON.parse(raw) : (raw || [])
  const sec = sections.find(s => s.id === 'media')
  if (sec?.title)    heroTitle.value    = sec.title
  if (sec?.subtitle) heroSubtitle.value = sec.subtitle
  if (sec?.icon)     heroIcon.value     = sec.icon

  const [{ data: media }, { data: cats }, { data: subjects }, { data: grades }] = await Promise.all([
    supabase.from('media')
      .select('id,title,description,thumbnail_url,category,subject_area,grade_level,author_name,media_type,content,is_featured,views,external_url')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase.from('media_categories').select('name').order('sort_order').order('name'),
    supabase.from('subject_areas').select('name').order('sort_order').order('name'),
    supabase.from('grade_levels').select('name').order('sort_order').order('name'),
  ])
  allMedia.value   = media || []
  categories.value = [
    { key: 'all', label: 'ทั้งหมด' },
    ...(cats || []).map(c => ({ key: c.name, label: c.name })),
  ]
  subjectAreas.value = subjects || []
  gradeLevels.value  = grades   || []
  loading.value = false
}

onMounted(fetchMedia)
</script>
