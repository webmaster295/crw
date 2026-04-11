<template>
  <footer class="bg-gray-900 text-gray-300">
    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        <!-- Col 1: School Info -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <img v-if="config?.logo_url" :src="config.logo_url"
              class="w-14 h-14 object-contain rounded-full bg-white p-1 flex-shrink-0" />
            <div v-else class="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span class="text-white text-2xl font-bold">ร</span>
            </div>
            <div>
              <h3 class="text-white font-bold text-lg leading-tight">{{ config?.name_th || 'โรงเรียน' }}</h3>
              <p class="text-xs text-gray-400">{{ config?.name_en || '' }}</p>
            </div>
          </div>

          <p v-if="config?.motto" class="text-sm italic text-blue-300 mb-3">"{{ config.motto }}"</p>
          <p class="text-sm leading-relaxed text-gray-400 mb-4">{{ config?.address || '' }}</p>

          <div class="space-y-2 text-sm">
            <div v-if="config?.phone" class="flex items-center gap-2">
              <span class="text-blue-400">📞</span> {{ config.phone }}
            </div>
            <div v-if="config?.fax" class="flex items-center gap-2">
              <span class="text-blue-400">📠</span> โทรสาร: {{ config.fax }}
            </div>
            <div v-if="config?.email" class="flex items-center gap-2">
              <span class="text-blue-400">✉️</span>
              <a :href="`mailto:${config.email}`" class="hover:text-blue-400 transition-colors">{{ config.email }}</a>
            </div>
            <div v-if="config?.website" class="flex items-center gap-2">
              <span class="text-blue-400">🌐</span>
              <a :href="config.website" target="_blank" class="hover:text-blue-400 transition-colors">{{ config.website }}</a>
            </div>
          </div>

          <!-- Social Media Icons -->
          <div v-if="socialLinks.length" class="flex gap-3 mt-5 flex-wrap">
            <a
              v-for="s in socialLinks"
              :key="s.key"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :title="s.label"
              :class="['w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-110', s.bg]"
            >
              <svg v-if="s.key === 'facebook'" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <svg v-else-if="s.key === 'line'" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <svg v-else-if="s.key === 'youtube'" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <svg v-else-if="s.key === 'tiktok'" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">ลิงก์ด่วน</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="link in quickLinks" :key="link.to">
              <RouterLink :to="link.to" class="hover:text-blue-400 transition-colors flex items-center gap-2">
                <span class="text-blue-500">›</span> {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: External Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">หน่วยงานที่เกี่ยวข้อง</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="link in agencies" :key="link.label">
              <a :href="link.url" target="_blank" rel="noopener noreferrer"
                class="hover:text-blue-400 transition-colors flex items-center gap-2">
                <span class="text-blue-500">›</span> {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800 py-4 px-4">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <p>© {{ currentYear }} {{ config?.name_th || 'โรงเรียน' }} สงวนลิขสิทธิ์</p>
        <p>พัฒนาโดย ศึกษานิเทศก์ วินัย หนุนกระโทก สพป.นม.2</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useSchoolConfig } from '../../composables/useSchoolConfig'

const { config } = useSchoolConfig()
const currentYear = computed(() => new Date().getFullYear() + 543)

// Social links — แสดงเฉพาะที่ติ๊ก "แสดง" และมี URL
const socialLinks = computed(() => {
  if (!config.value) return []
  const c = config.value
  const links = []
  if (c.show_social_facebook && c.social_facebook)
    links.push({ key: 'facebook', label: 'Facebook', url: c.social_facebook, bg: 'bg-[#1877F2]' })
  if (c.show_social_line && c.social_line)
    links.push({ key: 'line', label: 'Line Official', url: c.social_line.startsWith('http') ? c.social_line : `https://line.me/ti/p/${c.social_line}`, bg: 'bg-[#06C755]' })
  if (c.show_social_youtube && c.social_youtube)
    links.push({ key: 'youtube', label: 'YouTube', url: c.social_youtube, bg: 'bg-[#FF0000]' })
  if (c.show_social_tiktok && c.social_tiktok)
    links.push({ key: 'tiktok', label: 'TikTok', url: c.social_tiktok, bg: 'bg-[#010101]' })
  return links
})

const DEFAULT_QUICK_LINKS = [
  { label: 'หน้าแรก',            to: '/',             visible: true },
  { label: 'ข่าวประชาสัมพันธ์', to: '/news',          visible: true },
  { label: 'ภาพกิจกรรม',        to: '/activities',    visible: true },
  { label: 'คลังสื่อ',           to: '/media',         visible: true },
  { label: 'ปฏิทินวิชาการ',     to: '/calendar',      visible: true },
  { label: 'เอกสาร/ดาวน์โหลด', to: '/documents',     visible: true },
  { label: 'ข้อมูลนักเรียน',    to: '/students-info', visible: true },
  { label: 'เข้าสู่ระบบ',       to: '/login',         visible: true },
  { label: 'ลงทะเบียน',         to: '/register',      visible: false },
]

const DEFAULT_AGENCIES = [
  { label: 'สพฐ. (OBEC)', url: 'https://www.obec.go.th' },
  { label: 'ระบบ DMC',    url: 'https://portal.bopp-obec.info/obec65' },
  { label: 'OBECIT',      url: 'https://www.obecit.obec.go.th' },
  { label: 'คุรุสภา',     url: 'https://www.ksp.or.th' },
  { label: 'e-Budget',    url: 'https://ebudget.obec.go.th' },
]

const quickLinks = computed(() => {
  const saved = config.value?.footer_quick_links
  const list = Array.isArray(saved) && saved.length ? saved : DEFAULT_QUICK_LINKS
  return list.filter(l => l.visible !== false)
})

const agencies = computed(() => {
  const saved = config.value?.footer_agencies
  return Array.isArray(saved) && saved.length ? saved : DEFAULT_AGENCIES
})
</script>
