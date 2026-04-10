import { ref, readonly } from 'vue'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from '../lib/supabase'

const config = ref(null)
const loading = ref(false)

export function useSchoolConfig() {
  async function fetchConfig() {
    loading.value = true
    try {
      const { data } = await supabase
        .from('school_config')
        .select('*')
        .eq('id', 1)
        .single()
      config.value = data
    } catch (e) {
      console.error('fetchConfig error:', e)
    } finally {
      loading.value = false
    }
  }

  async function updateConfig(updates) {
    // ตัด field ที่ไม่ควร update ออก
    const { id, created_at, ...safeUpdates } = updates
    safeUpdates.updated_at = new Date().toISOString()

    // ดึง token ผ่าน getSession (auto-refresh ถ้าหมดอายุ)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) throw new Error('ไม่พบ session กรุณา login ใหม่')

    // ใช้ fetch โดยตรงแทน supabase client (หลีกเลี่ยงปัญหา lock)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/school_config?id=eq.1`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(safeUpdates),
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`บันทึกไม่สำเร็จ (${res.status}): ${errText}`)
    }
    await fetchConfig()
  }

  const schoolName = () => config.value?.name_th || 'โรงเรียน'
  const logoUrl = () => config.value?.logo_url || ''
  const banners = () => config.value?.banner_images || []

  return {
    config: readonly(config),
    loading: readonly(loading),
    fetchConfig,
    updateConfig,
    schoolName,
    logoUrl,
    banners,
  }
}
