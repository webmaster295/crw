<template>
  <div>
    <!-- Trigger: ใช้ slot หรือ default UI -->
    <div @click="openPicker" class="cursor-pointer select-none">
      <slot :url="modelValue" :open="openPicker">
        <!-- Default: สี่เหลี่ยม/วงกลม ตามที่กำหนด -->
        <div :class="['relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-1 group', containerClass || 'w-32 h-32 rounded-2xl']">
          <img v-if="modelValue" :src="modelValue" class="absolute inset-0 w-full h-full object-cover" />
          <div v-if="modelValue" class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <span class="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">เปลี่ยนรูป</span>
          </div>
          <template v-if="!modelValue">
            <span class="text-3xl">{{ icon || '📷' }}</span>
            <span class="text-xs text-gray-400">{{ placeholder || 'อัปโหลดรูป' }}</span>
            <span v-if="hint" class="text-xs text-gray-300 text-center px-2">{{ hint }}</span>
          </template>
        </div>
      </slot>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />

    <!-- ── Crop Modal ── -->
    <Teleport to="body">
      <div v-if="showModal"
        class="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-3"
        @wheel.prevent="onWheel">

        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="px-5 py-3.5 border-b flex items-center justify-between">
            <h3 class="font-bold text-gray-800 text-sm">✂️ ปรับขนาดรูปภาพ</h3>
            <button type="button" @click="cancel" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-lg">×</button>
          </div>

          <!-- Viewport (PNG mode: checkerboard แสดงความโปร่งใส) -->
          <div class="relative select-none overflow-hidden"
            :style="{ height: vpHeight + 'px', background: format === 'png' ? 'repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%) 0 0 / 16px 16px' : '#111827' }"
            ref="vpEl"
            @mousedown.prevent="dragStart"
            @mousemove.prevent="dragMove"
            @mouseup="dragEnd"
            @mouseleave="dragEnd"
            @touchstart.prevent="dragStart"
            @touchmove.prevent="dragMove"
            @touchend="dragEnd">

            <img v-if="imgSrc" ref="imgEl" :src="imgSrc" :style="imgStyle"
              class="absolute pointer-events-none" @load="onImgLoad" draggable="false" />

            <!-- Dark mask outside frame -->
            <div v-if="shape === 'circle'" class="absolute inset-0 pointer-events-none" :style="circleMask" />
            <template v-else>
              <div class="absolute pointer-events-none bg-black/70" :style="{ top: 0, left: 0, right: 0, height: frameTop + 'px' }" />
              <div class="absolute pointer-events-none bg-black/70" :style="{ bottom: 0, left: 0, right: 0, height: frameTop + 'px' }" />
              <div class="absolute pointer-events-none bg-black/70" :style="{ top: frameTop + 'px', left: 0, width: frameLeft + 'px', height: cropH + 'px' }" />
              <div class="absolute pointer-events-none bg-black/70" :style="{ top: frameTop + 'px', right: 0, width: frameLeft + 'px', height: cropH + 'px' }" />
            </template>

            <!-- Frame border -->
            <div class="absolute pointer-events-none border-2 border-white"
              :style="{ left: frameLeft + 'px', top: frameTop + 'px', width: cropW + 'px', height: cropH + 'px', borderRadius: shape === 'circle' ? '50%' : '4px', boxShadow: '0 0 0 1px rgba(0,0,0,0.5)' }" />

            <!-- Corner handles (L-bracket) -->
            <template v-if="shape !== 'circle'">
              <!-- top-left -->
              <div class="absolute pointer-events-none bg-white" :style="{ left: frameLeft + 'px', top: frameTop + 'px', width: '14px', height: '3px' }" />
              <div class="absolute pointer-events-none bg-white" :style="{ left: frameLeft + 'px', top: frameTop + 'px', width: '3px', height: '14px' }" />
              <!-- top-right -->
              <div class="absolute pointer-events-none bg-white" :style="{ left: (frameLeft + cropW - 14) + 'px', top: frameTop + 'px', width: '14px', height: '3px' }" />
              <div class="absolute pointer-events-none bg-white" :style="{ left: (frameLeft + cropW - 3) + 'px', top: frameTop + 'px', width: '3px', height: '14px' }" />
              <!-- bottom-left -->
              <div class="absolute pointer-events-none bg-white" :style="{ left: frameLeft + 'px', top: (frameTop + cropH - 3) + 'px', width: '14px', height: '3px' }" />
              <div class="absolute pointer-events-none bg-white" :style="{ left: frameLeft + 'px', top: (frameTop + cropH - 14) + 'px', width: '3px', height: '14px' }" />
              <!-- bottom-right -->
              <div class="absolute pointer-events-none bg-white" :style="{ left: (frameLeft + cropW - 14) + 'px', top: (frameTop + cropH - 3) + 'px', width: '14px', height: '3px' }" />
              <div class="absolute pointer-events-none bg-white" :style="{ left: (frameLeft + cropW - 3) + 'px', top: (frameTop + cropH - 14) + 'px', width: '3px', height: '14px' }" />
            </template>

            <!-- Rule-of-thirds grid -->
            <div class="absolute pointer-events-none overflow-hidden opacity-30"
              :style="{ left: frameLeft + 'px', top: frameTop + 'px', width: cropW + 'px', height: cropH + 'px', borderRadius: shape === 'circle' ? '50%' : '4px' }">
              <div class="absolute inset-0">
                <div class="absolute bg-white" style="left:33.3%;top:0;width:1px;height:100%"/>
                <div class="absolute bg-white" style="left:66.6%;top:0;width:1px;height:100%"/>
                <div class="absolute bg-white" style="top:33.3%;left:0;height:1px;width:100%"/>
                <div class="absolute bg-white" style="top:66.6%;left:0;height:1px;width:100%"/>
              </div>
            </div>

            <!-- Ratio label -->
            <div class="absolute pointer-events-none px-2 py-0.5 rounded-b text-xs font-semibold text-white bg-black/60"
              :style="{ left: frameLeft + 'px', top: frameTop + 'px' }">
              {{ ratioLabel }}
            </div>
          </div>

          <!-- Zoom -->
          <div class="px-4 py-2.5 flex items-center gap-2 bg-gray-50 border-t">
            <button type="button" @click="zoom = Math.max(minZoom, +(zoom - 0.1).toFixed(2))"
              class="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 flex-shrink-0">−</button>
            <input type="range" v-model.number="zoom" :min="minZoom" max="3" step="0.01"
              class="flex-1 accent-blue-600 h-1.5" />
            <button type="button" @click="zoom = Math.min(3, +(zoom + 0.1).toFixed(2))"
              class="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 flex-shrink-0">+</button>
            <span class="text-xs text-gray-400 w-10 text-right flex-shrink-0">{{ Math.round(zoom * 100) }}%</span>
          </div>

          <!-- Buttons -->
          <div class="px-4 pb-4 pt-3 flex gap-3">
            <button type="button" @click="cancel"
              class="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">ยกเลิก</button>
            <button type="button" @click="confirm" :disabled="uploading"
              class="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1.5">
              <svg v-if="uploading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ uploading ? 'กำลังอัปโหลด...' : '✓ ยืนยัน' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from '../../lib/supabase'

