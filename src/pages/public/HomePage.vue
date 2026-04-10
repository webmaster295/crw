<template>
  <PublicLayout>
    <BannerSlider />

    <template v-for="item in allVisibleItems" :key="item.id">
      <NewsSection         v-if="item.id === 'news'"          v-bind="item" />
      <SystemsGrid         v-else-if="item.id === 'systems'"  v-bind="item" />
      <ActivityGallery     v-else-if="item.id === 'activity'" v-bind="item" />
      <MediaSection        v-else-if="item.id === 'media'"    v-bind="item" />
      <StudentStatsWidget  v-else-if="item.id === 'student_stats'"
        :title="item.title" :subtitle="item.subtitle"
        :variant="item.variant" :stem-color="item.stemColor" :leaf-color="item.leafColor" />
      <CalendarWidget      v-else-if="item.id === 'calendar'"
        :title="item.title" :subtitle="item.subtitle"
        :variant="item.variant" :stem-color="item.stemColor" :leaf-color="item.leafColor" />
    </template>

    <!-- Contact Section -->
    <section id="contact" class="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden text-white">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-white blur-3xl"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 text-center">
        <!-- Header -->
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm text-3xl mb-4 border border-white/20">📞</div>
        <h2 class="text-3xl font-bold mb-2 tracking-tight">ติดต่อโรงเรียน</h2>
        <p class="text-blue-200 text-sm mb-2">ยินดีให้บริการและต้อนรับทุกท่าน</p>
        <div class="flex items-center justify-center gap-2 mb-10">
          <div class="h-px w-16 bg-white/20"></div>
          <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
          <div class="h-px w-16 bg-white/20"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          <div class="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors">
            <div class="text-3xl mb-3">📞</div>
            <h3 class="font-semibold mb-1">โทรศัพท์</h3>
            <p class="text-blue-200 text-sm">{{ config?.phone || '-' }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors">
            <div class="text-3xl mb-3">✉️</div>
            <h3 class="font-semibold mb-1">อีเมล</h3>
            <p class="text-blue-200 text-sm">{{ config?.email || '-' }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors">
            <div class="text-3xl mb-3">📍</div>
            <h3 class="font-semibold mb-1">ที่อยู่</h3>
            <p class="text-blue-200 text-sm">{{ config?.address || '-' }}</p>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'
import BannerSlider from '../../components/public/BannerSlider.vue'
import NewsSection from '../../components/public/NewsSection.vue'
import SystemsGrid from '../../components/public/SystemsGrid.vue'
import ActivityGallery from '../../components/public/ActivityGallery.vue'
import MediaSection from '../../components/public/MediaSection.vue'
import StudentStatsWidget from '../../components/public/StudentStatsWidget.vue'
import CalendarWidget from '../../components/public/CalendarWidget.vue'
import { useSchoolConfig } from '../../composables/useSchoolConfig'

const { config } = useSchoolConfig()

const DEFAULT_WIDGETS = {
  student_stats: { enabled: true, order: 5, title: 'ข้อมูลนักเรียน', subtitle: 'สถิตินักเรียนปีการศึกษาล่าสุด', variant: 'circuit', stemColor: '#3b82f6', leafColor: '#93c5fd' },
  calendar:      { enabled: true, order: 6, title: 'ปฏิทินวิชาการ',  subtitle: 'กิจกรรมและกำหนดการสำคัญของโรงเรียน', variant: 'wave', stemColor: '#6366f1', leafColor: '#a5b4fc' },
}

const widgetConfig = reactive({
  student_stats: { ...DEFAULT_WIDGETS.student_stats },
  calendar:      { ...DEFAULT_WIDGETS.calendar },
})

watch(config, (cfg) => {
  if (!cfg?.homepage_widgets) return
  const w = cfg.homepage_widgets
  if (w.student_stats) Object.assign(widgetConfig.student_stats, w.student_stats)
  if (w.calendar)      Object.assign(widgetConfig.calendar,      w.calendar)
}, { immediate: true })

const DEFAULT_SECTIONS = [
  { id: 'news',     order: 1, visible: true, title: 'ข่าวประชาสัมพันธ์',    subtitle: 'ข่าวสารและประกาศจากโรงเรียน',                      icon: '📰', variant: 'circuit', stemColor: '#3b82f6', leafColor: '#93c5fd' },
  { id: 'systems',  order: 2, visible: true, title: 'ระบบงานโรงเรียน',      subtitle: 'เข้าถึงระบบงานต่างๆ ของโรงเรียน',                  icon: '🏫', variant: 'chevron', stemColor: '#fbbf24', leafColor: '#fde68a' },
  { id: 'activity', order: 3, visible: true, title: 'ภาพกิจกรรม',            subtitle: 'บรรยากาศกิจกรรมและความทรงจำของโรงเรียน',           icon: '🖼️', variant: 'diamond', stemColor: '#f97316', leafColor: '#fdba74' },
  { id: 'media',    order: 4, visible: true, title: 'คลังสื่อการเรียนรู้',   subtitle: 'วิดีโอ สื่อนำเสนอ เอกสาร และแหล่งเรียนรู้ออนไลน์', icon: '📚', variant: 'wave',    stemColor: '#6366f1', leafColor: '#a5b4fc' },
]

const allVisibleItems = computed(() => {
  const raw = config.value?.homepage_sections
  const sections = (Array.isArray(raw) && raw.length ? raw : DEFAULT_SECTIONS)
    .filter(s => s.visible !== false)

  const widgets = [
    { id: 'student_stats', ...widgetConfig.student_stats },
    { id: 'calendar',      ...widgetConfig.calendar },
  ].filter(w => w.enabled)

  return [...sections, ...widgets].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
})
</script>
