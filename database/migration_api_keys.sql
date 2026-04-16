-- ─── API Keys Table ──────────────────────────────────────────────────────────
-- สำหรับระบบ API Builder: เก็บ key + field ที่อนุญาตต่อ endpoint

CREATE TABLE IF NOT EXISTS api_keys (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text        NOT NULL,                          -- ชื่อที่ใช้จำ เช่น "Google Sheets ทะเบียน"
  api_key       text        UNIQUE NOT NULL,                   -- key จริง (เก็บ plain — ควบคุมด้วย RLS)
  resource      text        NOT NULL,                          -- 'teachers' | 'students'
  fields        text[]      NOT NULL DEFAULT '{}',             -- field ที่อนุญาต
  filter_json   jsonb       DEFAULT '{}',                      -- optional filter เช่น {"status":"ปกติ"}
  is_active     boolean     DEFAULT true,
  expires_at    timestamptz,
  last_used_at  timestamptz,
  request_count integer     DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- RLS: เฉพาะ admin เท่านั้น
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys admin only"
  ON api_keys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
        AND is_approved = true
    )
  );