const props = defineProps({
  modelValue:   { type: String, default: '' },
  bucket:       { type: String, default: 'school' },
  storagePath:  { type: String, default: '' },
  shape:        { type: String, default: 'square' }, // 'circle' | 'square'
  aspectRatio:  { type: Number, default: null },
  aspect:       { type: Number, default: null },
  outputWidth:  { type: Number, default: 400 },
  quality:      { type: Number, default: 0.88 },
  format:       { type: String, default: 'jpeg' },   // 'jpeg' | 'png' (png = โปร่งใส)
  // UI
  containerClass: { type: String, default: '' },
  icon:           { type: String, default: '📷' },
  placeholder:    { type: String, default: 'อัปโหลดรูป' },
  hint:           { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'uploaded'])
const format = computed(() => props.format)
const ar = computed(() => props.aspect ?? props.aspectRatio ?? 1)

// ── Viewport / crop frame dimensions ──────────────────────────
const VP_W = 380   // approx modal content width (px)
const MARGIN = 24  // px margin on each side
const cropW = computed(() => Math.min(VP_W - MARGIN * 2, ar.value >= 1 ? 320 : 240))
const cropH = computed(() => Math.round(cropW.value / ar.value))
const vpHeight = computed(() => cropH.value + MARGIN * 2)
const frameLeft = computed(() => (vw.value - cropW.value) / 2)
const frameTop  = computed(() => (vpHeight.value - cropH.value) / 2)

// ── State ──────────────────────────────────────────────────────
const fileInput = ref(null)
const vpEl      = ref(null)
const imgEl     = ref(null)
const showModal = ref(false)
const imgSrc    = ref('')
const uploading = ref(false)
const natW      = ref(0)
const natH      = ref(0)
const zoom      = ref(1)
const minZoom   = ref(0.1)
const ox        = ref(0)
const oy        = ref(0)
const vwState   = ref(VP_W)   // tracked reactively via nextTick

let dragging = false, lastX = 0, lastY = 0

const vw = computed(() => vwState.value)

const ratioLabel = computed(() => {
  const r = ar.value
  if (Math.abs(r - 16/9) < 0.01) return '16 : 9'
  if (Math.abs(r - 4/3) < 0.01) return '4 : 3'
  if (Math.abs(r - 1) < 0.01) return '1 : 1'
  if (Math.abs(r - 3/4) < 0.01) return '3 : 4'
  if (Math.abs(r - 9/16) < 0.01) return '9 : 16'
  if (Math.abs(r - 2/1) < 0.01) return '2 : 1'
  return `${r.toFixed(2)} : 1`
})

const imgStyle = computed(() => ({
  width: natW.value + 'px',
  height: natH.value + 'px',
  maxWidth: 'none',   // override Tailwind preflight: img { max-width: 100% }
  top: '50%', left: '50%',
  transform: `translate(calc(-50% + ${ox.value}px), calc(-50% + ${oy.value}px)) scale(${zoom.value})`,
  transformOrigin: 'center center',
}))

const circleMask = computed(() => {
  const cx = vw.value / 2, cy = vpHeight.value / 2, r = cropW.value / 2
  return { background: `radial-gradient(circle ${r}px at ${cx}px ${cy}px, transparent ${r}px, rgba(0,0,0,0.65) ${r + 0.5}px)` }
})

// ── Image loaded: อ่าน vw จริงแล้ว fit รูป ─────────────────────
function onImgLoad() {
  // อัปเดต viewport width จาก DOM จริง (แก้ปัญหาสัดส่วนเสีย)
  if (vpEl.value) vwState.value = vpEl.value.offsetWidth || VP_W
  natW.value = imgEl.value.naturalWidth
  natH.value = imgEl.value.naturalHeight
  const fill = Math.max(cropW.value / natW.value, cropH.value / natH.value)
  minZoom.value = +(fill * 0.5).toFixed(3)
  zoom.value    = +fill.toFixed(3)
  ox.value = 0; oy.value = 0
}

// ── File input ────────────────────────────────────────────────
function openPicker() { fileInput.value?.click() }
function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async ev => {
    imgSrc.value    = ev.target.result
    showModal.value = true
    // อ่านขนาด viewport หลัง DOM render
    await nextTick()
    if (vpEl.value) vwState.value = vpEl.value.offsetWidth || VP_W
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

// ── Drag ──────────────────────────────────────────────────────
const pt = e => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }
function dragStart(e) { dragging = true; const p = pt(e); lastX = p.x; lastY = p.y }
function dragMove(e) {
  if (!dragging) return
  const p = pt(e)
  ox.value += p.x - lastX; oy.value += p.y - lastY
  lastX = p.x; lastY = p.y
}
function dragEnd() { dragging = false }
function onWheel(e) { zoom.value = Math.min(3, Math.max(minZoom.value, zoom.value - e.deltaY * 0.001)) }

// ── Confirm: crop → upload ─────────────────────────────────────
async function confirm() {
  uploading.value = true
  try {
    const blob = await cropToBlob()
    const url  = await uploadBlob(blob)
    emit('update:modelValue', url)
    emit('uploaded', url)
    showModal.value = false
    imgSrc.value    = ''   // reset เพื่อให้ modal ครั้งหน้าเริ่มใหม่
  } catch (err) {
    alert('อัปโหลดไม่สำเร็จ: ' + err.message)
  } finally {
    uploading.value = false
  }
}

function cropToBlob() {
  return new Promise((resolve, reject) => {
    const outW = props.outputWidth
    const outH = Math.round(outW / ar.value)
    const canvas = Object.assign(document.createElement('canvas'), { width: outW, height: outH })
    const ctx = canvas.getContext('2d')

    if (props.shape === 'circle') {
      ctx.beginPath(); ctx.arc(outW / 2, outH / 2, outW / 2, 0, Math.PI * 2); ctx.clip()
    }

    // Image rendered position inside viewport
    const imgLeft = vw.value / 2 + ox.value - (natW.value * zoom.value) / 2
    const imgTop  = vpHeight.value / 2 + oy.value - (natH.value * zoom.value) / 2

    // Source rect (image pixels) that maps to crop frame
    const srcX = (frameLeft.value - imgLeft) / zoom.value
    const srcY = (frameTop.value  - imgTop)  / zoom.value
    const srcW = cropW.value / zoom.value
    const srcH = cropH.value / zoom.value

    if (props.format === 'jpeg') {
      // JPEG: เติมพื้นหลังขาวก่อน (JPEG ไม่รองรับ transparency)
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, outW, outH)
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.drawImage(imgEl.value, srcX, srcY, srcW, srcH, 0, 0, outW, outH)

    const mime = props.format === 'png' ? 'image/png' : 'image/jpeg'
    const qual = props.format === 'png' ? undefined : props.quality
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('crop failed')), mime, qual)
  })
}

