-- ============================================================
-- แก้ RLS Policy ของ profiles ให้ทำงานถูกต้อง
-- รันใน Supabase SQL Editor
-- ============================================================

-- ลบ policy เดิม
DROP POLICY IF EXISTS "profiles: owner can read own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: owner can update own" ON public.profiles;

-- สร้าง policy ใหม่แบบ simple ไม่ recursive
CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_area'
    )
  );

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: admin update all"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_area'
    )
  );

-- ตรวจสอบว่า admin profile มีอยู่และค่าถูกต้อง
SELECT id, email, role, is_approved, school_id
FROM public.profiles
WHERE email = 'admin@area.go.th';
