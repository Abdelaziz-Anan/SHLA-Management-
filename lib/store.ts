import { 
  UserProfile, CenterInfo, PaymentAccount, Group, GroupSession, 
  Student, GroupStudent, Payment, Settlement, AuditLog, FinanceSummary 
} from '@/types';

// Default 3 Seed User Accounts
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-manager-1',
    full_name: 'د. سمر حمدي - مدير الأكاديمية (Manager)',
    email: 'manager@center.com',
    phone: '01000000001',
    role: 'manager',
    is_active: true,
    last_login: new Date().toISOString(),
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'usr-assistant-1',
    full_name: 'مساعد 1 - ريم (Assistant 1)',
    email: 'assistant1@center.com',
    phone: '01000000002',
    role: 'assistant',
    is_active: true,
    last_login: new Date().toISOString(),
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'usr-assistant-2',
    full_name: 'مساعد 2 - عمر (Assistant 2)',
    email: 'assistant2@center.com',
    phone: '01000000003',
    role: 'assistant',
    is_active: true,
    last_login: new Date().toISOString(),
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
];

// Default Center Branding
export const INITIAL_CENTER: CenterInfo = {
  id: 'center-1',
  name: 'Samar Hamdy Language Academy (SHLA)',
  logo_url: '',
  cover_url: '',
  phone: '01012345678',
  address: 'القاهرة - مصر',
  currency: 'EGP',
  created_at: '2026-08-01T10:00:00Z',
  updated_at: '2026-08-01T10:00:00Z',
};

// Payment Destinations & Accounts
export const INITIAL_ACCOUNTS: PaymentAccount[] = [
  {
    id: 'acc-mgr-wallet',
    center_id: 'center-1',
    account_name: 'Manager Wallet (محفظة المدير)',
    account_type: 'Vodafone Cash',
    account_number: '01011112222',
    owner_type: 'manager',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'acc-center-cash',
    center_id: 'center-1',
    account_name: 'Center Desk Cash (خزينة السنتر)',
    account_type: 'Cash Desk',
    account_number: 'Center Desk',
    owner_type: 'center',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'acc-center-instapay',
    center_id: 'center-1',
    account_name: 'Center InstaPay (إنستاباي السنتر)',
    account_type: 'InstaPay',
    account_number: 'center@instapay',
    owner_type: 'center',
    is_active: true,
    created_at: '2026-08-01T10:00:00Z',
  },
];

// Group 221 (From WhatsApp Paper Sheet)
export const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp-221',
    center_id: 'center-1',
    group_number: '221',
    course_name: 'E (Adults)',
    level: 'Level 1',
    trainer_name: 'Dr. Samar',
    start_date: '2025-10-01',
    end_date: '2025-11-01',
    start_time: '07:00 PM',
    end_time: '08:30 PM',
    total_sessions: 8,
    course_price: 540,
    status: 'active',
    notes: 'Sunday - Wednesday Group [7:00 - 8:30 PM]',
    days: ['Sunday', 'Wednesday'],
    created_by: 'usr-manager-1',
    created_at: '2025-09-25T10:00:00Z',
    updated_at: '2025-09-25T10:00:00Z',
    student_count: 18,
  },
  {
    id: 'grp-291',
    center_id: 'center-1',
    group_number: '291',
    course_name: 'E.Faculty',
    level: 'Level 1',
    trainer_name: 'Dr. Samar',
    start_date: '2026-08-01',
    end_date: '2026-09-01',
    start_time: '05:00 PM',
    end_time: '06:30 PM',
    total_sessions: 8,
    course_price: 600,
    status: 'active',
    notes: 'Sunday - Wednesday Group',
    days: ['Sunday', 'Wednesday'],
    created_by: 'usr-manager-1',
    created_at: '2026-07-28T10:00:00Z',
    updated_at: '2026-07-28T10:00:00Z',
    student_count: 5,
  }
];

// Sessions for Group 221
export const INITIAL_SESSIONS: GroupSession[] = [
  { id: 'ses-221-1', group_id: 'grp-221', session_number: 1, session_date: '2025-10-01', status: 'completed' },
  { id: 'ses-221-2', group_id: 'grp-221', session_number: 2, session_date: '2025-10-05', status: 'completed' },
  { id: 'ses-221-3', group_id: 'grp-221', session_number: 3, session_date: '2025-10-08', status: 'completed' },
  { id: 'ses-221-4', group_id: 'grp-221', session_number: 4, session_date: '2025-10-12', status: 'scheduled' },
  { id: 'ses-221-5', group_id: 'grp-221', session_number: 5, session_date: '2025-10-15', status: 'scheduled' },
  { id: 'ses-221-6', group_id: 'grp-221', session_number: 6, session_date: '2025-10-19', status: 'scheduled' },
  { id: 'ses-221-7', group_id: 'grp-221', session_number: 7, session_date: '2025-10-22', status: 'scheduled' },
  { id: 'ses-221-8', group_id: 'grp-221', session_number: 8, session_date: '2025-10-26', status: 'scheduled' },
];

