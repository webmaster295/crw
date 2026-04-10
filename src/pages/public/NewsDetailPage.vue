<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-4 py-10">

      <!-- Loading -->
      <div v-if="loading" class="animate-pulse space-y-5">
        <div class="h-6 bg-gray-200 rounded w-1/4"></div>
        <div class="h-10 bg-gray-200 rounded w-3/4"></div>
        <div class="h-72 bg-gray-200 rounded-2xl"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else-if="!news" class="text-center py-24 text-gray-400">
        <div class="text-6xl mb-4">😔</div>
        <p class="text-lg font-medium">ไม่พบข่าวที่ต้องการ</p>
        <RouterLink to="/news" class="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm">← กลับรายการข่าว</RouterLink>
      </div>

      <!-- Article -->
      <article v-else>
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <RouterLink to="/" class="hover:text-blue-600 transition-colors">หน้าแรก</RouterLink>
          <span>›</span>
          <RouterLink to="/news" class="hover:text-blue-600 transition-colors">ข่าวประชาสัมพันธ์</RouterLink>
          <span>›</span>
          <span class="text-gray-700 line-clamp-1">{{ news.title }}</span>
        </nav>

        <!-- Title Hero -->
        <div class="relative mb-8 rounded-2xl overflow-hidden px-6 py-8 text-center"
          style="background: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.07) 50%, transparent 100%), linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%);">
          <!-- subtle dot pattern -->
          <div class="absolute inset-0 opacity-[0.03]"
            style="background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px); background-size: 24px 24px;"></div>

          <!-- Meta badges -->
          <div class="relative flex flex-wrap items-center justify-center gap-2 mb-4">
            <span v-if="news.is_pinned"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
              📌 ปักหมุด
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {{ news.category }}
            </span>
            <span class="text-xs text-gray-400">📅 {{ formatDate(news.published_at) }}</span>
            <span class="text-xs text-gray-400">👁 {{ news.views || 0 }} ครั้ง</span>
          </div>

          <!-- Title -->
          <h1 class="relative text-xl md:text-2xl font-bold text-gray-800 leading-snug max-w-2xl mx-auto">
            {{ news.title }}
          </h1>
        </div>

        <!-- External URL Banner -->
        <div v-if="news.external_url"
          class="mb-8 flex flex-col items-center gap-3 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
          <p class="text-sm text-green-700">ข่าวนี้มีลิงก์เนื้อหาภายนอก</p>
          <a :href="news.external_url" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm">
            🔗 เปิดลิงก์ภายนอก
          </a>
        </div>

        <!-- Cover Image (ซ่อนได้ผ่าน show_cover) -->
        <div v-if="news.cover_image_url && news.show_cover !== false" class="mb-8 rounded-2xl overflow-hidden shadow-sm">
          <img :src="news.cover_image_url" :alt="news.title" class="w-full object-cover max-h-[480px]" />
        </div>

        <!-- Content -->
        <div class="mb-10">
          <!-- HTML content — iframe แยก style สมบูรณ์ รองรับ AI-generated HTML -->
          <div v-if="news.content_type === 'html'" class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <iframe
              ref="iframeRef"
              :srcdoc="htmlSrc"
              class="w-full border-0 block transition-all duration-300"
              style="min-height: 200px; height: 200px;"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
              scrolling="no"
              @load="onIframeLoad"
            ></iframe>
          </div>
          <!-- Embed content — หลายไฟล์เรียงกัน -->
          <div v-else-if="news.content_type === 'embed'" class="space-y-8">
            <div v-if="!embedItems.length" class="text-center py-12 text-gray-400">
              <div class="text-4xl mb-2">🔗</div>
              <p class="text-sm">ไม่มีเนื้อหา</p>
            </div>

            <!-- card แต่ละ embed -->
            <div v-for="(item, i) in embedItems" :key="i"
              class="rounded-2xl border border-gray-200 shadow-md overflow-hidden bg-white">

              <!-- header bar — ชื่ออยู่กลาง -->
              <div class="relative flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
                <!-- เลขลำดับซ้าย -->
                <span class="absolute left-4 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">
                  {{ i + 1 }}
                </span>
                <!-- ชื่อตรงกลาง -->
                <span class="text-white font-semibold text-sm text-center px-10 truncate">
                  {{ item.label || (item.info?.label ? item.info.icon + ' ' + item.info.label : '🔗 เนื้อหาฝัง') }}
                </span>
                <!-- icon ขวา -->
                <span v-if="item.info && !item.info.warning"
                  class="absolute right-4 text-white/70 text-xs">
                  {{ item.info.icon }}
                </span>
              </div>

              <!-- canva.link warning -->
              <div v-if="item.info?.warning === 'canva_link'"
                class="px-6 py-8 text-center text-orange-600 bg-orange-50">
                <p class="text-2xl mb-2">⚠️</p>
                <p class="font-semibold text-sm">ไม่สามารถแสดงเนื้อหานี้ได้</p>
                <p class="text-xs text-orange-500 mt-1">canva.link ไม่รองรับการฝัง</p>
              </div>

              <!-- embed iframe -->
              <div v-else-if="item.info?.src"
                class="relative bg-gray-100"
                :style="`padding-top:${item.info.ratio};`">
                <iframe :src="item.info.src"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                  allowfullscreen allow="autoplay; encrypted-media"
                  loading="lazy"></iframe>
              </div>

              <!-- unknown -->
              <div v-else class="text-center py-10 text-gray-400 text-sm bg-gray-50">
                ⚠️ ไม่สามารถแสดงเนื้อหาได้
              </div>
            </div>
          </div>
          <!-- Plain text content -->
          <div v-else class="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{{ news.content }}</div>
        </div>

        <!-- Extra Images -->
        <div v-if="news.extra_images && news.extra_images.length" class="mb-10">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="w-1 h-5 bg-blue-600 rounded-full inline-block"></span>
            ภาพประกอบ
          </h2>
          <div :class="['grid gap-4', news.extra_images.length === 1 ? 'grid-cols-1' : news.extra_images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3']">
            <div v-for="(img, i) in news.extra_images" :key="i" class="group">
              <div class="rounded-xl overflow-hidden shadow-sm bg-gray-100 aspect-[4/3]">
                <img :src="img.url" :alt="img.caption || `ภาพที่ ${i + 1}`"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p v-if="img.caption" class="text-xs text-gray-500 text-center mt-2">{{ img.caption }}</p>
            </div>
          </div>
        </div>

        <!-- Links -->
        <div v-if="news.links && news.links.length" class="mb-10">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="w-1 h-5 bg-blue-600 rounded-full inline-block"></span>
            ลิงก์ที่เกี่ยวข้อง
          </h2>
          <div class="space-y-2">
            <a v-for="(link, i) in news.links" :key="i"
              :href="link.url" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 text-sm font-medium transition-colors group">
              <span class="text-lg flex-shrink-0">🔗</span>
              <span class="flex-1">{{ link.label || link.url }}</span>
              <span class="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100 pt-6 flex items-center justify-between">
          <RouterLink to="/news"
            class="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
            ← กลับรายการข่าว
          </RouterLink>
          <button @click="copyLink"
            class="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-blue-50">
            🔗 คัดลอกลิงก์
          </button>
        </div>
      </article>

    </div>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast"
          class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-medium">
          {{ toast }}
        </div>
      </Transition>
    </Teleport>
  </PublicLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from '../../lib/supabase'

