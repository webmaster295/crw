<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-900">เมนูระบบงาน</h2>
        <p class="text-sm text-gray-500 mt-0.5">ลิงก์ที่แสดงใน dropdown "ระบบงาน" บนเมนูเว็บไซต์</p>
      </div>
      <button @click="openAdd" class="btn-primary flex items-center gap-2">
        <span class="text-lg leading-none">+</span> เพิ่มลิงก์
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div v-if="loading" class="p-10 text-center text-gray-400">
        <div class="text-3xl mb-2 animate-spin">⏳</div>กำลังโหลด...
      </div>
      <div v-else-if="!items.length" class="p-10 text-center text-gray-400">
        <div class="text-4xl mb-2">🔗</div>
        <p>ยังไม่มีลิงก์ระบบงาน</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
            <th class="py-3 px-4 w-10">ไอคอน</th>
            <th class="py-3 px-4">ชื่อเมนู</th>
            <th class="py-3 px-4 hidden md:table-cell">URL</th>
            <th class="py-3 px-4 hidden lg:table-cell w-28 text-center">เปิดแท็บใหม่</th>
            <th class="py-3 px-4 w-28 text-center">สถานะ</th>
            <th class="py-3 px-4 w-28 text-center">เรียงลำดับ</th>
            <th class="py-3 px-4 w-20 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="item.id"
            class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
            <td class="py-2 px-4 text-2xl">{{ item.icon || '🔗' }}</td>
            <td class="py-2 px-4 font-medium text-gray-900">{{ item.label }}</td>
            <td class="py-2 px-4 hidden md:table-cell">
              <span class="text-xs text-gray-500 font-mono truncate block max-w-[200px]">{{ item.url }}</span>
            </td>
            <td class="py-2 px-4 hidden lg:table-cell text-center">
              <span :class="['text-xs font-medium', item.is_external ? 'text-green-600' : 'text-gray-400']">
                {{ item.is_external ? '✅ ใช่' : '— ไม่' }}
              </span>
            </td>
            <td class="py-2 px-4 text-center">
              <button @click="toggleActive(item)"
                :class="['px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  item.is_active ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600']">
                {{ item.is_active ? '✅ แสดง' : '📝 ซ่อน' }}
              </button>
            </td>
            <td class="py-2 px-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <button @click="moveUp(idx)" :disabled="idx === 0"
                  class="p-1 rounded text-gray-300 hover:text-blue-500 disabled:opacity-20">▲</button>
                <button @click="moveDown(idx)" :disabled="idx === items.length - 1"
                  class="p-1 rounded text-gray-300 hover:text-blue-500 disabled:opacity-20">▼</button>
              </div>
            </td>
            <td class="py-2 px-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <button @click="openEdit(item)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">✏️</button>
                <button @click="deleteItem(item)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-5">{{ editId ? 'แก้ไขลิงก์' : 'เพิ่มลิงก์ใหม่' }}</h3>
            <div class="space-y-4">
              <!-- Icon + Label -->
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">ไอคอน</label>
                  <div class="flex gap-1 flex-wrap">
                    <button v-for="e in emojiOptions" :key="e" @click="form.icon = e"
                      :class="['w-8 h-8 rounded-lg text-base flex items-center justify-center border-2 transition-all',
                        form.icon === e ? 'border-blue-500 bg-blue-50' : 'border-gray-200']">{{ e }}</button>
                  </div>
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-gray-600 mb-1">ชื่อเมนู <span class="text-red-500">*</span></label>
                  <input v-model="form.label" type="text" placeholder="เช่น งานทะเบียน..."
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <!-- URL -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">URL <span class="text-red-500">*</span></label>
                <input v-model="form.url" type="text" placeholder="https://... หรือ /dashboard"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <!-- External toggle -->
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <button @click="form.is_external = !form.is_external"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    form.is_external ? 'bg-blue-500' : 'bg-gray-300']">
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm',
                    form.is_external ? 'translate-x-4' : 'translate-x-0.5']"></span>
                </button>
                <span class="text-sm text-gray-700">เปิดในแท็บใหม่ (ลิงก์ภายนอก)</span>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button @click="saveItem" :disabled="saving || !form.label.trim() || !form.url.trim()"
                class="flex-1 btn-primary py-2.5 disabled:opacity-50">
                {{ saving ? 'กำลังบันทึก...' : '💾 บันทึก' }}
              </button>
              <button @click="showModal = false" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="confirmTarget = null"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-3xl">🗑️</div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">ยืนยันการลบ</h3>
            <p class="text-sm text-gray-500 mb-5">ต้องการลบ "<span class="font-semibold text-gray-700">{{ confirmTarget.label }}</span>" ใช่หรือไม่?<br/>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div class="flex gap-3">
              <button @click="confirmTarget = null" class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
              <button @click="confirmDelete" class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">ลบ</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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

