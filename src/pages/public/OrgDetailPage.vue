<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-4 py-10">

      <!-- Loading -->
      <div v-if="loading" class="animate-pulse space-y-5">
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        <div class="h-8 bg-gray-200 rounded w-2/3"></div>
        <div class="h-64 bg-gray-200 rounded-2xl"></div>
      </div>

      <!-- Not found -->
      <div v-else-if="!page" class="text-center py-24 text-gray-400">
        <div class="text-6xl mb-4">😔</div>
        <p class="text-lg font-medium">ไม่พบหน้าที่ต้องการ</p>
        <RouterLink to="/" class="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm">← กลับหน้าแรก</RouterLink>
      </div>

      <article v-else>
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <RouterLink to="/" class="hover:text-blue-600 transition-colors">หน้าแรก</RouterLink>
          <span>›</span>
          <span class="text-gray-700">ข้อมูลพื้นฐาน</span>
          <span>›</span>
          <span class="text-gray-900">{{ page.title }}</span>
        </nav>

        <!-- Title Hero -->
        <div class="relative mb-8 rounded-2xl overflow-hidden px-6 py-8 text-center"
          style="background: linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%);">
          <div class="flex flex-wrap items-center justify-center gap-3 mb-3">
            <span class="text-4xl">{{ page.icon || '📄' }}</span>
          </div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-800 leading-snug">{{ page.title }}</h1>
        </div>

        <!-- Content: HTML -->
        <div v-if="page.content_type === 'html' && page.content"
          class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-10">
          <iframe
            ref="iframeRef"
            :srcdoc="htmlSrc"
            class="w-full border-0 block transition-all duration-300"
            style="min-height:200px; height:200px;"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
            scrolling="no"
            @load="onIframeLoad"
          ></iframe>
        </div>

        <!-- Content: Embed (single URL) -->
        <div v-else-if="page.content_type === 'embed' && embedInfo"
          class="rounded-2xl border border-gray-200 shadow-md overflow-hidden mb-10 bg-white">
          <div v-if="embedInfo.src" :style="`position:relative; padding-top:${embedInfo.ratio};`">
            <iframe :src="embedInfo.src"
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
              allowfullscreen allow="autoplay; encrypted-media" loading="lazy"></iframe>
          </div>
          <div v-else class="p-8 text-center text-gray-400">
            <div class="text-4xl mb-2">⚠️</div>
            <p class="text-sm">ไม่สามารถแสดงเนื้อหาได้</p>
          </div>
        </div>

        <!-- Content: Link -->
        <div v-else-if="page.content_type === 'link' && page.content"
          class="mb-10 p-8 bg-white border border-gray-200 rounded-2xl text-center shadow-sm">
          <div class="text-5xl mb-4">🔗</div>
          <p class="text-gray-500 text-sm mb-5">คลิกปุ่มด้านล่างเพื่อเปิดเนื้อหา</p>
          <a :href="page.content" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
            เปิดลิงก์ →
          </a>
        </div>

        <!-- Content: Plain text -->
        <div v-else-if="page.content_type === 'text' && page.content"
          class="text-gray-700 leading-relaxed whitespace-pre-wrap text-base mb-10">
          {{ page.content }}
        </div>

        <!-- Empty -->
        <div v-else class="text-center py-16 text-gray-400 mb-10">
          <div class="text-5xl mb-3">📄</div>
          <p>ยังไม่มีเนื้อหา</p>
        </div>

        <!-- Nav between pages -->
        <div v-if="siblingPages.length > 1" class="border-t border-gray-100 pt-6">
          <p class="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">หน้าอื่นในข้อมูลพื้นฐาน</p>
          <div class="flex flex-wrap gap-2">
            <RouterLink v-for="p in siblingPages" :key="p.slug" :to="`/about/${p.slug}`"
              :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all',
                p.slug === page.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700']">
              {{ p.icon }} {{ p.title }}
            </RouterLink>
          </div>
        </div>
      </article>
    </div>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase } from '../../lib/supabase'

const route    = useRoute()
const page     = ref(null)
const loading  = ref(true)
const siblingPages = ref([])
const iframeRef = ref(null)

