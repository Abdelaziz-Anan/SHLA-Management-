export type UserRole = 'manager' | 'assistant';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CenterInfo {
  id: string;
  name: string;
  logo_url?: string;
  cover_url?: string;
  phone?: string;
  address?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export type OwnerType = 'manager' | 'center' | 'other';

export interface PaymentAccount {
  id: string;
  center_id: string;
  account_name: string;
  account_type: string;
  account_number?: string;
  owner_type: OwnerType;
  is_active: boolean;
  created_at: string;
}

export type GroupStatus = 'active' | 'completed' | 'archived';

export interface Group {
  id: string;
  center_id: string;
  group_number: string;
  course_name: string;
  level: string;
  trainer_name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  total_sessions: number;
  course_price: number;
  status: GroupStatus;
  notes?: string;
  days?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  student_count?: number;
}

export interface GroupSession {
  id: string;
  group_id: string;
  session_number: number;
  session_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Student {
  id: string;
  center_id: string;
  full_name: string;
  phone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BookingMethod = 'Center' | 'V.cash' | 'InstaPay' | 'Bank Transfer' | 'Other';
export type PaymentMethod = 'Cash' | 'Vodafone Cash' | 'InstaPay' | 'Bank Transfer' | 'Other';

export interface GroupStudent {
  id: string;
  group_id: string;
  student_id: string;
  booking_date: string;
  booking_method: BookingMethod;
  course_price: number;
  status: 'active' | 'transferred' | 'cancelled';
  notes?: string;
  student?: Student;
  group?: Group;
  payments?: Payment[];
  total_paid?: number;
  remaining_balance?: number;
  payment_status?: 'Not Paid' | 'Partially Paid' | 'Fully Paid' | 'Overpaid';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  group_student_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  receiving_account_id?: string;
  receiving_account?: PaymentAccount;
  receipt_url?: string;
  created_by?: string;
  created_by_name?: string;
  status: 'valid' | 'reversed';
  reversal_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Settlement {
  id: string;
  center_id: string;
  amount: number;
  settlement_date: string;
  delivered_by: string;
  delivered_by_name?: string;
  received_by: string;
  received_by_name?: string;
  proof_url?: string;
  notes?: string;
  created_at: string;
}

export interface StudentTransfer {
  id: string;
  student_id: string;
  from_group_id?: string;
  to_group_id?: string;
  transfer_date: string;
  reason?: string;
  transferred_by?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
}

export interface FinanceSummary {
  total_collected: number;
  received_by_manager: number;
  received_by_center: number;
  total_settled_to_manager: number;
  remaining_with_center: number;
  total_outstanding_students: number;
  payment_count: number;
  student_count: number;
  group_count: number;
}