const items     = ref([])
const loading   = ref(true)
const showModal = ref(false)
const saving    = ref(false)
const editId    = ref(null)
const toast     = ref('')
let toastTimer  = null

const emojiOptions = ['🔗', '📋', '📊', '📜', '📂', '💰', '🏫', '📅', '👥', '🎓', '⚙️', '📱']
const form = ref({ label: '', url: '', icon: '🔗', is_external: true })

function showToast(msg) {
  toast.value = msg; clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

async function fetchItems() {
  loading.value = true
  const { data, error } = await supabase.from('nav_systems').select('*').order('sort_order', { ascending: true })
  if (error) { console.error('nav_systems load error:', error); showToast('❌ ' + error.message) }
  items.value = data || []
  loading.value = false
}

function openAdd() {
  editId.value = null
  form.value = { label: '', url: '', icon: '🔗', is_external: true }
  showModal.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = { label: item.label, url: item.url, icon: item.icon || '🔗', is_external: item.is_external ?? true }
  showModal.value = true
}

async function saveItem() {
  if (!form.value.label.trim() || !form.value.url.trim()) return
  saving.value = true
  const payload = { label: form.value.label.trim(), url: form.value.url.trim(), icon: form.value.icon, is_external: form.value.is_external }
  if (editId.value) {
    await supabase.from('nav_systems').update(payload).eq('id', editId.value)
    showToast('✅ บันทึกแล้ว')
  } else {
    await supabase.from('nav_systems').insert({ ...payload, sort_order: items.value.length, is_active: true })
    showToast('✅ เพิ่มลิงก์แล้ว')
  }
  saving.value = false
  showModal.value = false
  fetchItems()
}

async function toggleActive(item) {
  await supabase.from('nav_systems').update({ is_active: !item.is_active }).eq('id', item.id)
  item.is_active = !item.is_active
}

const confirmTarget = ref(null)
function deleteItem(item) { confirmTarget.value = item }
async function confirmDelete() {
  const item = confirmTarget.value
  if (!item) return
  await supabase.from('nav_systems').delete().eq('id', item.id)
  items.value = items.value.filter(i => i.id !== item.id)
  confirmTarget.value = null
  showToast('🗑️ ลบแล้ว')
}

async function moveUp(idx) {
  if (idx === 0) return
  const a = items.value[idx], b = items.value[idx - 1]
  await Promise.all([
    supabase.from('nav_systems').update({ sort_order: b.sort_order }).eq('id', a.id),
    supabase.from('nav_systems').update({ sort_order: a.sort_order }).eq('id', b.id),
  ])
  fetchItems()
}

async function moveDown(idx) {
  if (idx === items.value.length - 1) return
  const a = items.value[idx], b = items.value[idx + 1]
  await Promise.all([
    supabase.from('nav_systems').update({ sort_order: b.sort_order }).eq('id', a.id),
    supabase.from('nav_systems').update({ sort_order: a.sort_order }).eq('id', b.id),
  ])
  fetchItems()
}

fetchItems()
</script>
<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
