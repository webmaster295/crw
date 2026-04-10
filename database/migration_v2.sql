-- ============================================================
-- Migration V2: ขยาย students + สร้าง teacher_profiles + Storage
-- รัน SQL นี้ใน Supabase SQL Editor
-- ============================================================

-- 1. ขยายตาราง students ให้รองรับข้อมูลจาก DMC
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_code      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS prefix            VARCHAR(20),
  ADD COLUMN IF NOT EXISTS gender            VARCHAR(5),
  ADD COLUMN IF NOT EXISTS grade_level       VARCHAR(10),
  ADD COLUMN IF NOT EXISTS room              VARCHAR(10),
  ADD COLUMN IF NOT EXISTS birth_date        DATE,
  ADD COLUMN IF NOT EXISTS age               INTEGER,
  ADD COLUMN IF NOT EXISTS weight            DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS height            DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS blood_type        VARCHAR(5),
  ADD COLUMN IF NOT EXISTS religion          VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ethnicity         VARCHAR(50),
  ADD COLUMN IF NOT EXISTS nationality       VARCHAR(50),
  ADD COLUMN IF NOT EXISTS address_no        VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address_moo       VARCHAR(10),
  ADD COLUMN IF NOT EXISTS address_road      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_subdistrict VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_district  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_province  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guardian_prefix   VARCHAR(20),
  ADD COLUMN IF NOT EXISTS guardian_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guardian_last_name  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guardian_occupation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guardian_relationship VARCHAR(50),
  ADD COLUMN IF NOT EXISTS father_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS father_last_name  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS father_occupation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mother_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mother_last_name  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mother_occupation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS disadvantaged_status VARCHAR(200),
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active         BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Index เพิ่มเติมสำหรับ students
CREATE INDEX IF NOT EXISTS idx_students_grade_level   ON public.students(grade_level);
CREATE INDEX IF NOT EXISTS idx_students_id_card       ON public.students(student_id_card);
CREATE INDEX IF NOT EXISTS idx_students_is_active     ON public.students(is_active);
CREATE INDEX IF NOT EXISTS idx_students_name          ON public.students(first_name, last_name);

-- RLS สำหรับ students (INSERT + UPDATE + DELETE)
DROP POLICY IF EXISTS "students: insert" ON public.students;
DROP POLICY IF EXISTS "students: update" ON public.students;
DROP POLICY IF EXISTS "students: delete" ON public.students;

CREATE POLICY "students: insert"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin_area'
    OR (
      public.get_my_role() IN ('admin_school', 'teacher')
      AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "students: update"
  ON public.students FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin_area'
    OR (
      public.get_my_role() IN ('admin_school', 'teacher')
      AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "students: delete"
  ON public.students FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin_area'
    OR (
      public.get_my_role() = 'admin_school'
      AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ============================================================
-- 2. ตาราง teacher_profiles (รายละเอียดครู/บุคลากร)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id                UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id       VARCHAR(20) UNIQUE,
  id_card           VARCHAR(13),
  prefix            VARCHAR(20),
  first_name        VARCHAR(100),
  last_name         VARCHAR(100),
  position          VARCHAR(100),   -- ตำแหน่ง เช่น ครู, รองผู้อำนวยการ
  academic_standing VARCHAR(100),   -- วิทยฐานะ เช่น ครูชำนาญการพิเศษ
  subject_group     VARCHAR(100),   -- กลุ่มสาระการเรียนรู้
  education_level   VARCHAR(50),    -- วุฒิการศึกษา เช่น ปริญญาตรี
  major             VARCHAR(100),   -- สาขาวิชา
  phone             VARCHAR(20),
  birth_date        DATE,
  profile_image_url TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_profiles: select"
  ON public.teacher_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.get_my_role() IN ('admin_area', 'admin_school')
  );

CREATE POLICY "teacher_profiles: insert"
  ON public.teacher_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR public.get_my_role() IN ('admin_area', 'admin_school')
  );

CREATE POLICY "teacher_profiles: update"
  ON public.teacher_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR public.get_my_role() IN ('admin_area', 'admin_school')
  );

-- ============================================================
-- 3. Supabase Storage — bucket "avatars"
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  204800,  -- 200 KB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: auth upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars: auth update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: auth delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
