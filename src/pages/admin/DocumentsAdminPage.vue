<template>
  <AdminLayout>
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold text-gray-900">จัดการเอกสาร/ดาวน์โหลด</h2>
          <p class="text-xs text-gray-400 mt-0.5">เพิ่มลิงก์เอกสารจาก Google Drive, OneDrive หรือแหล่งอื่น</p>
        </div>
        <button @click="openForm()" class="btn-primary flex items-center gap-2 self-start sm:self-auto">
          + เพิ่มเอกสาร
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex flex-wrap gap-2">
        <button v-for="cat in [{ key: 'all', label: 'ทั้งหมด' }, ...CATEGORIES]" :key="cat.key"
          @click="filterCat = cat.key"
          :class="['px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
            filterCat === cat.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
          {{ cat.icon || '' }} {{ cat.label }}
          <span v-if="cat.key !== 'all'" class="ml-1 opacity-60">
            ({{ docs.filter(d => d.category === cat.key).length }})
          </span>
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>

        <div v-else-if="!filteredDocs.length" class="text-center py-12 text-gray-300">
          <p class="text-4xl mb-2">📭</p>
          <p class="text-sm">ยังไม่มีเอกสารในหมวดนี้</p>
        </div>

        <table v-else class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th class="text-left px-5 py-3">เอกสาร</th>
              <th class="text-left px-4 py-3 hidden md:table-cell">หมวดหมู่</th>
              <th class="text-center px-4 py-3 hidden sm:table-cell">ประเภท</th>
              <th class="text-center px-4 py-3 hidden lg:table-cell">โหลด</th>
              <th class="text-center px-4 py-3">สถานะ</th>
              <th class="text-right px-5 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="doc in filteredDocs" :key="doc.id"
              class="hover:bg-gray-50/60 transition-colors">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl flex-shrink-0">{{ fileIcon(doc.file_type) }}</span>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-800 truncate max-w-xs">{{ doc.title }}</p>
                    <p v-if="doc.description" class="text-xs text-gray-400 truncate max-w-xs">{{ doc.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', catChip(doc.category)]">
                  {{ catLabel(doc.category) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center hidden sm:table-cell">
                <span class="text-xs text-gray-500 uppercase font-mono bg-gray-100 px-2 py-0.5 rounded">
                  {{ doc.file_type }}
                </span>
              </td>
              <td class="px-4 py-3 text-center hidden lg:table-cell">
                <span class="text-sm font-bold text-gray-700">{{ doc.download_count }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="togglePublic(doc)"
                  :class="['text-xs px-2.5 py-1 rounded-full font-semibold transition-colors',
                    doc.is_public ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">
                  {{ doc.is_public ? 'เผยแพร่' : 'ซ่อน' }}
                </button>
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a :href="doc.file_url" target="_blank"
                    class="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                    เปิด
                  </a>
                  <button @click="openForm(doc)"
                    class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                    แก้ไข
                  </button>
                  <button @click="deleteDoc(doc)"
                    class="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showForm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          @click.self="showForm = false">
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-900 text-base">{{ editing ? 'แก้ไขเอกสาร' : 'เพิ่มเอกสาร' }}</h3>
              <button @click="showForm = false" class="text-gray-300 hover:text-gray-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="px-6 py-5 space-y-4">
              <!-- Title -->
              <div>
                <label class="label">ชื่อเอกสาร <span class="text-red-500">*</span></label>
                <input v-model="form.title" type="text" class="input-field"
                  placeholder="เช่น แบบฟอร์มลาป่วย" />
              </div>

              <!-- Description -->
              <div>
                <label class="label">คำอธิบาย (ไม่บังคับ)</label>
                <input v-model="form.description" type="text" class="input-field"
                  placeholder="รายละเอียดสั้นๆ" />
              </div>

              <!-- Category + Type -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">หมวดหมู่</label>
                  <select v-model="form.category" class="input-field">
                    <option v-for="cat in CATEGORIES" :key="cat.key" :value="cat.key">
                      {{ cat.icon }} {{ cat.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="label">ประเภทไฟล์</label>
                  <select v-model="form.file_type" class="input-field">
                    <option v-for="ft in FILE_TYPES" :key="ft.key" :value="ft.key">
                      {{ ft.icon }} {{ ft.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- URL -->
              <div>
                <label class="label">ลิงก์เอกสาร <span class="text-red-500">*</span></label>
                <input v-model="form.file_url" type="url" class="input-field font-mono text-xs"
                  placeholder="https://drive.google.com/..." />
                <p class="text-xs text-gray-400 mt-1">วางลิงก์จาก Google Drive, OneDrive หรือเว็บใดก็ได้</p>
              </div>

              <!-- Public Toggle -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p class="text-sm font-medium text-gray-700">เผยแพร่สาธารณะ</p>
                  <p class="text-xs text-gray-400">ปิดเพื่อซ่อนจากหน้าเว็บ</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="form.is_public" class="sr-only peer" />
                  <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <!-- Error -->
              <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
            </div>

            <div class="flex gap-3 px-6 pb-6">
              <button @click="showForm = false" class="btn-secondary flex-1">ยกเลิก</button>
              <button @click="saveDoc" :disabled="saving"
                class="btn-primary flex-1 flex items-center justify-center gap-2">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ saving ? 'กำลังบันทึก...' : editing ? 'บันทึก' : 'เพิ่มเอกสาร' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { supabase } from '../../lib/supabase'

const CATEGORIES = [
  { key: 'form',         label: 'แบบฟอร์ม',        icon: '📝', chip: 'bg-blue-100 text-blue-700'    },
  { key: 'regulation',   label: 'ระเบียบ/ข้อบังคับ', icon: '📋', chip: 'bg-red-100 text-red-700'     },
  { key: 'manual',       label: 'คู่มือ',            icon: '📖', chip: 'bg-green-100 text-green-700'  },
  { key: 'report',       label: 'รายงาน',            icon: '📊', chip: 'bg-purple-100 text-purple-700'},
  { key: 'announcement', label: 'ประกาศ',            icon: '📢', chip: 'bg-yellow-100 text-yellow-700'},
  { key: 'other',        label: 'อื่นๆ',             icon: '📁', chip: 'bg-gray-100 text-gray-600'   },
]

const FILE_TYPES = [
  { key: 'pdf',  label: 'PDF',        icon: '📄' },
  { key: 'doc',  label: 'Word',       icon: '📝' },
  { key: 'xls',  label: 'Excel',      icon: '📊' },
  { key: 'ppt',  label: 'PowerPoint', icon: '📑' },
  { key: 'link', label: 'ลิงก์ทั่วไป', icon: '🔗' },
]

const FILE_ICONS = { pdf: '📄', doc: '📝', xls: '📊', ppt: '📑', link: '🔗' }
function fileIcon(t) { return FILE_ICONS[t] || '📁' }

function catLabel(k) { return CATEGORIES.find(c => c.key === k)?.label || k }
function catChip(k)  { return CATEGORIES.find(c => c.key === k)?.chip  || 'bg-gray-100 text-gray-600' }

const docs      = ref([])
const loading   = ref(true)
const filterCat = ref('all')
const showForm  = ref(false)
const editing   = ref(null)
const saving    = ref(false)
const formError = ref('')

const BLANK = { title: '', description: '', category: 'form', file_type: 'pdf', file_url: '', is_public: true }
const form  = ref({ ...BLANK })

const filteredDocs = computed(() =>
  filterCat.value === 'all' ? docs.value : docs.value.filter(d => d.category === filterCat.value)
)

async function fetchDocs() {
  loading.value = true
  const { data } = await supabase.from('documents')
    .select('*').order('category').order('sort_order').order('created_at', { ascending: false })
  docs.value = data || []
  loading.value = false
}

function openForm(doc = null) {
  editing.value = doc
  form.value = doc ? { ...doc } : { ...BLANK }
  formError.value = ''
  showForm.value = true
}

async function saveDoc() {
  formError.value = ''
  if (!form.value.title.trim()) { formError.value = 'กรุณาใส่ชื่อเอกสาร'; return }
  if (!form.value.file_url.trim()) { formError.value = 'กรุณาใส่ลิงก์เอกสาร'; return }

  saving.value = true
  const payload = {
    title:       form.value.title.trim(),
    description: form.value.description?.trim() || null,
    category:    form.value.category,
    file_type:   form.value.file_type,
    file_url:    form.value.file_url.trim(),
    is_public:   form.value.is_public,
    updated_at:  new Date().toISOString(),
  }

  if (editing.value) {
    await supabase.from('documents').update(payload).eq('id', editing.value.id)
  } else {
    await supabase.from('documents').insert({ ...payload, download_count: 0 })
  }

  await fetchDocs()
  saving.value = false
  showForm.value = false
}

async function togglePublic(doc) {
  await supabase.from('documents').update({ is_public: !doc.is_public }).eq('id', doc.id)
  doc.is_public = !doc.is_public
}

async function deleteDoc(doc) {
  if (!confirm(`ลบ "${doc.title}" ใช่ไหม?`)) return
  await supabase.from('documents').delete().eq('id', doc.id)
  docs.value = docs.value.filter(d => d.id !== doc.id)
}

onMounted(fetchDocs)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
