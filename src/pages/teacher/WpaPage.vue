<template>
  <AdminLayout>
    <div class="space-y-4">
      <!-- Header card -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 class="text-xl font-bold mb-1">📂 ระบบเก็บข้อตกลงและผลงาน (วPA)</h2>
          <p class="text-purple-100 text-sm">บันทึกลิงก์ข้อตกลง + ผลงานของคุณ แยกตามปีการศึกษา</p>
        </div>
        <button @click="openAddModal" class="bg-white text-purple-700 font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-purple-50 transition-colors flex items-center gap-2">
          <span class="text-lg leading-none">+</span> เพิ่มปีการศึกษา
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && records.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div class="text-5xl mb-3">📭</div>
        <p class="text-gray-500 mb-1">ยังไม่มีข้อมูล วPA</p>
        <p class="text-xs text-gray-400 mb-5">เริ่มเพิ่มปีการศึกษาแรกของคุณ</p>
        <button @click="openAddModal" class="btn-primary">+ เพิ่มปีการศึกษา</button>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="bg-white rounded-2xl p-12 text-center text-gray-400">
        <div class="text-3xl mb-2 animate-spin">⏳</div>
        <p class="text-sm">กำลังโหลด...</p>
      </div>

      <!-- Records grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="r in records" :key="r.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {{ String(r.year).slice(-2) }}
              </div>
              <div>
                <p class="text-xs text-gray-400">ปีการศึกษา</p>
                <p class="font-bold text-gray-900 text-lg leading-tight">{{ r.year }}</p>
              </div>
            </div>
            <span :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
              r.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">
              {{ r.is_public ? '🌐 สาธารณะ' : '🔒 ส่วนตัว' }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <a v-if="r.agreement_url" :href="r.agreement_url" target="_blank" rel="noopener"
              class="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors">
              <span>📄</span><span class="font-medium">ลิงก์ข้อตกลง</span>
              <svg class="w-3.5 h-3.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
            <a v-if="r.portfolio_url" :href="r.portfolio_url" target="_blank" rel="noopener"
              class="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors">
              <span>🏆</span><span class="font-medium">ลิงก์ผลงาน</span>
              <svg class="w-3.5 h-3.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
            <p v-if="r.note" class="text-xs text-gray-500 px-1 italic">📝 {{ r.note }}</p>
          </div>

          <div class="flex gap-2 pt-3 border-t border-gray-100">
            <button @click="togglePublic(r)" :disabled="busy"
              class="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
              {{ r.is_public ? '🔒 ทำเป็นส่วนตัว' : '🌐 เปิดสาธารณะ' }}
            </button>
            <button @click="openEditModal(r)" class="text-xs px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
              ✏️ แก้ไข
            </button>
            <button @click="removeRecord(r)" class="text-xs px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: เพิ่ม/แก้ไข -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showModal = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-5">
              {{ form.id ? '✏️ แก้ไขข้อมูล วPA' : '➕ เพิ่มข้อมูล วPA' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="label">ปีการศึกษา (พ.ศ.) <span class="text-red-500">*</span></label>
                <input v-model.number="form.year" type="number" min="2500" max="2700"
                  :disabled="!!form.id" class="input-field disabled:bg-gray-50 disabled:text-gray-400" />
                <p v-if="form.id" class="text-xs text-gray-400 mt-1">⚠️ ไม่สามารถเปลี่ยนปีการศึกษาได้หลังบันทึกแล้ว</p>
              </div>
              <div>
                <label class="label">📄 ลิงก์ข้อตกลง (PA)</label>
                <input v-model="form.agreement_url" type="url" placeholder="https://..." class="input-field" />
              </div>
              <div>
                <label class="label">🏆 ลิงก์ผลงาน</label>
                <input v-model="form.portfolio_url" type="url" placeholder="https://sites.google.com/..." class="input-field" />
                <p class="text-xs text-gray-400 mt-1">เช่น Google Sites, Google Drive, หรือเว็บไซต์อื่นๆ</p>
              </div>
              <div>
                <label class="label">หมายเหตุ <span class="text-gray-400 text-xs font-normal">(ถ้ามี)</span></label>
                <textarea v-model="form.note" rows="2" class="input-field" placeholder="..."></textarea>
              </div>
              <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <input type="checkbox" v-model="form.is_public" class="w-5 h-5 rounded accent-purple-600" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-800">🌐 เปิดให้ดูสาธารณะ</p>
                  <p class="text-xs text-gray-500">บุคคลทั่วไปจะเห็นข้อมูลนี้บนหน้าเว็บโรงเรียน</p>
                </div>
              </label>
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">⚠️ {{ formError }}</div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="saveRecord" :disabled="saving || !form.year"
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
import { ref, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { supabase } from '../../lib/supabase'

const { user } = useAuth()

const records   = ref([])
const loading   = ref(true)
const busy      = ref(false)
const showModal = ref(false)
const saving    = ref(false)
const formError = ref('')
const toast     = ref('')
let toastTimer  = null

// ปีปัจจุบัน พ.ศ.
const currentBE = new Date().getFullYear() + 543

const form = ref({
  id: null,
  year: currentBE,
  agreement_url: '',
  portfolio_url: '',
  note: '',
  is_public: true,
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

function openAddModal() {
  form.value = {
    id: null,
    year: currentBE,
    agreement_url: '',
    portfolio_url: '',
    note: '',
    is_public: true,
  }
  formError.value = ''
  showModal.value = true
}

function openEditModal(r) {
  form.value = {
    id: r.id,
    year: r.year,
    agreement_url: r.agreement_url || '',
    portfolio_url: r.portfolio_url || '',
    note: r.note || '',
    is_public: r.is_public,
  }
  formError.value = ''
  showModal.value = true
}

async function saveRecord() {
  if (!form.value.year) return
  saving.value = true
  formError.value = ''

  const payload = {
    user_id:       user.value.id,
    year:          form.value.year,
    agreement_url: form.value.agreement_url.trim() || null,
    portfolio_url: form.value.portfolio_url.trim() || null,
    note:          form.value.note.trim() || null,
    is_public:     form.value.is_public,
  }

  try {
    if (form.value.id) {
      // Update
      const { error } = await supabase.from('wpa_records')
        .update(payload).eq('id', form.value.id)
      if (error) throw error
      showToast('✅ บันทึกการแก้ไขแล้ว')
    } else {
      // Insert
      const { error } = await supabase.from('wpa_records').insert(payload)
      if (error) throw error
      showToast('✅ เพิ่มข้อมูลแล้ว')
    }
    showModal.value = false
    await fetchRecords()
  } catch (err) {
    if (err.message.includes('duplicate') || err.code === '23505') {
      formError.value = `มีข้อมูลปี ${form.value.year} อยู่แล้ว — กรุณาแก้ไขรายการเดิมแทน`
    } else {
      formError.value = err.message
    }
  } finally {
    saving.value = false
  }
}

async function togglePublic(r) {
  busy.value = true
  const { error } = await supabase.from('wpa_records')
    .update({ is_public: !r.is_public }).eq('id', r.id)
  if (!error) {
    r.is_public = !r.is_public
    showToast(r.is_public ? '🌐 เปิดสาธารณะแล้ว' : '🔒 ทำเป็นส่วนตัวแล้ว')
  } else {
    showToast('❌ ไม่สำเร็จ')
  }
  busy.value = false
}

async function removeRecord(r) {
  if (!confirm(`ลบข้อมูลปี ${r.year} ออกจากระบบ?\nไม่สามารถกู้คืนได้`)) return
  const { error } = await supabase.from('wpa_records').delete().eq('id', r.id)
  if (!error) {
    records.value = records.value.filter(x => x.id !== r.id)
    showToast('🗑️ ลบแล้ว')
  } else {
    showToast('❌ ลบไม่สำเร็จ')
  }
}

async function fetchRecords() {
  loading.value = true
  const { data } = await supabase.from('wpa_records')
    .select('*')
    .eq('user_id', user.value.id)
    .order('year', { ascending: false })
  records.value = data || []
  loading.value = false
}

onMounted(fetchRecords)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
