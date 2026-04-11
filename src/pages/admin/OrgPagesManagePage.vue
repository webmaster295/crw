<template>
  <AdminLayout>
    <!-- LIST -->
    <div v-if="!showForm">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">ข้อมูลพื้นฐาน</h2>
          <p class="text-sm text-gray-500 mt-0.5">{{ pages.length }} หน้า · แสดงในเมนู "ข้อมูลพื้นฐาน"</p>
        </div>
        <button @click="openAdd" class="btn-primary flex items-center gap-2">
          <span class="text-lg leading-none">+</span> เพิ่มหน้าใหม่
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div v-if="loading" class="p-10 text-center text-gray-400">
          <div class="text-3xl mb-2 animate-spin">⏳</div>กำลังโหลด...
        </div>
        <div v-else-if="!pages.length" class="p-10 text-center text-gray-400">
          <div class="text-4xl mb-2">📄</div>
          <p>ยังไม่มีหน้าข้อมูล</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <th class="py-3 px-4 w-10">#</th>
              <th class="py-3 px-4 w-10">ไอคอน</th>
              <th class="py-3 px-4">ชื่อหน้า</th>
              <th class="py-3 px-4 hidden md:table-cell w-36">Slug (URL)</th>
              <th class="py-3 px-4 hidden lg:table-cell w-28">ประเภทเนื้อหา</th>
              <th class="py-3 px-4 w-28 text-center">สถานะ</th>
              <th class="py-3 px-4 w-28 text-center">เรียงลำดับ</th>
              <th class="py-3 px-4 w-20 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in pages" :key="item.id"
              class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td class="py-2 px-4 text-gray-400 text-xs">{{ item.sort_order }}</td>
              <td class="py-2 px-4 text-2xl">{{ item.icon || '📄' }}</td>
              <td class="py-2 px-4 font-medium text-gray-900">{{ item.title }}</td>
              <td class="py-2 px-4 hidden md:table-cell">
                <code class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">/about/{{ item.slug }}</code>
              </td>
              <td class="py-2 px-4 hidden lg:table-cell">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', typeStyle(item.content_type).cls]">
                  {{ typeStyle(item.content_type).label }}
                </span>
              </td>
              <td class="py-2 px-4 text-center">
                <button @click="togglePublish(item)"
                  :class="['px-3 py-1 rounded-full text-xs font-semibold transition-all',
                    item.is_published ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600']">
                  {{ item.is_published ? '✅ แสดง' : '📝 ซ่อน' }}
                </button>
              </td>
              <td class="py-2 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="moveUp(idx)" :disabled="idx === 0"
                    class="p-1 rounded text-gray-300 hover:text-blue-500 disabled:opacity-20">▲</button>
                  <button @click="moveDown(idx)" :disabled="idx === pages.length - 1"
                    class="p-1 rounded text-gray-300 hover:text-blue-500 disabled:opacity-20">▼</button>
                </div>
              </td>
              <td class="py-2 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="แก้ไข">✏️</button>
                  <button @click="deletePage(item)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FORM -->
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <button @click="showForm = false" class="p-2 rounded-xl hover:bg-gray-100 text-gray-500">←</button>
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ editId ? 'แก้ไขหน้า' : 'เพิ่มหน้าใหม่' }}</h2>
          <p class="text-sm text-gray-500">ข้อมูลพื้นฐาน</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form fields -->
        <div class="lg:col-span-2 space-y-5 bg-white rounded-2xl shadow-sm p-6">
          <!-- Title + Icon -->
          <div class="grid grid-cols-3 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อหน้า <span class="text-red-500">*</span></label>
              <input v-model="form.title" @input="autoSlug" type="text" placeholder="เช่น ประวัติหน่วยงาน, วิสัยทัศน์..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">ไอคอน</label>
              <div class="flex gap-1.5 flex-wrap">
                <button v-for="e in emojiOptions" :key="e" @click="form.icon = e"
                  :class="['w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all',
                    form.icon === e ? 'border-blue-500 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300']">
                  {{ e }}
                </button>
              </div>
            </div>
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL)</label>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400 flex-shrink-0">/about/</span>
              <input v-model="form.slug" type="text" placeholder="history, vision, basic-info..."
                class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
            <p class="text-xs text-gray-400 mt-1">ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข และ - เท่านั้น</p>
          </div>

          <!-- Content Type -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">ประเภทเนื้อหา</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="t in contentTypes" :key="t.value" @click="form.content_type = t.value"
                :class="['px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                  form.content_type === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']">
                {{ t.icon }} {{ t.label }}
              </button>
            </div>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">เนื้อหา</label>

            <!-- HTML -->
            <textarea v-if="form.content_type === 'html'" v-model="form.content" rows="16"
              placeholder="วางโค้ด HTML หรือข้อความที่นี่..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y" />

            <!-- Embed URL -->
            <div v-else-if="form.content_type === 'embed'">
              <input v-model="form.content" type="url"
                placeholder="วาง URL หรือ embed code: Google Drive, Canva, YouTube, Slides..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p class="text-xs text-gray-400 mt-1">รองรับ: Google Drive PDF · Google Slides · Canva · YouTube</p>
            </div>

            <!-- Link -->
            <div v-else-if="form.content_type === 'link'">
              <input v-model="form.content" type="url" placeholder="https://..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p class="text-xs text-gray-400 mt-1">จะแสดงปุ่มเปิดลิงก์ในหน้า</p>
            </div>

            <!-- Plain Text -->
            <textarea v-else v-model="form.content" rows="10"
              placeholder="พิมพ์ข้อความที่นี่..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Publish -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center gap-3 mb-3">
              <button @click="form.is_published = !form.is_published"
                :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  form.is_published ? 'bg-green-500' : 'bg-gray-300']">
                <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                  form.is_published ? 'translate-x-6' : 'translate-x-1']"></span>
              </button>
              <span class="text-sm font-medium text-gray-700">{{ form.is_published ? 'แสดงในเมนู' : 'ซ่อน' }}</span>
            </div>
            <div class="flex items-center gap-3 mb-4">
              <button @click="form.show_title = !form.show_title"
                :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  form.show_title ? 'bg-blue-500' : 'bg-gray-300']">
                <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                  form.show_title ? 'translate-x-6' : 'translate-x-1']"></span>
              </button>
              <span class="text-sm font-medium text-gray-700">{{ form.show_title ? 'แสดงชื่อหน้า' : 'ซ่อนชื่อหน้า' }}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">ลำดับที่</label>
              <input v-model.number="form.sort_order" type="number" min="0"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Preview link -->
          <div v-if="editId && form.slug" class="bg-blue-50 rounded-2xl p-4">
            <p class="text-xs text-blue-600 font-medium mb-2">ดูหน้าสาธารณะ</p>
            <a :href="`#/about/${form.slug}`" target="_blank"
              class="text-xs text-blue-700 underline break-all">/about/{{ form.slug }}</a>
          </div>

          <!-- Save -->
          <button @click="savePage" :disabled="saving || !form.title.trim() || !form.slug.trim()"
            class="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ saving ? 'กำลังบันทึก...' : (editId ? '💾 บันทึก' : '✅ เพิ่มหน้า') }}
          </button>
          <button @click="showForm = false"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast" class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-medium">
          {{ toast }}
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { supabase } from '../../lib/supabase'

