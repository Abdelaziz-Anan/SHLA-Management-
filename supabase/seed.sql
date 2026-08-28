-- Demo & Initial Seed SQL for English Center Management System

-- 1. INSERT MAIN CENTER
INSERT INTO public.centers (id, name, logo_url, cover_url, phone, address, currency)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Samar Hamdy Language Academy (SHLA)',
    '/logo.png',
    '/cover.jpg',
    '01012345678',
    'Cairo, Egypt',
    'EGP'
) ON CONFLICT (id) DO NOTHING;

-- 2. INSERT DEFAULT PAYMENT ACCOUNTS
INSERT INTO public.payment_accounts (id, center_id, account_name, account_type, account_number, owner_type)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Manager Wallet (محفظة المدير)', 'Vodafone Cash', '01011112222', 'manager'),
    ('c2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Center Cash (خزينة السنتر)', 'Cash Desk', 'Center Desk', 'center'),
    ('c3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'InstaPay Center (إنستاباي)', 'InstaPay', 'center@instapay', 'center')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT DEMO GROUP 221 (Based on WhatsApp Image)
INSERT INTO public.groups (
    id, center_id, group_number, course_name, level, trainer_name, 
    start_date, end_date, start_time, end_time, total_sessions, course_price, status, notes
) VALUES (
    'g2212211-2222-2222-2222-222222222221',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '221',
    'E (Adults)',
    'Level 1',
    'Dr. Samar',
    '2025-10-01',
    '2025-11-01',
    '07:00 PM',
    '08:30 PM',
    8,
    540.00,
    'active',
    'Sunday - Wednesday Group'
) ON CONFLICT (id) DO NOTHING;

-- Group Days
INSERT INTO public.group_days (group_id, day_of_week) VALUES
('g2212211-2222-2222-2222-222222222221', 'Sunday'),
('g2212211-2222-2222-2222-222222222221', 'Wednesday')
ON CONFLICT DO NOTHING;

-- Group Sessions
INSERT INTO public.sessions (group_id, session_number, session_date, status) VALUES
('g2212211-2222-2222-2222-222222222221', 1, '2025-10-01', 'completed'),
('g2212211-2222-2222-2222-222222222221', 2, '2025-10-05', 'completed'),
('g2212211-2222-2222-2222-222222222221', 3, '2025-10-08', 'scheduled'),
('g2212211-2222-2222-2222-222222222221', 4, '2025-10-12', 'scheduled'),
('g2212211-2222-2222-2222-222222222221', 5, '2025-10-15', 'scheduled'),
('g2212211-2222-2222-2222-222222222221', 6, '2025-10-19', 'scheduled'),
('g2212211-2222-2222-2222-222222222221', 7, '2025-10-22', 'scheduled'),
('g2212211-2222-2222-2222-222222222221', 8, '2025-10-26', 'scheduled')
ON CONFLICT DO NOTHING;
