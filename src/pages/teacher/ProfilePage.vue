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
            :storage-path="`teachers/teacher-${teacherProfileId || user?.id}.jpg`"
            shape="square"
            :aspect-ratio="3/4"
            :output-width="300"
            container-class="w-20 h-28 rounded-2xl"
            icon="👤"
            placeholder="รูปประจำตัว"
          />
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ displayName || 'ยังไม่ได้ตั้งชื่อ' }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ user?.email }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ form.position || 'ครู' }}{{ form.academic_standing ? ' · ' + form.academic_standing : '' }}</p>
          </div>
        </div>

        <div class="space-y-5">

          <!-- ชื่อ-นามสกุล -->
          <div class="grid grid-cols-4 gap-3">
            <div>
              <label class="label">คำนำหน้า</label>
              <select v-model="form.prefix" class="input-field">
                <option>นาย</option><option>นาง</option><option>นางสาว</option>
                <option>ว่าที่ร้อยตรี</option><option>ว่าที่ร้อยตรีหญิง</option>
              </select>
            </div>
            <div>
              <label class="label">ชื่อ <span class="text-red-500">*</span></label>
              <input v-model="form.first_name" type="text" class="input-field" placeholder="ชื่อจริง" />
            </div>
            <div class="col-span-2">
              <label class="label">นามสกุล <span class="text-red-500">*</span></label>
              <input v-model="form.last_name" type="text" class="input-field" placeholder="นามสกุล" />
            </div>
          </div>

          <!-- ตำแหน่ง + วิทยฐานะ -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">ตำแหน่ง</label>
              <select v-model="form.position" class="input-field">
                <option>ผู้อำนวยการโรงเรียน</option>
                <option>รองผู้อำนวยการ</option>
                <option>ครู</option>
                <option>ครูผู้ช่วย</option>
                <option>พนักงานราชการ</option>
                <option>ลูกจ้างประจำ</option>
                <option>ลูกจ้างชั่วคราว</option>
                <option>ธุรการโรงเรียน</option>
              </select>
            </div>
            <div>
              <label class="label">วิทยฐานะ</label>
              <select v-model="form.academic_standing" class="input-field">
                <option value="">ไม่มี / ยังไม่มีวิทยฐานะ</option>
                <optgroup label="── ครู ──">
                  <option>ครูชำนาญการ</option>
                  <option>ครูชำนาญการพิเศษ</option>
                  <option>ครูเชี่ยวชาญ</option>
                  <option>ครูเชี่ยวชาญพิเศษ</option>
                </optgroup>
                <optgroup label="── ผู้อำนวยการ ──">
                  <option>ผู้อำนวยการชำนาญการ</option>
                  <option>ผู้อำนวยการชำนาญการพิเศษ</option>
                  <option>ผู้อำนวยการเชี่ยวชาญ</option>
                </optgroup>
                <optgroup label="── รองผู้อำนวยการ ──">
                  <option>รองผู้อำนวยการชำนาญการ</option>
                  <option>รองผู้อำนวยการชำนาญการพิเศษ</option>
                  <option>รองผู้อำนวยการเชี่ยวชาญ</option>
                </optgroup>
              </select>
            </div>
          </div>

          <!-- กลุ่มสาระ + บทบาทในกลุ่ม -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">กลุ่มสาระการเรียนรู้</label>
              <select v-model="form.subject_group" class="input-field">
                <option value="">— ไม่ระบุ —</option>
                <option>ภาษาไทย</option>
                <option>คณิตศาสตร์</option>
                <option>วิทยาศาสตร์และเทคโนโลยี</option>
                <option>สังคมศึกษาฯ</option>
                <option>ภาษาต่างประเทศ</option>
                <option>สุขศึกษาและพลศึกษา</option>
                <option>ศิลปะ</option>
                <option>การงานอาชีพ</option>
                <option>กิจกรรมพัฒนาผู้เรียน</option>
              </select>
            </div>
            <div>
              <label class="label">บทบาทในกลุ่มสาระ</label>
              <select v-model="form.group_role" class="input-field">
                <option value="">ครูทั่วไป</option>
                <option value="หัวหน้ากลุ่มสาระ">หัวหน้ากลุ่มสาระ</option>
                <option value="รองหัวหน้ากลุ่มสาระ">รองหัวหน้ากลุ่มสาระ</option>
              </select>
            </div>
          </div>

          <!-- ติดต่อ -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">เบอร์โทรศัพท์</label>
              <input v-model="form.phone" type="tel" class="input-field" placeholder="08X-XXX-XXXX" />
            </div>
            <div>
              <label class="label">อีเมล (บัญชี login)</label>
              <input :value="user?.email" type="email"
                class="input-field bg-gray-50 text-gray-400 cursor-not-allowed" disabled
                title="อีเมลผูกกับบัญชี login ไม่สามารถเปลี่ยนได้" />
            </div>
          </div>

          <!-- งานบริหาร -->
          <div class="bg-indigo-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-semibold text-indigo-800">🏢 งานบริหาร</p>
              <button type="button" @click="addDeptRow"
                class="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors">
                + เพิ่มกลุ่ม
              </button>
            </div>
            <div v-if="!deptAssignments.length" class="text-xs text-indigo-400 text-center py-2">
              ยังไม่ได้กำหนดงานบริหาร
            </div>
            <div v-for="(row, idx) in deptAssignments" :key="idx" class="flex items-center gap-2 mb-2">
              <select v-model="row.department_name" class="input-field flex-1 text-sm">
                <option value="">-- เลือกกลุ่ม --</option>
                <option v-for="d in adminDepartments" :key="d" :value="d">{{ d }}</option>
              </select>
              <select v-model="row.department_role" class="input-field w-44 text-sm">
                <option value="ผู้อำนวยการโรงเรียน">ผู้อำนวยการโรงเรียน</option>
                <option value="รองผู้อำนวยการโรงเรียน">รองผู้อำนวยการโรงเรียน</option>
                <option value="หัวหน้ากลุ่ม">หัวหน้ากลุ่ม</option>
                <option value="รองหัวหน้ากลุ่ม">รองหัวหน้ากลุ่ม</option>
                <option value="เลขานุการ">เลขานุการ</option>
                <option value="กรรมการ">กรรมการ</option>
              </select>
              <button type="button" @click="deptAssignments.splice(idx,1)"
                class="p-1.5 rounded-lg text-indigo-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0">✕</button>
            </div>
          </div>

          <!-- วุฒิการศึกษา -->
          <div class="bg-amber-50 rounded-xl p-4">
            <p class="text-sm font-semibold text-amber-800 mb-3">🎓 วุฒิการศึกษา</p>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="label">ระดับการศึกษา</label>
                <select v-model="form.education_level" class="input-field">
                  <option value="">— ไม่ระบุ —</option>
                  <option>ต่ำกว่าปริญญาตรี</option>
                  <option>ปริญญาตรี</option>
                  <option>ปริญญาโท</option>
                  <option>ปริญญาเอก</option>
                </select>
              </div>
              <div>
                <label class="label">สาขาวิชา</label>
                <input v-model="form.education_major" type="text" class="input-field" placeholder="เช่น คณิตศาสตร์" />
              </div>
              <div>
                <label class="label">สถาบัน</label>
                <input v-model="form.education_institution" type="text" class="input-field" placeholder="เช่น ม.ราชภัฏ..." />
              </div>
            </div>
          </div>

          <!-- วิชาที่สอน -->
          <div>
            <label class="label">วิชาที่สอน</label>
            <input v-model="form.subjects_taught" type="text" class="input-field"
              placeholder="เช่น คณิตศาสตร์พื้นฐาน, แคลคูลัส" />
          </div>

          <!-- เว็บไซต์/ผลงาน -->
          <div>
            <label class="label">🌐 เว็บไซต์หรือผลงานของคุณ</label>
            <input v-model="form.website_url" type="url" class="input-field"
              placeholder="https://sites.google.com/..." />
            <p class="text-xs text-gray-400 mt-1">จะแสดงปุ่ม "เยี่ยมชมผลงาน" บนการ์ดในหน้าสาธารณะ</p>
          </div>

          <div v-if="!teacherProfileId" class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
            ⚠️ ยังไม่พบข้อมูลโปรไฟล์ครู — กรุณารอให้ Admin อนุมัติบัญชีก่อน
          </div>

          <button @click="save" :disabled="saving || !teacherProfileId"
            class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล' }}
          </button>
        </div>
      </div>

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
import { useSchoolConfig } from '../../composables/useSchoolConfig'
import { supabase } from '../../lib/supabase'

