-- ============================================================
-- School Website - Clean Setup SQL
-- รันใน Supabase SQL Editor (ลบข้อมูลเก่าและสร้างใหม่)
-- ============================================================

-- Drop tables เก่าก่อน (ถ้ามี)
DROP TABLE IF EXISTS public.activity_images CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teacher_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.school_config CASCADE;

-- Drop functions เก่า
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================================
-- 1. school_config (ข้อมูลโรงเรียน - 1 row)
-- ============================================================
CREATE TABLE public.school_config (
  id                  SERIAL PRIMARY KEY,
  school_code         VARCHAR(20) DEFAULT '',
  name_th             VARCHAR(300) DEFAULT 'โรงเรียนของฉัน',
  name_en             VARCHAR(300) DEFAULT 'My School',
  motto               VARCHAR(300) DEFAULT '',
  address             TEXT DEFAULT '',
  phone               VARCHAR(20) DEFAULT '',
  email               VARCHAR(100) DEFAULT '',
  website             VARCHAR(200) DEFAULT '',
  logo_url            TEXT DEFAULT '',
  director_name       VARCHAR(100) DEFAULT '',
  director_image_url  TEXT DEFAULT '',
  affiliation         VARCHAR(200) DEFAULT 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน',
  area_name           VARCHAR(200) DEFAULT '',
  established_year    INTEGER DEFAULT 2500,
  school_size         VARCHAR(50) DEFAULT 'กลาง',
  banner_images       JSONB DEFAULT '[]',
  social_facebook     VARCHAR(300) DEFAULT '',
  social_line         VARCHAR(300) DEFAULT '',
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ใส่ข้อมูลเริ่มต้น
INSERT INTO public.school_config (id) VALUES (1);

-- ============================================================
-- 2. profiles (บัญชีผู้ใช้)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         VARCHAR(255) UNIQUE NOT NULL,
  full_name     VARCHAR(200) DEFAULT '',
  role          VARCHAR(20) DEFAULT 'pending'
                CHECK (role IN ('admin', 'teacher', 'pending')),
  is_approved   BOOLEAN DEFAULT false,
  avatar_url    TEXT DEFAULT '',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function: ดึง role โดยไม่ recursive
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid(); $$;

-- Policies
CREATE POLICY "profiles: select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "profiles: update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.get_my_role() = 'admin')
  WITH CHECK (id = auth.uid() OR public.get_my_role() = 'admin');

-- Trigger: auto-create profile เมื่อสมัครสมาชิก
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. teacher_profiles (ข้อมูลครูละเอียด)
-- ============================================================
CREATE TABLE public.teacher_profiles (
  id                  UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id         VARCHAR(20) DEFAULT '',
  id_card             VARCHAR(13) DEFAULT '',
  prefix              VARCHAR(20) DEFAULT '',
  first_name          VARCHAR(100) DEFAULT '',
  last_name           VARCHAR(100) DEFAULT '',
  position            VARCHAR(100) DEFAULT '',
  academic_standing   VARCHAR(100) DEFAULT '',
  subject_group       VARCHAR(100) DEFAULT '',
  education_level     VARCHAR(50) DEFAULT '',
  major               VARCHAR(100) DEFAULT '',
  phone               VARCHAR(20) DEFAULT '',
  birth_date          DATE,
  start_date          DATE,
  profile_image_url   TEXT DEFAULT '',
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_profiles: select" ON public.teacher_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "teacher_profiles: insert" ON public.teacher_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "teacher_profiles: update" ON public.teacher_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.get_my_role() = 'admin');

-- ============================================================
-- 4. students (นักเรียน รองรับ import DMC)
-- ============================================================
CREATE TABLE public.students (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id_card       VARCHAR(13) UNIQUE,
  student_code          VARCHAR(20),
  prefix                VARCHAR(20) DEFAULT '',
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  gender                VARCHAR(5) DEFAULT '',
  grade_level           VARCHAR(10) DEFAULT '',
  room                  VARCHAR(10) DEFAULT '',
  birth_date            DATE,
  blood_type            VARCHAR(5) DEFAULT '',
  religion              VARCHAR(50) DEFAULT '',
  ethnicity             VARCHAR(50) DEFAULT '',
  nationality           VARCHAR(50) DEFAULT 'ไทย',
  address_no            VARCHAR(20) DEFAULT '',
  address_moo           VARCHAR(10) DEFAULT '',
  address_road          VARCHAR(100) DEFAULT '',
  address_subdistrict   VARCHAR(100) DEFAULT '',
  address_district      VARCHAR(100) DEFAULT '',
  address_province      VARCHAR(100) DEFAULT '',
  guardian_name         VARCHAR(200) DEFAULT '',
  guardian_phone        VARCHAR(20) DEFAULT '',
  guardian_relationship VARCHAR(50) DEFAULT '',
  father_name           VARCHAR(200) DEFAULT '',
  mother_name           VARCHAR(200) DEFAULT '',
  disadvantaged_status  VARCHAR(200) DEFAULT '',
  profile_image_url     TEXT DEFAULT '',
  is_active             BOOLEAN DEFAULT true,
  academic_year         VARCHAR(10) DEFAULT '',
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students: select" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "students: insert" ON public.students FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY "students: update" ON public.students FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY "students: delete" ON public.students FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- 5. news (ข่าวประชาสัมพันธ์)
-- ============================================================
CREATE TABLE public.news (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(500) NOT NULL,
  content       TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  category      VARCHAR(50) DEFAULT 'news'
                CHECK (category IN ('news', 'announcement', 'award', 'academic')),
  is_published  BOOLEAN DEFAULT true,
  view_count    INTEGER DEFAULT 0,
  created_by    UUID REFERENCES public.profiles(id),
  published_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news: public read" ON public.news FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "news: admin all" ON public.news FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- 6. activities (กิจกรรม)
-- ============================================================
CREATE TABLE public.activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(500) NOT NULL,
  description     TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  images          JSONB DEFAULT '[]',
  activity_date   DATE DEFAULT CURRENT_DATE,
  is_published    BOOLEAN DEFAULT true,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities: public read" ON public.activities FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "activities: admin all" ON public.activities FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_profiles_role        ON public.profiles(role);
CREATE INDEX idx_profiles_is_approved ON public.profiles(is_approved);
CREATE INDEX idx_students_grade       ON public.students(grade_level, room);
CREATE INDEX idx_students_id_card     ON public.students(student_id_card);
CREATE INDEX idx_students_name        ON public.students(first_name, last_name);
CREATE INDEX idx_students_is_active   ON public.students(is_active);
CREATE INDEX idx_news_published       ON public.news(is_published, published_at DESC);
CREATE INDEX idx_activities_published ON public.activities(is_published, created_at DESC);

-- ============================================================
-- Storage Buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',     'avatars',     true, 204800,   ARRAY['image/jpeg','image/png','image/webp']),
  ('school',      'school',      true, 2097152,  ARRAY['image/jpeg','image/png','image/webp']),
  ('news',        'news',        true, 5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('activities',  'activities',  true, 5242880,  ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage: public read" ON storage.objects FOR SELECT TO public USING (true);
CREATE POLICY "storage: auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "storage: auth update" ON storage.objects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "storage: auth delete" ON storage.objects FOR DELETE TO authenticated USING (true);