const route     = useRoute()
const news      = ref(null)
const loading   = ref(true)
const toast     = ref('')
const iframeRef = ref(null)

// ============================================================
// Embed URL detector (ใช้ร่วมกับ Admin)
// ============================================================
function detectEmbedUrl(raw) {
  if (!raw?.trim()) return null
  const input = raw.trim()

  // ถ้าเป็น <iframe> embed code → ดึง src ออกมา
  const iframeSrc = input.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  const url = iframeSrc ?? input

  // Google Slides
  if (/docs\.google\.com\/presentation/i.test(url)) {
    if (/\/e\/[A-Za-z0-9_-]+\/pub/i.test(url)) return { src: url, ratio: '56.25%' }
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { src: `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`, ratio: '56.25%' }
  }

  // Google Drive file (PDF)
  if (/drive\.google\.com\/file/i.test(url)) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { src: `https://drive.google.com/file/d/${m[1]}/preview`, ratio: '130%' }
  }

  // Canva — รองรับ canva.com และ canva.link
  if (/canva\.(com|link)/i.test(url)) {
    if (/canva\.link/i.test(url)) {
      return { src: '', ratio: '56.25%', warning: 'canva_link' }
    }
    const canvaSrc = url.replace(/\/(edit|present)(\/[^?]*)?(\?.*)?$/, '/view').replace(/\/view(\?.*)?$/, '/view?embed')
    return { src: canvaSrc, ratio: '56.25%' }
  }

  // YouTube
  const ytW = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (ytW) return { src: `https://www.youtube.com/embed/${ytW[1]}`, ratio: '56.25%' }
  const ytS = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (ytS) return { src: `https://www.youtube.com/embed/${ytS[1]}`, ratio: '56.25%' }

  return null
}

// parse content เป็น array — backward compat: ถ้าไม่ใช่ JSON array → single item
function parseEmbedItems(content) {
  if (!content?.trim()) return []
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return [{ raw: content, label: '' }]  // old single-item format
}