const { user, fetchProfile } = useAuth()
const { config } = useSchoolConfig()

const DEFAULT_DEPTS = ['กลุ่มบริหารวิชาการ','กลุ่มบริหารงบประมาณ','กลุ่มบริหารงานบุคคล','กลุ่มบริหารทั่วไป']
const adminDepartments = computed(() =>
  Array.isArray(config.value?.admin_departments) && config.value.admin_departments.length
    ? config.value.admin_departments : DEFAULT_DEPTS
)

const teacherProfileId = ref(null)
const saving           = ref(false)
const toast            = ref('')
const deptAssignments  = ref([])
let toastTimer = null

const form = ref({
  prefix: 'นาย', first_name: '', last_name: '',
  position: 'ครู', academic_standing: '', subject_group: '', group_role: '',
  phone: '', subjects_taught: '', website_url: '',
  education_level: '', education_major: '', education_institution: '',
  profile_image_url: '',
})

const displayName = computed(() =>
  `${form.value.prefix || ''}${form.value.first_name || ''} ${form.value.last_name || ''}`.trim()
)

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}

function addDeptRow() {
  deptAssignments.value.push({ department_name: '', department_role: 'กรรมการ' })
}

async function save() {
  if (!form.value.first_name.trim() || !form.value.last_name.trim())
    return showToast('⚠️ กรุณากรอกชื่อ-นามสกุล')
  saving.value = true

  const { error } = await supabase.from('teacher_profiles').update({
    prefix:                  form.value.prefix,
    first_name:              form.value.first_name.trim(),
    last_name:               form.value.last_name.trim(),
    position:                form.value.position        || null,
    academic_standing:       form.value.academic_standing || null,
    subject_group:           form.value.subject_group   || null,
    group_role:              form.value.group_role       || null,
    phone:                   form.value.phone            || null,
    subjects_taught:         form.value.subjects_taught  || null,
    education_level:         form.value.education_level  || null,
    education_major:         form.value.education_major  || null,
    education_institution:   form.value.education_institution || null,
    website_url:             form.value.website_url      || null,
    profile_image_url:       form.value.profile_image_url || null,
  }).eq('id', teacherProfileId.value)

  if (!error) {
    // บันทึก dept assignments
    await supabase.from('teacher_department_assignments').delete().eq('teacher_id', teacherProfileId.value)
    const validDepts = deptAssignments.value.filter(d => d.department_name?.trim())
    if (validDepts.length) {
      await supabase.from('teacher_department_assignments').insert(
        validDepts.map(d => ({
          teacher_id:      teacherProfileId.value,
          department_name: d.department_name,
          department_role: d.department_role || 'กรรมการ',
        }))
      )
    }
    // refresh profile ที่ header ให้อัปเดตรูปทันที
    await fetchProfile()
    showToast('✅ บันทึกแล้ว')
  } else {
    showToast('❌ บันทึกไม่สำเร็จ: ' + error.message)
  }
  saving.value = false
}

