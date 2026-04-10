-- Fix: เพิ่ม RLS policies สำหรับ school_config
-- ให้ทุกคนอ่านได้ (สำหรับแสดงหน้าเว็บ) และ admin อัปเดตได้

ALTER TABLE public.school_config ENABLE ROW LEVEL SECURITY;

-- ลบ policy เก่า (ถ้ามี)
DROP POLICY IF EXISTS "school_config: select" ON public.school_config;
DROP POLICY IF EXISTS "school_config: update" ON public.school_config;

-- ทุกคนอ่านได้ (anon + authenticated)
CREATE POLICY "school_config: select" ON public.school_config
  FOR SELECT USING (true);

-- เฉพาะ admin อัปเดตได้
CREATE POLICY "school_config: update" ON public.school_config
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ตรวจสอบ
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'school_config';
