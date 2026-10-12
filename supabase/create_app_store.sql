-- =========================================================
-- SHLA Management System - Cloud Realtime Synchronization Table
-- =========================================================

-- 1. Create the central app_store table
CREATE TABLE IF NOT EXISTS public.app_store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable public read and write access for authorized clients
ALTER TABLE public.app_store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to app_store" ON public.app_store;
CREATE POLICY "Allow all access to app_store"
ON public.app_store
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Enable Realtime broadcast so mobile & laptop sync instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_store;

-- 4. Seed the current users (matching your laptop state)
INSERT INTO public.app_store (key, value, updated_at)
VALUES (
    'users',
    '[
      {
        "id": "usr-manager-1",
        "full_name": "د / سمر حمدي مدير (SHLA (Dr. Samar Hamdy)",
        "email": "samar@manager.com",
        "phone": "01066383920",
        "role": "manager",
        "is_active": true,
        "created_at": "2026-08-01T10:00:00Z",
        "updated_at": "2026-08-01T10:00:00Z"
      },
      {
        "id": "usr-assistant-1",
        "full_name": "Merihan",
        "email": "merihan@academy.com",
        "phone": "01000000002",
        "role": "assistant",
        "is_active": true,
        "created_at": "2026-08-01T10:00:00Z",
        "updated_at": "2026-08-01T10:00:00Z"
      },
      {
        "id": "usr-assistant-2",
        "full_name": "Noran",
        "email": "noran@academy.com",
        "phone": "01000000003",
        "role": "assistant",
        "is_active": true,
        "created_at": "2026-08-01T10:00:00Z",
        "updated_at": "2026-08-01T10:00:00Z"
      }
    ]'::jsonb,
    NOW()
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
