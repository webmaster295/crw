<template>
  <AdminLayout>
    <!-- ===== LIST VIEW ===== -->
    <div v-if="!showForm">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">จัดการภาพกิจกรรม</h2>
          <p class="text-sm text-gray-500 mt-0.5">ทั้งหมด {{ albums.length }} อัลบั้ม</p>
        </div>
        <button @click="openAdd" class="btn-primary flex items-center gap-2">
          <span class="text-lg leading-none">+</span> เพิ่มอัลบั้ม
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่ออัลบั้ม..."
            class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select v-model="filterStatus" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">ทุกสถานะ</option>
          <option value="published">เผยแพร่</option>
          <option value="draft">ร่าง</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div v-if="loading" class="p-10 text-center text-gray-400">
          <div class="text-3xl mb-2 animate-spin">⏳</div>กำลังโหลด...
        </div>
        <div v-else-if="!filteredAlbums.length" class="p-10 text-center text-gray-400">
          <div class="text-4xl mb-2">📁</div><p>ไม่พบอัลบั้ม</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <th class="py-3 px-4 w-12">ไอคอน</th>
              <th class="py-3 px-4">ชื่อกิจกรรม</th>
              <th class="py-3 px-4 hidden md:table-cell w-32">ประเภทลิงค์</th>
              <th class="py-3 px-4 hidden lg:table-cell w-32">วันที่กิจกรรม</th>
              <th class="py-3 px-4 hidden lg:table-cell w-16 text-center">วิว</th>
              <th class="py-3 px-4 w-28 text-center">สถานะ</th>
              <th class="py-3 px-4 w-20 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredAlbums" :key="item.id"
              class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <!-- Icon -->
              <td class="py-2 px-4">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-xl', folderBgClass(item)]">
                  {{ item.cover_emoji || '📁' }}
                </div>
              </td>
              <!-- Title + link -->
              <td class="py-2 px-4 max-w-[200px]">
                <p class="font-medium text-gray-900 line-clamp-1">{{ item.title }}</p>
                <a v-if="item.link_url" :href="item.link_url" target="_blank" rel="noopener noreferrer"
                  class="text-xs text-blue-500 hover:underline truncate block max-w-[180px]">
                  {{ item.link_url }}
                </a>
                <span v-else class="text-xs text-gray-400">ยังไม่มีลิงค์</span>
              </td>
              <!-- Link type -->
              <td class="py-2 px-4 hidden md:table-cell">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', linkTypeBadge(item).cls]">
                  {{ linkTypeBadge(item).label }}
                </span>
              </td>
              <!-- Date -->
              <td class="py-2 px-4 hidden lg:table-cell text-gray-500 text-xs">
                {{ item.activity_date ? formatDate(item.activity_date) : '—' }}
              </td>
              <!-- Views -->
              <td class="py-2 px-4 hidden lg:table-cell text-center text-gray-500 text-xs">
                {{ (item.views || 0).toLocaleString() }}
              </td>
              <!-- Status toggle -->
              <td class="py-2 px-4 text-center">
                <button @click="togglePublish(item)"
                  :class="['px-3 py-1 rounded-full text-xs font-semibold transition-all',
                    item.is_published ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600']">
                  {{ item.is_published ? '✅ เผยแพร่' : '📝 ร่าง' }}
                </button>
              </td>
              <!-- Actions -->
              <td class="py-2 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)"
                    class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="แก้ไข">
                    ✏️
                  </button>
                  <button @click="deleteAlbum(item)"
                    class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="ลบ">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== FORM VIEW ===== -->
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <button @click="showForm = false" class="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">←</button>
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ editId ? 'แก้ไขอัลบั้ม' : 'เพิ่มอัลบั้มใหม่' }}</h2>
          <p class="text-sm text-gray-500">ภาพกิจกรรม</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
        <!-- Preview folder card -->
        <div class="mb-6 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-sm', folderBgClassByIdx(0)]">
            {{ form.cover_emoji || '📁' }}
          </div>
          <div>
            <p class="font-semibold text-gray-900">{{ form.title || 'ชื่อกิจกรรม' }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ linkTypeBadgeByUrl(form.link_url).label }}</p>
            <p class="text-xs text-gray-400">👁 0 ครั้ง</p>
          </div>
        </div>

        <div class="space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อกิจกรรม <span class="text-red-500">*</span></label>
            <input v-model="form.title" type="text" placeholder="เช่น วันไหว้ครู 2568, ทัศนศึกษา..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Emoji + Date row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">ไอคอนอัลบั้ม</label>
              <div class="flex gap-2 flex-wrap">
                <button v-for="e in emojiOptions" :key="e" @click="form.cover_emoji = e"
                  :class="['w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all',
                    form.cover_emoji === e ? 'border-blue-500 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300']">
                  {{ e }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">วันที่จัดกิจกรรม</label>
              <input v-model="form.activity_date" type="date"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Link URL -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">ลิงค์อัลบั้มภาพ</label>
            <input v-model="form.link_url" type="url"
              placeholder="https://drive.google.com/... หรือ photos.google.com/... หรือ facebook.com/..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p v-if="form.link_url" class="mt-1.5 text-xs flex items-center gap-1"
              :class="linkTypeBadgeByUrl(form.link_url).textCls">
              {{ linkTypeBadgeByUrl(form.link_url).label }} — ตรวจพบประเภทลิงค์อัตโนมัติ
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">คำอธิบาย (ไม่บังคับ)</label>
            <textarea v-model="form.description" rows="2" placeholder="บรรยายสั้นๆ..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <!-- Published -->
          <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <button @click="form.is_published = !form.is_published"
              :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                form.is_published ? 'bg-green-500' : 'bg-gray-300']">
              <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                form.is_published ? 'translate-x-6' : 'translate-x-1']"></span>
            </button>
            <div>
              <p class="text-sm font-medium text-gray-700">{{ form.is_published ? 'เผยแพร่แล้ว' : 'ร่าง (ไม่แสดงสาธารณะ)' }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button @click="saveAlbum" :disabled="saving || !form.title.trim()"
              class="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ saving ? 'กำลังบันทึก...' : (editId ? '💾 บันทึกการแก้ไข' : '✅ เพิ่มอัลบั้ม') }}
            </button>
            <button @click="showForm = false"
              class="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
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
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { supabase } from '../../lib/supabase'

const albums      = ref([])
const loading     = ref(true)
const showForm    = ref(false)
const saving      = ref(false)
const editId      = ref(null)
const searchQuery = ref('')
const filterStatus = ref('all')
const toast       = ref('')
let toastTimer    = null

const emojiOptions = ['📁', '🖼️', '📸', '🎉', '🎓', '⚽', '🎨', '🌳', '🏫', '🎭', '🎤', '🏆', '🌸', '🎪']

const form = ref({
  title: '',
  cover_emoji: '📁',
  link_url: '',
  description: '',
  activity_date: '',
  is_published: true,
})

// ----- Link type detection -----
function detectLinkType(url) {
  if (!url) return 'none'
  if (/drive\.google\.com/i.test(url))  return 'drive'
  if (/photos\.google\.com/i.test(url)) return 'photos'
  if (/facebook\.com|fb\.com/i.test(url)) return 'facebook'
  if (/flickr\.com/i.test(url))         return 'flickr'
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube'
  return 'link'
}

const LINK_META = {
  drive:    { label: '🗂️ Google Drive',   cls: 'bg-blue-50 text-blue-700',   textCls: 'text-blue-600' },
  photos:   { label: '📷 Google Photos',  cls: 'bg-teal-50 text-teal-700',   textCls: 'text-teal-600' },
  facebook: { label: '📘 Facebook',        cls: 'bg-indigo-50 text-indigo-700', textCls: 'text-indigo-600' },
  flickr:   { label: '📸 Flickr',         cls: 'bg-pink-50 text-pink-700',   textCls: 'text-pink-600' },
  youtube:  { label: '▶️ YouTube',         cls: 'bg-red-50 text-red-700',    textCls: 'text-red-600' },
  link:     { label: '🔗 ลิงค์ภายนอก',    cls: 'bg-gray-100 text-gray-600',  textCls: 'text-gray-500' },
  none:     { label: '— ไม่มีลิงค์',      cls: 'bg-gray-50 text-gray-400',   textCls: 'text-gray-400' },
}

function linkTypeBadge(item)       { return LINK_META[detectLinkType(item.link_url)] }
function linkTypeBadgeByUrl(url)   { return LINK_META[detectLinkType(url)] }

// Folder background colors (rotate by row)
const FOLDER_COLORS = [
  'bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100',
  'bg-pink-100',   'bg-yellow-100', 'bg-teal-100', 'bg-red-100',
]
function folderBgClass(item) {
  const idx = albums.value.findIndex(a => a.id === item.id)
  return FOLDER_COLORS[idx % FOLDER_COLORS.length]
}
function folderBgClassByIdx(idx) { return FOLDER_COLORS[idx % FOLDER_COLORS.length] }

// ----- Filters -----
const filteredAlbums = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return albums.value.filter(a => {
    const matchQ  = !q || a.title.toLowerCase().includes(q)
    const matchS  = filterStatus.value === 'all'
      || (filterStatus.value === 'published' && a.is_published)
      || (filterStatus.value === 'draft' && !a.is_published)
    return matchQ && matchS
  })
})

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

