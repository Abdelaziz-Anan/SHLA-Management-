-- Complete PostgreSQL Schema for English Center Management System
-- Compatible with Supabase Auth, PostgreSQL 14+, Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('manager', 'assistant');
CREATE TYPE group_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE student_group_status AS ENUM ('active', 'transferred', 'cancelled');
CREATE TYPE payment_status AS ENUM ('valid', 'reversed');
CREATE TYPE owner_type AS ENUM ('manager', 'center', 'other');

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'assistant',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CENTERS TABLE (Branding & info)
CREATE TABLE IF NOT EXISTS public.centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'English Center',
    logo_url TEXT,
    cover_url TEXT,
    phone TEXT,
    address TEXT,
    currency TEXT NOT NULL DEFAULT 'EGP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYMENT ACCOUNTS (Wallets, Center Cash, Bank accounts)
CREATE TABLE IF NOT EXISTS public.payment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL, -- e.g. "Manager Wallet", "Center Cash", "Vodafone Cash 010xxx"
    account_type TEXT NOT NULL DEFAULT 'Wallet', -- Wallet, Cash, Bank, InstaPay
    account_number TEXT,
    owner_type owner_type NOT NULL DEFAULT 'center', -- manager, center, other
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
    group_number TEXT NOT NULL, -- e.g. "291" or "221"
    course_name TEXT NOT NULL,  -- e.g. "E.Faculty" or "E (Adults)"
    level TEXT NOT NULL,        -- e.g. "1"
    trainer_name TEXT NOT NULL, -- e.g. "Dr. Samar"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TEXT NOT NULL,   -- e.g. "07:00 PM"
    end_time TEXT NOT NULL,     -- e.g. "08:30 PM"
    total_sessions INT NOT NULL DEFAULT 8,
    course_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status group_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. GROUP DAYS TABLE (Multiple days per group)
CREATE TABLE IF NOT EXISTS public.group_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL -- e.g. "Sunday", "Wednesday"
);

-- 8. SESSIONS TABLE (Individual class dates)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    session_number INT NOT NULL,
    session_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. GROUP STUDENTS (Enrollments)
CREATE TABLE IF NOT EXISTS public.group_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    booking_method TEXT NOT NULL DEFAULT 'Center', -- Center, V.cash, InstaPay, etc.
    course_price DECIMAL(10,2) NOT NULL,
    status student_group_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, student_id)
);

-- 11. PAYMENTS TABLE (Multiple payments per student enrollment)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_student_id UUID NOT NULL REFERENCES public.group_students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'Cash', -- Cash, Vodafone Cash, InstaPay, Bank Transfer
    receiving_account_id UUID REFERENCES public.payment_accounts(id),
    receipt_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    status payment_status NOT NULL DEFAULT 'valid',
    reversal_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SETTLEMENTS TABLE (Center/Assistant delivering cash to Manager)
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivered_by UUID REFERENCES public.profiles(id),
    received_by UUID REFERENCES public.profiles(id),
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. STUDENT TRANSFERS LOG
CREATE TABLE IF NOT EXISTS public.student_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    from_group_id UUID REFERENCES public.groups(id),
    to_group_id UUID REFERENCES public.groups(id),
    transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    transferred_by UUID REFERENCES public.profiles(id)
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(center_id, key)
);

-- INDEXES FOR FAST PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_groups_number ON public.groups(group_number);
CREATE INDEX IF NOT EXISTS idx_students_phone ON public.students(phone);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_gs ON public.payments(group_student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- POLICIES: Authenticated users can read general operational data
CREATE POLICY "Authenticated profiles read" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manager profiles manage" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
);

CREATE POLICY "Authenticated operational read" ON public.groups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated operational write" ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated operational update" ON public.groups FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated students read" ON public.students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated students write" ON public.students FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated students update" ON public.students FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated group_students all" ON public.group_students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated payments all" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated payment_accounts read" ON public.payment_accounts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated settlements read" ON public.settlements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manager settlements manage" ON public.settlements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
);

CREATE POLICY "Authenticated audit read" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
);
CREATE POLICY "System insert audit" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
