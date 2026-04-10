-- รันหลังจาก setup.sql และสร้าง user ใน Supabase Auth แล้ว
-- เปลี่ยน email เป็น email ของ admin ที่สร้างไว้

-- ตรวจสอบ profile
SELECT id, email, role, is_approved FROM public.profiles WHERE email = 'admin@school.go.th';

-- อัปเดตเป็น admin
UPDATE public.profiles
SET role = 'admin', is_approved = true, full_name = 'ผู้ดูแลระบบ'
WHERE email = 'admin@school.go.th';

-- ถ้าไม่มี profile (กรณี trigger ไม่ทำงาน)
INSERT INTO public.profiles (id, email, role, is_approved, full_name)
SELECT id, email, 'admin', true, 'ผู้ดูแลระบบ'
FROM auth.users WHERE email = 'admin@school.go.th'
ON CONFLICT (id) DO UPDATE SET role = 'admin', is_approved = true;
