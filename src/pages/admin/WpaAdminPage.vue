<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-900">วPA ครูทั้งหมด</h2>
        <p class="text-sm text-gray-500 mt-0.5">ดูและจัดการข้อมูล วPA ของครูทุกคน</p>
      </div>
      <div class="text-sm text-gray-400">ทั้งหมด {{ filtered.length }} รายการ</div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <input v-model="search" type="text" placeholder="🔍 ค้นหาชื่อครู..."
        class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <select v-model="filterYear" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">— ทุกปีการศึกษา —</option>
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <select v-model="filterSubject" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">— ทุกกลุ่มสาระ —</option>
        <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-model="filterPublic" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">— ทุกสถานะ —</option>
        <option value="true">เผยแพร่แล้ว</option>
        <option value="false">ไม่เผยแพร่</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div v-if="loading" class="p-10 text-center text-gray-400">
        <div class="text-3xl mb-2 animate-spin">⏳</div>กำลังโหลด...
      </div>
      <div v-else-if="!filtered.length" class="p-10 text-center text-gray-400">
        <div class="text-4xl mb-2">📂</div>
        <p>ไม่พบข้อมูลวPA</p>
      </div>

      <!-- Desktop Table -->
      <table v-else class="w-full text-sm hidden md:table">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
            <th class="py-3 px-4">ครู</th>
            <th class="py-3 px-4">กลุ่มสาระ</th>
            <th class="py-3 px-4 text-center w-28">ปีการศึกษา</th>
            <th class="py-3 px-4 text-center w-28">สถานะ</th>
            <th class="py-3 px-4 text-center w-36">ลิงก์</th>
            <th class="py-3 px-4 text-center w-20">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
            <td class="py-2.5 px-4">
              <div class="flex items-center gap-3">
                <img v-if="r.profile_image_url" :src="r.profile_image_url"
                  class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span class="text-white text-xs font-bold">{{ (r.full_name || '?').charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ r.full_name || '—' }}</p>
                  <p class="text-xs text-gray-400">{{ r.position || '' }}</p>
                </div>
              </div>
            </td>
            <td class="py-2.5 px-4 text-gray-500 text-xs">{{ r.subject_group || '—' }}</td>
            <td class="py-2.5 px-4 text-center">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold"
                :style="yearStyle(r.year)">{{ String(r.year).slice(-2) }}</span>
            </td>
            <td class="py-2.5 px-4 text-center">
              <button @click="togglePublic(r)"
                :class="['px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  r.is_public ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                              : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600']">
                {{ r.is_public ? '✅ เผยแพร่' : '🔒 ส่วนตัว' }}
              </button>
            </td>
            <td class="py-2.5 px-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <a v-if="r.agreement_url" :href="r.agreement_url" target="_blank"
                  class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">📄 ข้อตกลง</a>
                <a v-if="r.portfolio_url" :href="r.portfolio_url" target="_blank"
                  class="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-100">📁 แฟ้ม</a>
                <span v-if="!r.agreement_url && !r.portfolio_url" class="text-gray-300 text-xs">—</span>
              </div>
            </td>
            <td class="py-2.5 px-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <button @click="openEdit(r)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">✏️</button>
                <button @click="confirmTarget = r" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Cards -->
      <div v-if="filtered.length" class="md:hidden divide-y divide-gray-50">
        <div v-for="r in filtered" :key="r.id" class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <img v-if="r.profile_image_url" :src="r.profile_image_url"
                class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm font-bold">{{ (r.full_name || '?').charAt(0) }}</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ r.full_name || '—' }}</p>
                <p class="text-xs text-gray-500">{{ r.subject_group || '—' }} · ปี {{ r.year }}</p>
              </div>
            </div>
            <div class="flex gap-1 flex-shrink-0">
              <button @click="openEdit(r)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">✏️</button>
              <button @click="confirmTarget = r" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">🗑️</button>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button @click="togglePublic(r)"
              :class="['px-3 py-1 rounded-full text-xs font-semibold',
                r.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">
              {{ r.is_public ? '✅ เผยแพร่' : '🔒 ส่วนตัว' }}
            </button>
            <a v-if="r.agreement_url" :href="r.agreement_url" target="_blank"
              class="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">📄 ข้อตกลง</a>
            <a v-if="r.portfolio_url" :href="r.portfolio_url" target="_blank"
              class="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full">📁 แฟ้มสะสม</a>
          </div>
          <p v-if="r.note" class="mt-2 text-xs text-gray-500 italic">{{ r.note }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-1">แก้ไข วPA</h3>
            <p class="text-sm text-gray-500 mb-5">{{ editForm.full_name }} · ปีการศึกษา {{ editForm.year }}</p>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">ลิงก์ข้อตกลง (Agreement)</label>
                <input v-model="editForm.agreement_url" type="url" placeholder="https://..."
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">ลิงก์แฟ้มสะสมผลงาน (Portfolio)</label>
                <input v-model="editForm.portfolio_url" type="url" placeholder="https://..."
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">หมายเหตุ</label>
                <textarea v-model="editForm.note" rows="2" placeholder="หมายเหตุ (ถ้ามี)"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <button @click="editForm.is_public = !editForm.is_public"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    editForm.is_public ? 'bg-green-500' : 'bg-gray-300']">
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm',
                    editForm.is_public ? 'translate-x-4' : 'translate-x-0.5']"></span>
                </button>
                <span class="text-sm text-gray-700">เผยแพร่สาธารณะ</span>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button @click="saveEdit" :disabled="saving"
                class="flex-1 btn-primary py-2.5 disabled:opacity-50">
                {{ saving ? 'กำลังบันทึก...' : '💾 บันทึก' }}
              </button>
              <button @click="showModal = false"
                class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
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
            <p class="text-sm text-gray-500 mb-5">
              ลบ วPA ปีการศึกษา <span class="font-semibold text-gray-700">{{ confirmTarget.year }}</span>
              ของ <span class="font-semibold text-gray-700">{{ confirmTarget.full_name }}</span><br/>
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
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
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { supabase } from '../../lib/supabase'

