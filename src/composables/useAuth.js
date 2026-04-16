import { ref, computed, readonly } from 'vue'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from '../lib/supabase'

// ── Shared state ──────────────────────────────────────────────
const user    = ref(null)
const profile = ref(null)
const loading = ref(true)

// ── Auth-ready promise ─────────────────────────────────────────
let _resolveAuthReady
const _authReadyPromise = new Promise(resolve => { _resolveAuthReady = resolve })
let _authInitialized = false

function _markReady() {
  if (!_authInitialized) {
    _authInitialized = true
    _resolveAuthReady()
  }
}

export async function waitForAuth(timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs
  await Promise.race([
    _authReadyPromise,
    new Promise(resolve => setTimeout(resolve, timeoutMs)),
  ])
  while (loading.value && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 30))
  }
}

// ── fetchProfile ด้วย direct fetch (หลีกเลี่ยง auth lock deadlock) ──
async function fetchProfile(accessToken) {
  if (!user.value) { loading.value = false; return }
  loading.value = true

  // รับ token จาก parameter หรือจาก localStorage
  let token = accessToken
  if (!token) {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
      for (const key of keys) {
        const stored = JSON.parse(localStorage.getItem(key) || '{}')
        if (stored.access_token) { token = stored.access_token; break }
      }
    } catch (_) {}
  }

  try {
    if (!token) throw new Error('no token')
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }

    // โหลด profiles
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.value.id}&select=*`,
      { headers }
    )
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    const profileData = Array.isArray(data) && data.length > 0 ? data[0] : null

    // โหลด profile_image_url จาก teacher_profiles (ถ้ามี)
    if (profileData) {
      try {
        const tpRes = await fetch(
          `${SUPABASE_URL}/rest/v1/teacher_profiles?id=eq.${user.value.id}&select=profile_image_url`,
          { headers }
        )
        if (tpRes.ok) {
          const tpData = await tpRes.json()
          if (Array.isArray(tpData) && tpData.length > 0 && tpData[0].profile_image_url) {
            profileData.profile_image_url = tpData[0].profile_image_url
          }
        }
      } catch (_) {}
    }

    profile.value = profileData
  } catch (e) {
    console.error('[fetchProfile]', e.message)
    profile.value = null
  } finally {
    loading.value = false
  }
}

// ── initAuth ──────────────────────────────────────────────────
export function initAuth() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      user.value    = null
      profile.value = null
      loading.value = false
      _markReady()
      return
    }
    if (session?.user) {
      user.value = session.user
      // ส่ง access_token โดยตรง — ไม่ต้องเรียก getSession() ซ้ำ (หลีกเลี่ยง deadlock)
      await fetchProfile(session.access_token)
    } else {
      user.value    = null
      profile.value = null
      loading.value = false
    }
    _markReady()
  })
}

// ── useAuth composable ─────────────────────────────────────────
export function useAuth() {
  const isLoggedIn  = computed(() => !!user.value)
  const isApproved  = computed(() => profile.value?.is_approved === true)
  const isAdmin     = computed(() => profile.value?.role === 'admin' && isApproved.value)
  const isTeacher   = computed(() => profile.value?.role === 'teacher' && isApproved.value)
  const needsAccess = computed(() =>
    !profile.value || !profile.value.is_approved || profile.value.role === 'pending'
  )

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    await fetchProfile(data.session.access_token)
  }

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch (_) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-'))
        .forEach(k => localStorage.removeItem(k))
    } finally {
      user.value    = null
      profile.value = null
    }
  }

  return {
    user:     readonly(user),
    profile:  readonly(profile),
    loading:  readonly(loading),
    isLoggedIn,
    isApproved,
    isAdmin,
    isTeacher,
    needsAccess,
    signIn,
    signUp,
    signOut,
    fetchProfile,
  }
}
