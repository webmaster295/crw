<template>
  <Transition name="slide-down">
    <div v-if="visible" :class="['relative overflow-hidden py-2 px-4 flex items-center gap-3', bgCls]">

      <!-- Icon -->
      <span class="text-base flex-shrink-0">{{ icon }}</span>

      <!-- Marquee — วิ่งจากขวานอกจอไปซ้ายนอกจอ วนลูป -->
      <div class="flex-1 overflow-hidden relative h-5"
        :style="{ '--marquee-speed': speed + 's' }">
        <span :class="['absolute whitespace-nowrap text-sm font-medium animate-marquee', textCls]">
          {{ text }}
        </span>
      </div>

      <!-- Optional link -->
      <a v-if="config?.announcement_link"
        :href="config.announcement_link" target="_blank" rel="noopener noreferrer"
        :class="['flex-shrink-0 text-xs font-bold underline underline-offset-2 hover:opacity-80 transition-opacity', textCls]">
        อ่านเพิ่มเติม →
      </a>

      <!-- Close -->
      <button @click="visible = false"
        :class="['flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity', textCls]"
        aria-label="ปิด">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSchoolConfig } from '../../composables/useSchoolConfig'

const { config } = useSchoolConfig()
const visible = ref(false)

const TYPE_MAP = {
  info:    { bg: 'bg-blue-600',  text: 'text-white'      },
  warning: { bg: 'bg-amber-400', text: 'text-amber-900'  },
  success: { bg: 'bg-green-600', text: 'text-white'      },
  danger:  { bg: 'bg-red-600',   text: 'text-white'      },
}
const TYPE_ICON = { info: '📢', warning: '⚠️', success: '✅', danger: '🚨' }

const bgCls = computed(() => TYPE_MAP[config.value?.announcement_type]?.bg   || 'bg-blue-600')
const textCls = computed(() => TYPE_MAP[config.value?.announcement_type]?.text || 'text-white')
const icon  = computed(() => TYPE_ICON[config.value?.announcement_type] || '📢')
const text  = computed(() => config.value?.announcement_text || '')
const speed = computed(() => config.value?.announcement_speed ?? 18)

watch(config, (c) => {
  visible.value = !!(c?.announcement_enabled && c?.announcement_text?.trim())
}, { immediate: true })
</script>

<style scoped>
.slide-down-enter-active { transition: all 0.3s ease; }
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }

/* วิ่งจากขวานอกจอ → ซ้ายนอกจอ แล้วเริ่มใหม่ */
@keyframes marquee {
  0%   { transform: translateX(100vw); }
  100% { transform: translateX(-100%); }
}

.animate-marquee {
  display: inline-block;
  animation: marquee var(--marquee-speed, 18s) linear infinite;
}
</style>
