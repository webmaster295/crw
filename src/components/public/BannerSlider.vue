<template>
  <div class="w-full" ref="bannerRef">
    <!-- Banner Image Area -->
    <div
      class="relative w-full aspect-[16/6] overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 select-none"
      @mouseenter="pause" @mouseleave="resume"
      @pointerdown="onDragStart" @pointerup="onDragEnd" @pointercancel="onDragEnd"
    >
      <!-- Slides -->
      <TransitionGroup name="banner" tag="div" class="relative h-full">
        <div v-for="(banner, i) in slides" :key="i" v-show="current === i" class="absolute inset-0">
          <video v-if="isVideo(banner)"
            :src="banner.url" autoplay loop muted playsinline
            class="w-full h-full object-cover pointer-events-none"
          />
          <img v-else-if="banner.url" :src="banner.url" :alt="banner.caption || ''"
            class="w-full h-full object-cover pointer-events-none"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 flex items-center justify-center">
            <div class="text-center text-white px-8">
              <div class="text-6xl mb-4">🏫</div>
              <h1 class="text-2xl md:text-5xl font-bold mb-3">{{ config?.name_th || 'โรงเรียน' }}</h1>
              <p class="text-base md:text-xl text-blue-200">{{ config?.motto || 'มุ่งสู่ความเป็นเลิศทางการศึกษา' }}</p>
            </div>
          </div>
          <!-- Gradient overlay — desktop เท่านั้น -->
          <div class="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent pointer-events-none"></div>
        </div>
      </TransitionGroup>

      <!-- Caption overlay — desktop/tablet เท่านั้น -->
      <div class="hidden sm:flex absolute bottom-6 left-0 right-0 flex-col items-center text-center px-6 pointer-events-none">
        <template v-if="currentSlide.caption || currentSlide.subcaption">
          <div class="bg-black/10 backdrop-blur-[2px] rounded-xl px-4 py-2 mb-1.5 max-w-2xl">
            <h2 v-if="currentSlide.caption" class="text-sm md:text-lg font-bold text-white drop-shadow leading-snug">
              {{ currentSlide.caption }}
            </h2>
            <p v-if="currentSlide.subcaption" class="text-white/80 text-xs md:text-sm mt-0.5">
              {{ currentSlide.subcaption }}
            </p>
          </div>
          <a v-if="currentSlide.link" :href="currentSlide.link" target="_blank" rel="noopener"
            class="pointer-events-auto inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm text-white border border-white/40 text-xs px-4 py-1.5 rounded-full transition-all duration-200"
            @click.stop
          >
            {{ currentSlide.link_label || 'ดูเพิ่มเติม' }}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </template>
      </div>

      <!-- ปุ่ม Prev / Next — แสดงเฉพาะมีหลายภาพ -->
      <template v-if="slides.length > 1">
        <button @click="prev"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white backdrop-blur-sm transition-all text-2xl leading-none">
          ‹
        </button>
        <button @click="next"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white backdrop-blur-sm transition-all text-2xl leading-none">
          ›
        </button>
        <!-- Dots -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <button v-for="(_, i) in slides" :key="i" @click="current = i"
            :class="['h-1.5 rounded-full transition-all duration-300', current === i ? 'bg-white w-5' : 'bg-white/40 w-1.5']"
          />
        </div>
      </template>
    </div>

    <!-- Caption ใต้รูป — มือถือเท่านั้น -->
    <div v-if="(currentSlide.caption || currentSlide.subcaption) && slides.length > 0 && currentSlide.url"
      class="sm:hidden bg-blue-900 text-white px-4 py-3 text-center">
      <h2 v-if="currentSlide.caption" class="font-bold text-sm leading-snug">{{ currentSlide.caption }}</h2>
      <p v-if="currentSlide.subcaption" class="text-blue-200 text-xs mt-0.5">{{ currentSlide.subcaption }}</p>
      <a v-if="currentSlide.link" :href="currentSlide.link" target="_blank" rel="noopener"
        class="mt-2 inline-flex items-center gap-1.5 bg-white/15 border border-white/30 text-white text-xs px-4 py-1.5 rounded-full"
      >
        {{ currentSlide.link_label || 'ดูเพิ่มเติม' }}
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSchoolConfig } from '../../composables/useSchoolConfig'

const { config } = useSchoolConfig()
const current = ref(0)
const bannerRef = ref(null)
let timer = null
let dragStartX = 0
let observer = null

const slides = computed(() => {
  const banners = config.value?.banner_images || []
  if (!banners.length) return [{}]
  return banners
})

const currentSlide = computed(() => slides.value[current.value] || {})

function isVideo(banner) {
  if (banner.type === 'video') return true
  if (banner.url) return /\.(mp4|webm|ogg)(\?|$)/i.test(banner.url)
  return false
}

function next() { current.value = (current.value + 1) % slides.value.length }
function prev() { current.value = (current.value - 1 + slides.value.length) % slides.value.length }

const autoplay = computed(() => config.value?.banner_autoplay !== false)

function pause() { clearInterval(timer); timer = null }
function resume() { if (autoplay.value && !timer) timer = setInterval(next, 5000) }

function onDragStart(e) { dragStartX = e.clientX }
function onDragEnd(e) {
  const diff = e.clientX - dragStartX
  if (Math.abs(diff) > 50) { diff < 0 ? next() : prev() }
}

function playCurrentVideo() {
  const videos = bannerRef.value?.querySelectorAll('video')
  videos?.forEach(v => v.play().catch(() => {}))
}

onMounted(() => {
  if (autoplay.value) timer = setInterval(next, 5000)
  // Resume video when banner scrolls back into view
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) playCurrentVideo()
  }, { threshold: 0.1 })
  if (bannerRef.value) observer.observe(bannerRef.value)
})
onUnmounted(() => { clearInterval(timer); observer?.disconnect() })
</script>

<style scoped>
.banner-enter-active, .banner-leave-active { transition: opacity 0.8s ease; }
.banner-enter-from, .banner-leave-to { opacity: 0; }
</style>
