<template>
  <div class="min-h-screen flex flex-col bg-white">
    <TheNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <TheFooter />
    <ScrollToTop />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import TheNavbar   from '../components/public/TheNavbar.vue'
import TheFooter   from '../components/public/TheFooter.vue'
import ScrollToTop from '../components/public/ScrollToTop.vue'
import { useSchoolConfig } from '../composables/useSchoolConfig'

const { config } = useSchoolConfig()

// ── Dynamic title + favicon จาก config ───────────────────────
watch(config, (c) => {
  if (!c) return
  // Title
  document.title = c.name_th || 'เว็บโรงเรียน'
  // Favicon — ใช้โลโก้โรงเรียนถ้ามี
  if (c.logo_url) {
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = c.logo_url
  }
}, { immediate: true })
</script>