const pages    = ref([])
const loading  = ref(true)
const showForm = ref(false)
const saving   = ref(false)
const editId   = ref(null)
const toast    = ref('')
let toastTimer = null

const emojiOptions = ['📄', '📜', '📋', '🎯', '🏫', '🌟', '📊', '🗺️', '🎓', '🏆', '📌', '💡']
const contentTypes = [
  { value: 'html',  label: 'HTML',   icon: '📝' },
  { value: 'embed', label: 'Embed',  icon: '🔗' },
  { value: 'link',  label: 'ลิงก์',  icon: '🌐' },
  { value: 'text',  label: 'ข้อความ', icon: '💬' },
]

const form = ref({ title: '', slug: '', icon: '📄', content_type: 'html', content: '', sort_order: 0, is_published: true, show_title: true })

function typeStyle(t) {
  return {
    html:  { label: 'HTML',   cls: 'bg-blue-50 text-blue-700' },
    embed: { label: 'Embed',  cls: 'bg-purple-50 text-purple-700' },
    link:  { label: 'ลิงก์',  cls: 'bg-green-50 text-green-700' },
    text:  { label: 'ข้อความ', cls: 'bg-gray-100 text-gray-600' },
  }[t] || { label: t, cls: 'bg-gray-100 text-gray-600' }
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

function autoSlug() {
  if (editId.value) return
  form.value.slug = form.value.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

async function fetchPages() {
  loading.value = true
  const { data } = await supabase.from('org_pages')
    .select('*').order('sort_order').order('created_at')
  pages.value = data || []
  loading.value = false
}

function openAdd() {
  editId.value = null
  form.value = { title: '', slug: '', icon: '📄', content_type: 'html', content: '', sort_order: pages.value.length, is_published: true, show_title: true }
  showForm.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = { title: item.title, slug: item.slug, icon: item.icon || '📄', content_type: item.content_type || 'html', content: item.content || '', sort_order: item.sort_order ?? 0, is_published: item.is_published ?? true, show_title: item.show_title ?? true }
  showForm.value = true
}

async function savePage() {
  if (!form.value.title.trim() || !form.value.slug.trim()) return
  saving.value = true
  const payload = {
    title: form.value.title.trim(), slug: form.value.slug.trim(),
    icon: form.value.icon, content_type: form.value.content_type,
    content: form.value.content.trim() || null,
    sort_order: form.value.sort_order, is_published: form.value.is_published,
    show_title: form.value.show_title,
  }
  if (editId.value) {
    await supabase.from('org_pages').update(payload).eq('id', editId.value)
    showToast('✅ บันทึกแล้ว')
  } else {
    await supabase.from('org_pages').insert(payload)
    showToast('✅ เพิ่มหน้าแล้ว')
  }
  saving.value = false
  showForm.value = false
  fetchPages()
}

async function togglePublish(item) {
  await supabase.from('org_pages').update({ is_published: !item.is_published }).eq('id', item.id)
  item.is_published = !item.is_published
}

async function deletePage(item) {
  if (!confirm(`ลบหน้า "${item.title}" ใช่หรือไม่?`)) return
  await supabase.from('org_pages').delete().eq('id', item.id)
  pages.value = pages.value.filter(p => p.id !== item.id)
  showToast('🗑️ ลบแล้ว')
}

async function moveUp(idx) {
  if (idx === 0) return
  const a = pages.value[idx], b = pages.value[idx - 1]
  const ao = a.sort_order, bo = b.sort_order
  await Promise.all([
    supabase.from('org_pages').update({ sort_order: bo }).eq('id', a.id),
    supabase.from('org_pages').update({ sort_order: ao }).eq('id', b.id),
  ])
  fetchPages()
}

async function moveDown(idx) {
  if (idx === pages.value.length - 1) return
  const a = pages.value[idx], b = pages.value[idx + 1]
  const ao = a.sort_order, bo = b.sort_order
  await Promise.all([
    supabase.from('org_pages').update({ sort_order: bo }).eq('id', a.id),
    supabase.from('org_pages').update({ sort_order: ao }).eq('id', b.id),
  ])
  fetchPages()
}

fetchPages()
</script>
<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>
