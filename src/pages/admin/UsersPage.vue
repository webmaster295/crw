<template>
  <AdminLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="bg-white rounded-2xl p-1 inline-flex shadow-sm border border-gray-100">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
            :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-blue-600']"
          >{{ tab.label }} <span v-if="tab.count !== undefined" class="ml-1 text-xs opacity-75">({{ tab.count }})</span></button>
        </div>
        <button @click="openAddModal" class="btn-primary flex items-center gap-2">
          <span class="text-lg leading-none">+</span> เพิ่มผู้ใช้
        </button>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <input v-model="search" type="text" placeholder="ค้นหาชื่อหรืออีเมล..." class="input-field" />
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ผู้ใช้</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Role</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สถานะ</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">วันที่สมัคร</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                      <img v-if="u.profile_image_url" :src="u.profile_image_url" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {{ (u.full_name || u.email || 'U').charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ u.full_name || '-' }}</p>
                      <p class="text-xs text-gray-400">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <select :value="u.role" @change="changeRole(u.id, $event.target.value)"
                    class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="teacher">ครู</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <span :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    u.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']"
                  >
                    {{ u.is_approved ? '✅ อนุมัติแล้ว' : '⏳ รออนุมัติ' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">{{ formatDate(u.created_at) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-1.5 justify-end">
                    <button @click="openChangePassword(u)" title="เปลี่ยนรหัสผ่าน"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      🔑
                    </button>
                    <button v-if="!u.is_approved" @click="toggleApprove(u, true)"
                      class="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                    >อนุมัติ</button>
                    <button v-else @click="toggleApprove(u, false)"
                      class="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                    >ยกเลิก</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="loading" class="text-center py-12 text-gray-400">
          <div class="text-3xl mb-2 animate-spin">⏳</div>
          <p class="text-sm">กำลังโหลด...</p>
        </div>
        <div v-else-if="!filteredUsers.length" class="text-center py-12 text-gray-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">ไม่พบผู้ใช้</p>
        </div>
      </div>
    </div>

    <!-- Modal: เพิ่มผู้ใช้ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showAddModal = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-5">➕ เพิ่มผู้ใช้ใหม่</h3>
            <div class="space-y-3">
              <div>
                <label class="label">ชื่อ-นามสกุล</label>
                <input v-model="addForm.full_name" type="text" placeholder="เช่น สมชาย ใจดี" class="input-field" />
              </div>
              <div>
                <label class="label">อีเมล <span class="text-red-500">*</span></label>
                <input v-model="addForm.email" type="email" placeholder="teacher@school.ac.th" class="input-field" />
              </div>
              <div>
                <label class="label">รหัสผ่าน <span class="text-red-500">*</span></label>
                <input v-model="addForm.password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" class="input-field" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Role</label>
                  <select v-model="addForm.role" class="input-field">
                    <option value="teacher">ครู</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div class="flex items-end pb-1">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="addForm.is_approved" class="w-4 h-4 rounded accent-blue-600" />
                    <span class="text-sm text-gray-700">อนุมัติทันที</span>
                  </label>
                </div>
              </div>
              <div v-if="addError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">⚠️ {{ addError }}</div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="createUser" :disabled="adding || !addForm.email || !addForm.password"
                class="flex-1 btn-primary py-2.5 disabled:opacity-50">
                {{ adding ? 'กำลังสร้าง...' : '💾 สร้างบัญชี' }}
              </button>
              <button @click="showAddModal = false" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal: เปลี่ยนรหัสผ่าน -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPwModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showPwModal = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-1">🔑 เปลี่ยนรหัสผ่าน</h3>
            <p class="text-sm text-gray-500 mb-5">{{ pwTarget?.full_name || pwTarget?.email }}</p>
            <div class="space-y-3">
              <div>
                <label class="label">รหัสผ่านใหม่ <span class="text-red-500">*</span></label>
                <div class="relative">
                  <input v-model="newPassword" :type="showPassword ? 'text' : 'password'"
                    placeholder="อย่างน้อย 6 ตัวอักษร" class="input-field pr-10" />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div v-if="pwError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">⚠️ {{ pwError }}</div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="changePassword" :disabled="changingPw || newPassword.length < 6"
                class="flex-1 btn-primary py-2.5 disabled:opacity-50">
                {{ changingPw ? 'กำลังบันทึก...' : '💾 บันทึก' }}
              </button>
              <button @click="showPwModal = false" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
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
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { supabase, SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../../lib/supabase'

const users     = ref([])
const search    = ref('')
const activeTab = ref('all')
const loading   = ref(true)
const toast     = ref('')
let toastTimer  = null

// ── Add User ──
const showAddModal = ref(false)
const adding       = ref(false)
const addError     = ref('')
const addForm      = ref({ full_name: '', email: '', password: '', role: 'teacher', is_approved: true })

// ── Change Password ──
const showPwModal  = ref(false)
const changingPw   = ref(false)
const pwError      = ref('')
const pwTarget     = ref(null)
const newPassword  = ref('')
const showPassword = ref(false)

const tabs = computed(() => [
  { key: 'all',      label: 'ทั้งหมด',     count: users.value.length },
  { key: 'pending',  label: 'รออนุมัติ',   count: users.value.filter(u => !u.is_approved).length },
  { key: 'approved', label: 'อนุมัติแล้ว', count: users.value.filter(u => u.is_approved).length },
])

const filteredUsers = computed(() => {
  let list = users.value
  if (activeTab.value === 'pending')  list = list.filter(u => !u.is_approved)
  if (activeTab.value === 'approved') list = list.filter(u => u.is_approved)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u => u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q))
  }
  return list
})

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function showToast(msg) {
  toast.value = msg; clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

// ── Admin API helpers ──
async function adminFetch(path, method = 'GET', body = null) {
  if (!SUPABASE_SERVICE_KEY) throw new Error('ไม่พบ Service Role Key — กรุณาตั้งค่า SUPABASE_SERVICE_KEY ใน Script Properties')
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users${path}`, opts)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || json.msg || String(res.status))
  return json
}

function openAddModal() {
  addForm.value = { full_name: '', email: '', password: '', role: 'teacher', is_approved: true }
  addError.value = ''
  showAddModal.value = true
}

async function createUser() {
  if (!addForm.value.email || addForm.value.password.length < 6) return
  adding.value   = true
  addError.value = ''
  try {
    const data = await adminFetch('', 'POST', {
      email:          addForm.value.email.trim(),
      password:       addForm.value.password,
      email_confirm:  true,
      user_metadata:  { full_name: addForm.value.full_name.trim() },
    })
    // upsert profile (trigger อาจสร้างให้แล้ว แต่ set role/approved ด้วย)
    await supabase.from('profiles').upsert({
      id:          data.id,
      full_name:   addForm.value.full_name.trim() || null,
      email:       addForm.value.email.trim(),
      role:        addForm.value.role,
      is_approved: addForm.value.is_approved,
    }, { onConflict: 'id' })

    // auto-create teacher_profiles ถ้าเป็น teacher และอนุมัติทันที
    if (addForm.value.role === 'teacher' && addForm.value.is_approved) {
      await supabase.from('teacher_profiles')
        .upsert({ id: data.id }, { onConflict: 'id', ignoreDuplicates: true })
    }

    showAddModal.value = false
    showToast('✅ สร้างบัญชีสำเร็จ')
    await fetchUsers()
  } catch (err) {
    if (err.message.includes('already registered') || err.message.includes('already been registered')) {
      addError.value = 'อีเมลนี้มีในระบบแล้ว'
    } else {
      addError.value = err.message
    }
  } finally {
    adding.value = false
  }
}

function openChangePassword(u) {
  pwTarget.value    = u
  newPassword.value = ''
  pwError.value     = ''
  showPassword.value = false
  showPwModal.value = true
}

async function changePassword() {
  if (newPassword.value.length < 6) return
  changingPw.value = true
  pwError.value    = ''
  try {
    await adminFetch(`/${pwTarget.value.id}`, 'PUT', { password: newPassword.value })
    showPwModal.value = false
    showToast('✅ เปลี่ยนรหัสผ่านแล้ว')
  } catch (err) {
    pwError.value = err.message
  } finally {
    changingPw.value = false
  }
}

async function toggleApprove(u, val) {
  const updates = { is_approved: val }
  // เมื่ออนุมัติครั้งแรก: promote pending → teacher อัตโนมัติ
  if (val && u.role === 'pending') updates.role = 'teacher'

  await supabase.from('profiles').update(updates).eq('id', u.id)

  // auto-create teacher_profiles ถ้าเป็น teacher
  if (val && (u.role === 'teacher' || u.role === 'pending')) {
    await supabase.from('teacher_profiles')
      .upsert({ id: u.id }, { onConflict: 'id', ignoreDuplicates: true })
  }

  u.is_approved = val
  if (val && u.role === 'pending') u.role = 'teacher'
  showToast(val ? '✅ อนุมัติแล้ว ครูสามารถ Login และกรอกข้อมูลได้เลย' : '⛔ ยกเลิกการอนุมัติแล้ว')
}

async function changeRole(id, role) {
  await supabase.from('profiles').update({ role }).eq('id', id)
  const u = users.value.find(u => u.id === id)
  if (u) u.role = role
}

async function fetchUsers() {
  loading.value = true
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  users.value = data || []
  loading.value = false
}

onMounted(fetchUsers)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
