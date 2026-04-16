-- ─── Postgres RPC: get_api_data ─────────────────────────────────────────────
-- เรียกผ่าน: GET /rest/v1/rpc/get_api_data?p_api_key=sk_xxx&apikey=<anon_key>

-- ─── 1. View สำหรับ teacher_profiles (รวม columns ที่เปิดให้ API ดึงได้) ──────
-- teacher_profiles มี email column ของตัวเองอยู่แล้ว ไม่ต้อง JOIN profiles
CREATE OR REPLACE VIEW public.teacher_data_view AS
SELECT
  tp.id,
  tp.employee_id,
  tp.id_card,
  tp.prefix,
  tp.first_name,
  tp.last_name,
  tp.email,
  tp.phone,
  tp.position,
  tp.academic_standing,
  tp.subject_group,
  tp.subjects_taught,
  tp.group_role,
  tp.education_level,
  tp.education_major,
  tp.education_institution,
  tp.website_url,
  tp.profile_image_url,
  tp.birth_date,
  tp.created_at,
  tp.updated_at
FROM public.teacher_profiles tp;

-- ─── 2. RPC Function ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_api_data(p_api_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec    api_keys%ROWTYPE;
  v_fields text;
  v_result jsonb;
BEGIN
  -- ตรวจสอบ key
  SELECT * INTO v_rec
  FROM api_keys
  WHERE api_key   = p_api_key
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid or expired API key');
  END IF;

  -- สร้าง field list
  v_fields := array_to_string(v_rec.fields, ', ');

  -- ดึงข้อมูลตาม resource
  IF v_rec.resource = 'teachers' THEN
    -- ใช้ view ที่รวม email จาก profiles แล้ว
    EXECUTE format(
      'SELECT jsonb_agg(row_to_json(t))
       FROM (SELECT %s FROM teacher_data_view ORDER BY subject_group, first_name) t',
      v_fields
    ) INTO v_result;

  ELSIF v_rec.resource = 'students' THEN
    EXECUTE format(
      'SELECT jsonb_agg(row_to_json(t))
       FROM (SELECT %s FROM students ORDER BY grade_level, room, first_name) t',
      v_fields
    ) INTO v_result;

  ELSE
    RETURN jsonb_build_object('error', 'Unknown resource: ' || v_rec.resource);
  END IF;

  RETURN jsonb_build_object(
    'success',  true,
    'resource', v_rec.resource,
    'fields',   to_jsonb(v_rec.fields),
    'count',    jsonb_array_length(COALESCE(v_result, '[]'::jsonb)),
    'data',     COALESCE(v_result, '[]'::jsonb)
  );
END;
$$;

-- อนุญาตให้ anon เรียกใช้ได้ (ตรวจ api_key เองข้างใน)
GRANT EXECUTE ON FUNCTION public.get_api_data(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_api_data(text) TO authenticated;