function detectEmbed(url) {
  if (!url?.trim()) return null
  const iframeSrc = url.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  const u = iframeSrc ?? url.trim()
  if (/docs\.google\.com\/presentation/i.test(u)) {
    const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { src: `https://docs.google.com/presentation/d/${m[1]}/embed`, ratio: '56.25%' }
  }
  if (/drive\.google\.com\/file/i.test(u)) {
    const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { src: `https://drive.google.com/file/d/${m[1]}/preview`, ratio: '130%' }
  }
  if (/canva\.com/i.test(u)) {
    const src = u.replace(/\/(edit|present)(\/[^?]*)?(\?.*)?$/, '/view').replace(/\/view(\?.*)?$/, '/view?embed')
    return { src, ratio: '56.25%' }
  }
  const ytW = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (ytW) return { src: `https://www.youtube.com/embed/${ytW[1]}`, ratio: '56.25%' }
  const ytS = u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (ytS) return { src: `https://www.youtube.com/embed/${ytS[1]}`, ratio: '56.25%' }
  return null
}

const embedInfo = computed(() => page.value?.content_type === 'embed' ? detectEmbed(page.value.content) : null)

const RESIZE_SCRIPT = `<script>(function(){var lastH=0;function send(){var h=document.body.offsetHeight;if(!h||h===lastH)return;lastH=h;parent.postMessage({type:'iframeResize',height:h},'*');}send();window.addEventListener('load',send);if(window.ResizeObserver)new ResizeObserver(function(){var h=document.body.offsetHeight;if(h!==lastH)send();}).observe(document.body);else{setTimeout(send,400);setTimeout(send,1200);}document.querySelectorAll('img').forEach(function(i){if(!i.complete)i.addEventListener('load',send);});})()\x3c/script>`

const htmlSrc = computed(() => {
  const c = page.value?.content || ''
  if (!c) return ''
  if (/<!DOCTYPE|<html/i.test(c)) {
    const override = `<style>html,body{height:auto!important;overflow:hidden!important;}img,video{max-width:100%!important;}</style>`
    return c.replace(/<\/head>/i, `${override}</head>`).replace(/<\/body>/i, `${RESIZE_SCRIPT}</body>`) + override + RESIZE_SCRIPT
  }
  return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*,*::before,*::after{box-sizing:border-box;}html,body{margin:0;padding:0;width:100%;height:auto!important;overflow:hidden;}body{font-family:'Sarabun','Noto Sans Thai',sans-serif;font-size:16px;line-height:1.8;color:#374151;padding:24px;}h1,h2,h3,h4{color:#111827;margin:1.2em 0 0.5em;font-weight:700;}p{margin-bottom:1em;}ul,ol{padding-left:1.8em;margin-bottom:1em;}a{color:#2563eb;}img{max-width:100%;height:auto;border-radius:8px;margin:8px 0;display:block;}table{border-collapse:collapse;width:100%;margin-bottom:1em;}th,td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left;}th{background:#f9fafb;font-weight:600;}blockquote{border-left:4px solid #2563eb;padding:.5em 1em;color:#6b7280;margin:1em 0;background:#eff6ff;border-radius:0 8px 8px 0;}</style></head><body>${c}${RESIZE_SCRIPT}</body></html>`
})

function onIframeMessage(e) {
  if (e.data?.type === 'iframeResize' && iframeRef.value) {
    iframeRef.value.style.height = (e.data.height + 32) + 'px'
  }
}
function onIframeLoad() {
  try {
    const body = iframeRef.value?.contentDocument?.body
    if (body) { const h = body.scrollHeight; if (h > 100) iframeRef.value.style.height = (h + 32) + 'px' }
  } catch (_) {}
}

async function loadPage(slug) {
  loading.value = true
  const [{ data: p }, { data: siblings }] = await Promise.all([
    supabase.from('org_pages').select('*').eq('slug', slug).eq('is_published', true).maybeSingle(),
    supabase.from('org_pages').select('slug,title,icon').eq('is_published', true).order('sort_order').order('created_at'),
  ])
  page.value = p
  siblingPages.value = siblings || []
  loading.value = false
  if (p) document.title = p.title
}

watch(() => route.params.slug, slug => { if (slug) loadPage(slug) })
onMounted(() => { window.addEventListener('message', onIframeMessage); loadPage(route.params.slug) })
onUnmounted(() => window.removeEventListener('message', onIframeMessage))
</script>
