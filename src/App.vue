<template>
  <RouterView />
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { useSchoolConfig } from './composables/useSchoolConfig'

const { config, fetchConfig } = useSchoolConfig()

function applyTheme(c) {
  if (!c) return
  const html = document.documentElement
  html.removeAttribute('data-theme')

  // ธีมไว้ทุกข์มีความสำคัญสูงสุด
  if (c.mourning_until) {
    const until = new Date(c.mourning_until)
    until.setHours(23, 59, 59)
    if (until >= new Date()) {
      html.setAttribute('data-theme', 'mono')
      return
    }
  }
  // ธีมสี
  if (c.theme && c.theme !== 'blue') {
    html.setAttribute('data-theme', c.theme)
  }
}

watch(config, applyTheme, { immediate: true })

onMounted(async () => {
  await fetchConfig()
})
</script>