// Sample Students from WhatsApp image
export const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', center_id: 'center-1', full_name: 'Esraa Ossama', phone: '01024274489', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-2', center_id: 'center-1', full_name: 'Salma Mahmoud', phone: '01030616460', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-3', center_id: 'center-1', full_name: 'Mohamed Ali', phone: '0103088199', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-4', center_id: 'center-1', full_name: 'Kareman Refaat', phone: '01013927000', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-5', center_id: 'center-1', full_name: 'Rana Tarek', phone: '01092041302', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-6', center_id: 'center-1', full_name: 'Youssef Alaa', phone: '01098662000', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-7', center_id: 'center-1', full_name: 'Menna Mostafa', phone: '01154761713', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-8', center_id: 'center-1', full_name: 'Bassmah Ahmed', phone: '01025660975', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-9', center_id: 'center-1', full_name: 'Abdelrahman Mostafa', phone: '01015005529', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-10', center_id: 'center-1', full_name: 'Marwa Radwan', phone: '01010464494', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-11', center_id: 'center-1', full_name: 'Mohamed Abdelbaset', phone: '01147367220', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-12', center_id: 'center-1', full_name: 'Rana Mohamed', phone: '01002493953', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-13', center_id: 'center-1', full_name: 'Esraa Essam', phone: '01008962638', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-14', center_id: 'center-1', full_name: 'Aya Hashem', phone: '01094002273', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-15', center_id: 'center-1', full_name: 'Toga Mohamed', phone: '01005188504', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-16', center_id: 'center-1', full_name: 'Salma Hossam', phone: '01069689291', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-17', center_id: 'center-1', full_name: 'Shrouk Mantaser', phone: '01019677896', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'std-18', center_id: 'center-1', full_name: 'Bassmala Abdelrazek', phone: '01090553130', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
];

// Initial Group Enrollment (GroupStudent) & Payments based on paper sheet values
export const INITIAL_GROUP_STUDENTS: GroupStudent[] = [
  { id: 'gs-1', group_id: 'grp-221', student_id: 'std-1', booking_date: '2025-09-28', booking_method: 'Center', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-2', group_id: 'grp-221', student_id: 'std-2', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-3', group_id: 'grp-221', student_id: 'std-3', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-4', group_id: 'grp-221', student_id: 'std-4', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-5', group_id: 'grp-221', student_id: 'std-5', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-6', group_id: 'grp-221', student_id: 'std-6', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-7', group_id: 'grp-221', student_id: 'std-7', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-8', group_id: 'grp-221', student_id: 'std-8', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-9', group_id: 'grp-221', student_id: 'std-9', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-10', group_id: 'grp-221', student_id: 'std-10', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-11', group_id: 'grp-221', student_id: 'std-11', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-12', group_id: 'grp-221', student_id: 'std-12', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-13', group_id: 'grp-221', student_id: 'std-13', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-14', group_id: 'grp-221', student_id: 'std-14', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-15', group_id: 'grp-221', student_id: 'std-15', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-16', group_id: 'grp-221', student_id: 'std-16', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-17', group_id: 'grp-221', student_id: 'std-17', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'gs-18', group_id: 'grp-221', student_id: 'std-18', booking_date: '2025-09-28', booking_method: 'V.cash', course_price: 540, status: 'active', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
];

// Initial payments based on paper image values (300 EGP for Esraa, 500 EGP for the rest)
export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'pay-1', group_student_id: 'gs-1', amount: 300, payment_date: '2025-09-28', payment_method: 'Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-2', group_student_id: 'gs-2', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-3', group_student_id: 'gs-3', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-mgr-wallet', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-4', group_student_id: 'gs-4', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-mgr-wallet', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-5', group_student_id: 'gs-5', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-6', group_student_id: 'gs-6', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-7', group_student_id: 'gs-7', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-8', group_student_id: 'gs-8', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-mgr-wallet', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-9', group_student_id: 'gs-9', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-10', group_student_id: 'gs-10', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-11', group_student_id: 'gs-11', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-12', group_student_id: 'gs-12', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-13', group_student_id: 'gs-13', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-mgr-wallet', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-14', group_student_id: 'gs-14', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-15', group_student_id: 'gs-15', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-mgr-wallet', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-16', group_student_id: 'gs-16', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-17', group_student_id: 'gs-17', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
  { id: 'pay-18', group_student_id: 'gs-18', amount: 500, payment_date: '2025-09-28', payment_method: 'Vodafone Cash', receiving_account_id: 'acc-center-cash', created_by: 'usr-assistant-1', status: 'valid', created_at: '2025-09-28T10:00:00Z', updated_at: '2025-09-28T10:00:00Z' },
];