const embedItems = computed(() => {
  if (news.value?.content_type !== 'embed') return []
  return parseEmbedItems(news.value.content).map(item => ({
    ...item,
    info: detectEmbedUrl(item.raw)
  }))
})

// Script inject เข้า iframe — ส่งความสูง content จริงผ่าน postMessage
// ใช้ offsetHeight + lastH guard ป้องกันวนลูปไม่จบ
const RESIZE_SCRIPT = `
<script>
(function(){
  var lastH = 0;
  function sendH(){
    var h = document.body.offsetHeight;
    if(!h || h === lastH) return;   // ไม่เปลี่ยน → ไม่ส่ง
    lastH = h;
    parent.postMessage({ type:'iframeResize', height: h }, '*');
  }
  sendH();
  window.addEventListener('load', sendH);
  if(window.ResizeObserver){
    new ResizeObserver(function(){
      // ตรวจเฉพาะกรณี content จริงเปลี่ยน ไม่ใช่ iframe container ที่ถูกขยายจากนอก
      var h = document.body.offsetHeight;
      if(h !== lastH) sendH();
    }).observe(document.body);
  } else {
    setTimeout(sendH, 400);
    setTimeout(sendH, 1200);
  }
  document.querySelectorAll('img').forEach(function(img){
    if(!img.complete) img.addEventListener('load', sendH);
  });
})();
<\/script>`

// สร้าง srcdoc โดยแยกสไตล์ไว้ใน iframe ทั้งหมด ไม่กระทบ parent
const htmlSrc = computed(() => {
  const c = news.value?.content || ''

  // content ที่มี full HTML page → inject style override + script ก่อน </body>
  if (/<!DOCTYPE|<html/i.test(c)) {
    const override = `<style>html,body{height:auto!important;overflow:hidden!important;}img,video,iframe,embed{max-width:100%!important;}</style>`
    const withStyle = c.replace(/<\/head>/i, `${override}</head>`)
    const withScript = withStyle.replace(/<\/body>/i, `${RESIZE_SCRIPT}</body>`)
    // fallback ถ้าไม่มี tag พวกนั้น
    if (withScript !== withStyle) return withScript
    if (withStyle !== c) return withStyle + RESIZE_SCRIPT
    return c + override + RESIZE_SCRIPT
  }

  // HTML fragment → wrap ด้วย base styles + inject script
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 100%; height: auto !important; overflow: hidden; }
  body {
    font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
    font-size: 16px; line-height: 1.8; color: #374151;
    padding: 24px;
  }
  h1,h2,h3,h4,h5,h6 { color: #111827; margin: 1.2em 0 0.5em; font-weight: 700; line-height: 1.3; }
  h1 { font-size: 1.8em; } h2 { font-size: 1.4em; } h3 { font-size: 1.2em; }
  p  { margin-bottom: 1em; }
  ul,ol { padding-left: 1.8em; margin-bottom: 1em; }
  li { margin-bottom: 0.3em; }
  a  { color: #2563eb; text-decoration: underline; }
  img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: block; }
  figure { margin: 1em 0; } figcaption { font-size: 0.85em; color: #6b7280; text-align: center; margin-top: 4px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 1em; overflow-x: auto; display: block; }
  th,td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
  th { background: #f9fafb; font-weight: 600; }
  blockquote { border-left: 4px solid #2563eb; padding: 0.5em 1em; color: #6b7280; margin: 1em 0; background: #eff6ff; border-radius: 0 8px 8px 0; }
  code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
  iframe, video, embed { max-width: 100%; }
</style>
</head>
<body>${c}
${RESIZE_SCRIPT}
</body>
</html>`
})

// รับ postMessage จาก iframe → ปรับความสูง
function onIframeMessage(e) {
  if (e.data?.type === 'iframeResize' && iframeRef.value) {
    iframeRef.value.style.height = (e.data.height + 32) + 'px'
  }
}

function onIframeLoad() {
  // fallback: ถ้า postMessage ไม่ทำงาน (cross-origin strict) → อ่าน scrollHeight ตรงๆ
  try {
    const body = iframeRef.value?.contentDocument?.body
    if (body) {
      const h = body.scrollHeight
      if (h > 100) iframeRef.value.style.height = (h + 32) + 'px'
    }
  } catch (_) {}
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

async function incrementViews(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_news_views`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ news_id: id })
  }).catch(() => {})
}

let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => showToast('✅ คัดลอกลิงก์แล้ว'))
}

onMounted(async () => {
  window.addEventListener('message', onIframeMessage)

  const { data } = await supabase.from('news')
    .select('*')
    .eq('id', route.params.id)
    .eq('is_published', true)
    .maybeSingle()
  news.value = data
  loading.value = false

  if (data) {
    document.title = data.title
    incrementViews(data.id)
  }
})

onUnmounted(() => {
  window.removeEventListener('message', onIframeMessage)
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>
