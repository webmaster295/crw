<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Back -->
      <RouterLink to="/media" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
        ← กลับคลังสื่อ
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-gray-400 animate-pulse">
        <div class="text-4xl mb-2">📚</div>
        <p class="text-sm">กำลังโหลด...</p>
      </div>

      <!-- Not found -->
      <div v-else-if="!media" class="text-center py-20 text-gray-400">
        <div class="text-4xl mb-2">😕</div>
        <p>ไม่พบสื่อนี้</p>
      </div>

      <div v-else>
        <!-- Header card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <!-- Cover image — ซ่อนได้เมื่อเป็น embed + show_thumbnail=false -->
          <div v-if="media.thumbnail_url && (media.media_type !== 'embed' || media.show_thumbnail !== false)"
               class="aspect-video overflow-hidden">
            <img :src="media.thumbnail_url" :alt="media.title" class="w-full h-full object-cover" />
          </div>
          <div class="p-6">
            <!-- Type + Category badges -->
            <div class="flex items-center gap-2 mb-3">
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', typeBadgeStyle]">
                {{ typeIcon }} {{ typeLabel }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {{ media.category }}
              </span>
              <span v-if="media.is_featured" class="text-yellow-500 text-sm">⭐ แนะนำ</span>
            </div>
            <!-- Title -->
            <h1 class="text-xl font-bold text-gray-900 mb-2">{{ media.title }}</h1>
            <p v-if="media.description" class="text-gray-600 text-sm leading-relaxed mb-4">{{ media.description }}</p>
            <!-- Meta row: author / subject / views -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 border-t border-gray-100 pt-3 mt-1">
              <span v-if="media.subject_area" class="flex items-center gap-1">
                <span class="text-purple-500">📚</span>
                <span class="font-medium text-purple-700">{{ media.subject_area }}</span>
              </span>
              <span v-if="media.grade_level" class="flex items-center gap-1">
                <span class="text-green-500">🎓</span>
                <span class="font-medium text-green-700">{{ media.grade_level }}</span>
              </span>
              <span v-if="media.author_name" class="flex items-center gap-1">
                <span>👤</span>
                <span>{{ media.author_name }}</span>
              </span>
              <span v-if="media.views" class="flex items-center gap-1 ml-auto">
                <span>👁</span>
                <span>{{ media.views.toLocaleString() }} ครั้ง</span>
              </span>
            </div>
          </div>
        </div>

        <!-- External URL Banner -->
        <div v-if="media.external_url"
          class="mb-4 flex flex-col items-center gap-3 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
          <p class="text-sm text-green-700">สื่อนี้มีลิงก์เนื้อหาภายนอก</p>
          <a :href="media.external_url" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm">
            🔗 เปิดลิงก์ภายนอก
          </a>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <!-- Embed items -->
          <template v-if="media.media_type === 'embed'">
            <div v-for="(item, idx) in embedItems" :key="idx"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <!-- label -->
              <div v-if="item.label" class="px-5 pt-4 pb-2">
                <span class="text-sm font-semibold text-gray-700">{{ item.label }}</span>
              </div>
              <div v-if="item.info?.src" :style="`position:relative; padding-top:${item.info.ratio};`">
                <iframe :src="item.info.src"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                  allowfullscreen allow="autoplay; encrypted-media"
                  loading="lazy"></iframe>
              </div>
              <div v-else-if="item.info?.warning === 'canva_link'" class="p-5 text-sm text-orange-600 bg-orange-50">
                ⚠️ ลิงก์ Canva นี้ไม่สามารถฝัง iframe ได้ กรุณาใช้ Share → Embed เพื่อรับโค้ดที่ถูกต้อง
              </div>
              <div v-else class="p-8 text-center text-gray-400">
                <div class="text-4xl mb-2">⚠️</div>
                <p class="text-sm">ไม่สามารถแสดงเนื้อหาได้</p>
              </div>
            </div>
          </template>
          <!-- Link items -->
          <template v-else-if="media.media_type === 'link'">
            <div v-for="(item, idx) in linkItems" :key="idx"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 text-center">
              <div class="text-5xl mb-4">🌐</div>
              <p v-if="item.label" class="text-gray-700 font-medium mb-1">{{ item.label }}</p>
              <p class="text-gray-500 text-sm mb-5">คลิกปุ่มด้านล่างเพื่อเปิดลิงก์</p>
              <a :href="item.raw" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                🔗 เปิดลิงก์
              </a>
              <p class="mt-3 text-xs text-gray-400 break-all">{{ item.raw }}</p>
            </div>
          </template>
          <!-- Error -->
          <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
            <div class="text-4xl mb-2">⚠️</div>
            <p class="text-sm">ไม่สามารถแสดงเนื้อหาได้</p>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'

const route   = useRoute()
const media   = ref(null)
const loading = ref(true)

function detectEmbedUrl(raw) {
  if (!raw?.trim()) return null
  const input = raw.trim()
  const iframeSrc = input.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  const url = iframeSrc ?? input
  if (/docs\.google\.com\/presentation/i.test(url)) {
    if (/\/e\/[A-Za-z0-9_-]+\/pub/i.test(url)) return { src: url, ratio: '56.25%' }
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { src: `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`, ratio: '56.25%' }
  }
  if (/drive\.google\.com\/file/i.test(url)) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { src: `https://drive.google.com/file/d/${m[1]}/preview`, ratio: '130%' }
  }
  if (/canva\.com/i.test(url)) {
    const s = url.replace(/\/(edit|present)(\/[^?]*)?(\?.*)?$/, '/view').replace(/\/view(\?.*)?$/, '/view?embed')
    return { src: s, ratio: '56.25%' }
  }
  const ytW = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (ytW) return { src: `https://www.youtube.com/embed/${ytW[1]}`, ratio: '56.25%' }
  const ytS = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (ytS) return { src: `https://www.youtube.com/embed/${ytS[1]}`, ratio: '56.25%' }
  return null
}

