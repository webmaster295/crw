-- Migration: เพิ่ม TikTok + show/hide flags สำหรับโซเชียลมีเดีย
-- รันใน Supabase SQL Editor

ALTER TABLE public.school_config
  ADD COLUMN IF NOT EXISTS social_tiktok          TEXT,
  ADD COLUMN IF NOT EXISTS show_social_facebook   BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_social_line       BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_social_youtube    BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_social_tiktok     BOOLEAN DEFAULT true;

-- อัปเดตค่าเริ่มต้นให้ row ที่มีอยู่แล้ว
UPDATE public.school_config
SET
  show_social_facebook = COALESCE(show_social_facebook, true),
  show_social_line     = COALESCE(show_social_line, true),
  show_social_youtube  = COALESCE(show_social_youtube, true),
  show_social_tiktok   = COALESCE(show_social_tiktok, true)
WHERE id = 1;

-- ตรวจสอบผลลัพธ์
SELECT
  social_facebook, show_social_facebook,
  social_line,     show_social_line,
  social_youtube,  show_social_youtube,
  social_tiktok,   show_social_tiktok
FROM public.school_config WHERE id = 1;