async function getToken() {
  // ใช้ getSession() เสมอ — auto-refresh token ถ้าหมดอายุ
  try {
    const { data } = await supabase.auth.getSession()
    if (data?.session?.access_token) return data.session.access_token
  } catch (_) {}
  return null
}

async function uploadBlob(blob) {
  const token = await getToken()
  if (!token) throw new Error('ไม่พบ session กรุณา refresh หน้าแล้ว login ใหม่')

  const isPng  = props.format === 'png'
  const ext    = isPng ? 'png' : 'jpg'
  const mime   = isPng ? 'image/png' : 'image/jpeg'
  // ใช้ storagePath ที่กำหนด หรือ auto-generate (แทน .jpg → .png ถ้าจำเป็น)
  const basePath = props.storagePath || `uploads/${Date.now()}.${ext}`
  const path = isPng ? basePath.replace(/\.jpe?g$/i, '.png') : basePath

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${props.bucket}/${path}`, {
    method: 'PUT',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': mime,
      'x-upsert': 'true',
    },
    body: blob,
  })
  if (!res.ok) throw new Error((await res.text()) || String(res.status))
  // เพิ่ม ?t= cache-buster เพื่อให้ browser โหลดรูปใหม่ทุกครั้ง (แม้ path เดิม)
  return `${SUPABASE_URL}/storage/v1/object/public/${props.bucket}/${path}?t=${Date.now()}`
}

function cancel() { showModal.value = false; imgSrc.value = '' }
</script>