function parseMediaItems(content) {
  if (!content) return [{ raw: '', label: '' }]
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {}
  return [{ raw: content, label: '' }]
}

const embedItems = computed(() => {
  if (!media.value || media.value.media_type !== 'embed') return []
  return parseMediaItems(media.value.content)
    .filter(i => i.raw?.trim())
    .map(i => ({ ...i, info: detectEmbedUrl(i.raw) }))
})

const linkItems = computed(() => {
  if (!media.value || media.value.media_type !== 'link') return []
  return parseMediaItems(media.value.content).filter(i => i.raw?.trim())
})

function detectTypeKey(m) {
  if (!m) return 'embed'
  if (m.media_type === 'link') return 'link'
  let raw = m.content || ''
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed[0]?.raw) raw = parsed[0].raw
  } catch {}
  const src = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1] || raw
  if (/youtu/.test(src)) return 'youtube'
  if (/docs\.google\.com\/presentation/.test(src)) return 'slides'
  if (/drive\.google\.com/.test(src)) return 'pdf'
  if (/canva\.com/.test(src)) return 'canva'
  return 'embed'
}

const typeKey = computed(() => detectTypeKey(media.value))
const typeIcon = computed(() => ({ youtube:'▶️', slides:'📊', pdf:'📄', canva:'🎨', link:'🌐', embed:'🔗' }[typeKey.value] || '🔗'))
const typeLabel = computed(() => ({ youtube:'YouTube', slides:'Google Slides', pdf:'PDF', canva:'Canva', link:'ลิงก์ภายนอก', embed:'Embed' }[typeKey.value] || 'Embed'))
const typeBadgeStyle = computed(() => ({
  youtube: 'bg-red-100 text-red-700',
  slides:  'bg-green-100 text-green-700',
  pdf:     'bg-orange-100 text-orange-700',
  canva:   'bg-purple-100 text-purple-700',
  link:    'bg-blue-100 text-blue-700',
  embed:   'bg-gray-100 text-gray-700',
}[typeKey.value] || 'bg-gray-100 text-gray-700'))

onMounted(async () => {
  const { data } = await supabase.from('media').select('*').eq('id', route.params.id).eq('is_published', true).maybeSingle()
  media.value = data
  loading.value = false
  // นับ views
  if (data) {
    const { error: viewErr } = await supabase.rpc('increment_media_views', { media_id: data.id })
    if (viewErr) console.error('increment_media_views error:', viewErr)
    else media.value = { ...media.value, views: (media.value?.views || 0) + 1 }
  }
})
</script>