export const INITIAL_SETTLEMENTS: Settlement[] = [
  {
    id: 'stl-1',
    center_id: 'center-1',
    amount: 3000,
    settlement_date: '2025-10-02',
    delivered_by: 'usr-assistant-1',
    delivered_by_name: 'ريم (Assistant 1)',
    received_by: 'usr-manager-1',
    received_by_name: 'د. سمر حمدي (Manager)',
    notes: 'تسليم جزء من نقدية خزينة السنتر للمدير',
    created_at: '2025-10-02T12:00:00Z',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'usr-manager-1',
    user_name: 'دكتور أحمد (Manager)',
    action: 'تأسيس المجموعة 221',
    entity_type: 'Group',
    entity_id: 'grp-221',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'log-2',
    user_id: 'usr-assistant-1',
    user_name: 'ريم (Assistant 1)',
    action: 'إضافة دفعة مالية بقيمة 500 EGP',
    entity_type: 'Payment',
    entity_id: 'pay-2',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

// Helper Local Storage State Management Engine
class SystemStore {
  private isBrowser = typeof window !== 'undefined';

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    try {
      const item = localStorage.getItem(`center_sys_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(`center_sys_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // Users
  getUsers(): UserProfile[] {
    return this.getItem('users', INITIAL_USERS);
  }
  saveUsers(users: UserProfile[]) {
    this.setItem('users', users);
  }

  // Center Info
  getCenter(): CenterInfo {
    return this.getItem('center', INITIAL_CENTER);
  }
  saveCenter(center: CenterInfo) {
    this.setItem('center', center);
  }

  // Accounts
  getAccounts(): PaymentAccount[] {
    return this.getItem('accounts', INITIAL_ACCOUNTS);
  }
  saveAccounts(accounts: PaymentAccount[]) {
    this.setItem('accounts', accounts);
  }

  // Groups
  getGroups(): Group[] {
    return this.getItem('groups', INITIAL_GROUPS);
  }
  saveGroups(groups: Group[]) {
    this.setItem('groups', groups);
  }

  // Group Sessions
  getSessions(): GroupSession[] {
    return this.getItem('sessions', INITIAL_SESSIONS);
  }
  saveSessions(sessions: GroupSession[]) {
    this.setItem('sessions', sessions);
  }

  // Students
  getStudents(): Student[] {
    return this.getItem('students', INITIAL_STUDENTS);
  }
  saveStudents(students: Student[]) {
    this.setItem('students', students);
  }

  // Group Students (Enrollments)
  getGroupStudents(): GroupStudent[] {
    return this.getItem('group_students', INITIAL_GROUP_STUDENTS);
  }
  saveGroupStudents(gs: GroupStudent[]) {
    this.setItem('group_students', gs);
  }

  // Payments
  getPayments(): Payment[] {
    return this.getItem('payments', INITIAL_PAYMENTS);
  }
  savePayments(payments: Payment[]) {
    this.setItem('payments', payments);
  }

  // Settlements
  getSettlements(): Settlement[] {
    return this.getItem('settlements', INITIAL_SETTLEMENTS);
  }
  saveSettlements(settlements: Settlement[]) {
    this.setItem('settlements', settlements);
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.getItem('audit_logs', INITIAL_AUDIT_LOGS);
  }
  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.setItem('audit_logs', [newLog, ...logs]);
  }

  // Reset to initial demo state if needed
  resetToInitial() {
    if (!this.isBrowser) return;
    localStorage.removeItem('center_sys_users');
    localStorage.removeItem('center_sys_center');
    localStorage.removeItem('center_sys_accounts');
    localStorage.removeItem('center_sys_groups');
    localStorage.removeItem('center_sys_sessions');
    localStorage.removeItem('center_sys_students');
    localStorage.removeItem('center_sys_group_students');
    localStorage.removeItem('center_sys_payments');
    localStorage.removeItem('center_sys_settlements');
    localStorage.removeItem('center_sys_audit_logs');
  }
}

export const store = new SystemStore();