const records      = ref([])
const loading      = ref(true)
const showModal    = ref(false)
const saving       = ref(false)
const confirmTarget = ref(null)
const toast        = ref('')
let toastTimer     = null

const search       = ref('')
const filterYear   = ref('')
const filterSubject = ref('')
const filterPublic = ref('')

const editForm = ref({ id: '', full_name: '', year: '', agreement_url: '', portfolio_url: '', note: '', is_public: false })

const yearColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899']
function yearStyle(y) {
  const i = y % yearColors.length
  return { background: yearColors[i] + '20', color: yearColors[i] }
}

function showToast(msg) {
  toast.value = msg; clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

async function fetchRecords() {
  loading.value = true
  const { data, error } = await supabase.rpc('get_all_wpa_admin')
  if (error) { console.error(error); showToast('❌ ' + error.message) }
  records.value = data || []
  loading.value = false
}

const years    = computed(() => [...new Set(records.value.map(r => r.year))].sort((a, b) => b - a))
const subjects = computed(() => [...new Set(records.value.map(r => r.subject_group).filter(Boolean))].sort())

const filtered = computed(() => records.value.filter(r => {
  const q = search.value.trim().toLowerCase()
  if (q && !(r.full_name || '').toLowerCase().includes(q)) return false
  if (filterYear.value && String(r.year) !== String(filterYear.value)) return false
  if (filterSubject.value && r.subject_group !== filterSubject.value) return false
  if (filterPublic.value !== '' && String(r.is_public) !== filterPublic.value) return false
  return true
}))

async function togglePublic(r) {
  const newVal = !r.is_public
  const { error } = await supabase.from('wpa_records').update({ is_public: newVal }).eq('id', r.id)
  if (error) { showToast('❌ ' + error.message); return }
  r.is_public = newVal
  showToast(newVal ? '✅ เผยแพร่แล้ว' : '🔒 ซ่อนแล้ว')
}

function openEdit(r) {
  editForm.value = {
    id: r.id,
    full_name: r.full_name,
    year: r.year,
    agreement_url: r.agreement_url || '',
    portfolio_url: r.portfolio_url || '',
    note: r.note || '',
    is_public: r.is_public,
  }
  showModal.value = true
}

async function saveEdit() {
  saving.value = true
  const { error } = await supabase.from('wpa_records').update({
    agreement_url: editForm.value.agreement_url || null,
    portfolio_url: editForm.value.portfolio_url || null,
    note:          editForm.value.note || null,
    is_public:     editForm.value.is_public,
  }).eq('id', editForm.value.id)

  if (error) { showToast('❌ ' + error.message) }
  else {
    const rec = records.value.find(r => r.id === editForm.value.id)
    if (rec) Object.assign(rec, {
      agreement_url: editForm.value.agreement_url || null,
      portfolio_url: editForm.value.portfolio_url || null,
      note:          editForm.value.note || null,
      is_public:     editForm.value.is_public,
    })
    showToast('✅ บันทึกแล้ว')
    showModal.value = false
  }
  saving.value = false
}

async function confirmDelete() {
  const r = confirmTarget.value
  if (!r) return
  const { error } = await supabase.from('wpa_records').delete().eq('id', r.id)
  if (error) { showToast('❌ ' + error.message) }
  else {
    records.value = records.value.filter(x => x.id !== r.id)
    showToast('🗑️ ลบแล้ว')
  }
  confirmTarget.value = null
}

onMounted(fetchRecords)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>
