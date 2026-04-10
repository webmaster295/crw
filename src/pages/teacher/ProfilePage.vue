<template>
  <AdminLayout>
    <div class="max-w-2xl space-y-6">
      <!-- Profile Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-bold text-gray-900 mb-6">👤 โปรไฟล์ของฉัน</h2>

        <!-- Avatar -->
        <div class="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <ImageUploadCrop
            v-model="form.profile_image_url"
            bucket="school"
            :storagePath="`avatars/${user?.id}.jpg`"
            shape="circle"
            :aspect="1"
            :outputWidth="200"
            containerClass="w-20 h-20 rounded-full"
            icon="👤"
            placeholder="รูปโปรไฟล์"
          />
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ displayName || 'ยังไม่ได้ตั้งชื่อ' }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ user?.email }}</p>
            <p class="text-xs text-blue-500 mt-1">คลิกรูปเพื่อเปลี่ยน</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Prefix + Full name -->
          <div class="grid grid-cols-4 gap-3">
            <div>
              <label class="label">คำนำหน้า</label>
              <select v-model="form.prefix" class="input-field">
                <option v-for="p in prefixOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="col-span-3">
              <label class="label">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
              <input v-model="form.full_name" type="text" placeholder="เช่น สมชาย ใจดี" class="input-field" />
            </div>
          </div>

          <!-- Position + Academic Standing -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">ตำแหน่ง</label>
              <select v-model="form.position" class="input-field">
                <option v-for="p in positionOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div>
              <label class="label">วิทยฐานะ</label>
              <select v-model="form.academic_standing" class="input-field">
                <option v-for="a in standingOptions" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </div>

          <!-- Subject Group -->
          <div>
            <label class="label">กลุ่มสาระการเรียนรู้</label>
            <select v-model="form.subject_group" class="input-field">
              <option value="">— ไม่ระบุ —</option>
              <option v-for="s in subjectOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <!-- Email (read-only) -->
          <div>
            <label class="label">อีเมล</label>
            <input :value="user?.email" type="email" class="input-field bg-gray-50" disabled />
          </div>

          <button @click="save" :disabled="saving" class="btn-primary w-full">
            {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล' }}
          </button>
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
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import ImageUploadCrop from '../../components/admin/ImageUploadCrop.vue'
import { useAuth } from '../../composables/useAuth'
import { supabase } from '../../lib/supabase'

const { user, profile, fetchProfile } = useAuth()

const form = ref({
  full_name: '',
  prefix: 'นาย',
  position: 'ครู',
  academic_standing: 'ครูผู้ช่วย',
  subject_group: '',
  profile_image_url: '',
})
const saving = ref(false)
const toast  = ref('')
let toastTimer = null

const prefixOptions  = ['นาย', 'นาง', 'นางสาว', 'ว่าที่ร้อยตรี', 'ว่าที่ร้อยตรีหญิง']
const positionOptions = [
  'ครูผู้ช่วย', 'ครู', 'ครูอัตราจ้าง', 'พนักงานราชการ',
  'หัวหน้ากลุ่มสาระ', 'หัวหน้างาน',
  'รองผู้อำนวยการ', 'ผู้อำนวยการ',
  'เจ้าหน้าที่ธุรการ', 'บรรณารักษ์', 'นักการภารโรง', 'อื่นๆ',
]
const standingOptions = ['ไม่มีวิทยฐานะ', 'ครูผู้ช่วย', 'ครู', 'ครูชำนาญการ', 'ครูชำนาญการพิเศษ', 'ครูเชี่ยวชาญ', 'ครูเชี่ยวชาญพิเศษ']
const subjectOptions  = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา ศาสนาและวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'ภาษาต่างประเทศ',
  'กิจกรรมพัฒนาผู้เรียน',
  'ปฐมวัย',
]

const displayName = computed(() => {
  const f = form.value
  if (!f.full_name) return ''
  return [f.prefix, f.full_name].filter(Boolean).join('')
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

async function save() {
  if (!form.value.full_name.trim()) return showToast('⚠️ กรุณากรอกชื่อ-นามสกุล')
  saving.value = true
  const { error } = await supabase.from('profiles').update({
    full_name:         form.value.full_name.trim(),
    prefix:            form.value.prefix,
    position:          form.value.position,
    academic_standing: form.value.academic_standing,
    subject_group:     form.value.subject_group || null,
    profile_image_url: form.value.profile_image_url || null,
  }).eq('id', user.value.id)

  if (error) showToast('❌ บันทึกไม่สำเร็จ')
  else {
    await fetchProfile()
    showToast('✅ บันทึกแล้ว')
  }
  saving.value = false
}

onMounted(() => {
  const p = profile.value
  if (!p) return
  form.value = {
    full_name:         p.full_name         || '',
    prefix:            p.prefix            || 'นาย',
    position:          p.position          || 'ครู',
    academic_standing: p.academic_standing || 'ครูผู้ช่วย',
    subject_group:     p.subject_group     || '',
    profile_image_url: p.profile_image_url || '',
  }
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>
