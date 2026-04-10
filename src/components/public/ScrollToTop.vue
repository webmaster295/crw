<template>
  <Transition name="scroll-top">
    <button
      v-if="visible"
      @click="scrollUp"
      aria-label="กลับขึ้นด้านบน"
      class="fixed bottom-6 right-6 z-50 group"
    >
      <!-- วงแหวน pulse (ตอน hover) -->
      <span
        class="absolute inset-0 rounded-full bg-blue-400/30 scale-0 group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"
      />

      <!-- ตัวปุ่มหลัก -->
      <span
        class="relative flex items-center justify-center w-12 h-12 rounded-full
               bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700
               shadow-lg shadow-blue-500/40
               group-hover:shadow-xl group-hover:shadow-blue-500/60
               group-hover:-translate-y-1
               transition-all duration-300"
      >
        <!-- ลูกศรขึ้น -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform duration-300"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>

        <!-- เส้นขอบแสง (shimmer) -->
        <span
          class="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
        />
      </span>

      <!-- tooltip -->
      <span
        class="absolute bottom-full right-0 mb-2 px-2.5 py-1 rounded-lg
               bg-gray-800/90 text-white text-xs whitespace-nowrap
               opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
               transition-all duration-200 pointer-events-none select-none
               shadow-lg backdrop-blur-sm"
      >
        กลับขึ้นด้านบน
      </span>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)
const THRESHOLD = 320   // px ก่อนแสดงปุ่ม

function onScroll() {
  visible.value = window.scrollY > THRESHOLD
}

function scrollUp() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
/* fade + slide-up เข้า-ออก */
.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