// ----- CRUD -----
async function fetchAlbums() {
  loading.value = true
  const { data } = await supabase.from('activities')
    .select('id,title,cover_emoji,link_url,description,activity_date,is_published,views,created_at')
    .order('activity_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  albums.value = data || []
  loading.value = false
}

function openAdd() {
  editId.value = null
  form.value = { title: '', cover_emoji: '📁', link_url: '', description: '', activity_date: '', is_published: true }
  showForm.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = {
    title: item.title || '',
    cover_emoji: item.cover_emoji || '📁',
    link_url: item.link_url || '',
    description: item.description || '',
    activity_date: item.activity_date || '',
    is_published: item.is_published ?? true,
  }
  showForm.value = true
}

async function saveAlbum() {
  if (!form.value.title.trim()) return
  saving.value = true
  const payload = {
    title: form.value.title.trim(),
    cover_emoji: form.value.cover_emoji || '📁',
    link_url: form.value.link_url.trim() || null,
    description: form.value.description.trim() || null,
    activity_date: form.value.activity_date || null,
    is_published: form.value.is_published,
  }
  if (editId.value) {
    await supabase.from('activities').update(payload).eq('id', editId.value)
    showToast('✅ แก้ไขอัลบั้มแล้ว')
  } else {
    await supabase.from('activities').insert({ ...payload, views: 0 })
    showToast('✅ เพิ่มอัลบั้มแล้ว')
  }
  saving.value = false
  showForm.value = false
  fetchAlbums()
}

async function togglePublish(item) {
  await supabase.from('activities').update({ is_published: !item.is_published }).eq('id', item.id)
  item.is_published = !item.is_published
}

async function deleteAlbum(item) {
  if (!confirm(`ลบอัลบั้ม "${item.title}" ใช่หรือไม่?`)) return
  await supabase.from('activities').delete().eq('id', item.id)
  albums.value = albums.value.filter(a => a.id !== item.id)
  showToast('🗑️ ลบอัลบั้มแล้ว')
}

fetchAlbums()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>
