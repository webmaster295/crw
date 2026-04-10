-- ============================================================
-- Migration: ขยาย school_config ให้ครอบคลุม
-- รันใน Supabase SQL Editor
-- ============================================================

ALTER TABLE public.school_config
  -- รหัสสำคัญ (สำหรับส่งออกข้อมูลไปเขตพื้นที่)
  ADD COLUMN IF NOT EXISTS obec_smis_code    VARCHAR(20)  DEFAULT '',  -- รหัส SMIS
  ADD COLUMN IF NOT EXISTS area_code         VARCHAR(10)  DEFAULT '',  -- รหัสเขตพื้นที่
  ADD COLUMN IF NOT EXISTS province_code     VARCHAR(5)   DEFAULT '',  -- รหัสจังหวัด

  -- ข้อมูลสถานศึกษาเพิ่มเติม
  ADD COLUMN IF NOT EXISTS vision            TEXT         DEFAULT '',  -- วิสัยทัศน์
  ADD COLUMN IF NOT EXISTS mission           TEXT         DEFAULT '',  -- พันธกิจ
  ADD COLUMN IF NOT EXISTS school_color      VARCHAR(100) DEFAULT '',  -- สีประจำโรงเรียน
  ADD COLUMN IF NOT EXISTS school_tree       VARCHAR(100) DEFAULT '',  -- ต้นไม้ประจำโรงเรียน
  ADD COLUMN IF NOT EXISTS school_type       VARCHAR(50)  DEFAULT 'รัฐบาล', -- รัฐบาล/เอกชน/ท้องถิ่น
  ADD COLUMN IF NOT EXISTS level_open        VARCHAR(100) DEFAULT '',  -- ระดับที่เปิดสอน เช่น อนุบาล-ป.6
  ADD COLUMN IF NOT EXISTS total_rooms       INTEGER      DEFAULT 0,   -- จำนวนห้องเรียน

  -- ที่ตั้งละเอียด
  ADD COLUMN IF NOT EXISTS address_no        VARCHAR(20)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_moo       VARCHAR(10)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_road      VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_subdistrict VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_district  VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_province  VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS zipcode           VARCHAR(10)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS lat               DECIMAL(10,7) DEFAULT NULL, -- GPS ละติจูด
  ADD COLUMN IF NOT EXISTS lng               DECIMAL(10,7) DEFAULT NULL, -- GPS ลองจิจูด

  -- ผู้บริหาร
  ADD COLUMN IF NOT EXISTS director_prefix   VARCHAR(20)  DEFAULT 'นาย',
  ADD COLUMN IF NOT EXISTS director_phone    VARCHAR(20)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS deputy_directors  JSONB        DEFAULT '[]', -- [{prefix,name,position}]

  -- ติดต่อเพิ่มเติม
  ADD COLUMN IF NOT EXISTS fax               VARCHAR(20)  DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_line       VARCHAR(300) DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_youtube    VARCHAR(300) DEFAULT '';

-- ให้ RLS อ่านได้แบบ public (config ไม่ sensitive)
ALTER TABLE public.school_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_config: public read" ON public.school_config;
DROP POLICY IF EXISTS "school_config: admin update" ON public.school_config;

CREATE POLICY "school_config: public read"
  ON public.school_config FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "school_config: admin update"
  ON public.school_config FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');