onMounted(async () => {
  if (!user.value) return

  // ค้นหาด้วย id (auto-created เมื่ออนุมัติ) หรือ profile_id (แบบเก่า)
  let data = null
  const byId = await supabase.from('teacher_profiles').select('*').eq('id', user.value.id).maybeSingle()
  if (byId.data) {
    data = byId.data
  } else {
    const byProfileId = await supabase.from('teacher_profiles').select('*').eq('profile_id', user.value.id).maybeSingle()
    data = byProfileId.data
  }
  if (!data) return

  teacherProfileId.value = data.id
  form.value = {
    prefix:                data.prefix                || 'นาย',
    first_name:            data.first_name            || '',
    last_name:             data.last_name             || '',
    position:              data.position              || 'ครู',
    academic_standing:     data.academic_standing     || '',
    subject_group:         data.subject_group         || '',
    group_role:            data.group_role            || '',
    phone:                 data.phone                 || '',
    subjects_taught:       data.subjects_taught       || '',
    education_level:       data.education_level       || '',
    education_major:       data.education_major       || '',
    education_institution: data.education_institution || '',
    website_url:           data.website_url           || '',
    profile_image_url:     data.profile_image_url     || '',
  }

  // โหลด dept assignments
  const { data: depts } = await supabase
    .from('teacher_department_assignments')
    .select('department_name, department_role')
    .eq('teacher_id', teacherProfileId.value)
  deptAssignments.value = depts || []
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>
