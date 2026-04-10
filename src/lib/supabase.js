import { createClient } from '@supabase/supabase-js'

// อ่านค่าจาก window (inject โดย GAS) ก่อน แล้วค่อย fallback ไป .env (สำหรับ dev)
const supabaseUrl        = window.__SUPABASE_URL__          || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey    = window.__SUPABASE_KEY__          || import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = window.__SUPABASE_SERVICE_KEY__  || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] ไม่พบ config — กรุณาตั้งค่า Script Properties ใน GAS')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

export const SUPABASE_URL         = supabaseUrl
export const SUPABASE_KEY         = supabaseAnonKey
export const SUPABASE_SERVICE_KEY = supabaseServiceKey
