import { Student, GroupStudent, BookingMethod, StudentTransfer, Payment } from '@/types';
import { store } from '@/lib/store';
import { getPaymentStatus } from '@/lib/utils';
import { getCurrentUser } from './auth-service';

export function checkPhoneDuplicate(phone: string): Student | null {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return null;
  const students = store.getStudents();
  return students.find(s => s.phone.trim() === cleanPhone) || null;
}

export function getGroupStudentsWithDetails(groupId?: string, search?: string): GroupStudent[] {
  let groupStudents = store.getGroupStudents();
  const students = store.getStudents();
  const groups = store.getGroups();
  const payments = store.getPayments().filter(p => p.status === 'valid');
  const accounts = store.getAccounts();

  if (groupId) {
    groupStudents = groupStudents.filter(gs => gs.group_id === groupId && gs.status === 'active');
  } else {
    groupStudents = groupStudents.filter(gs => gs.status === 'active');
  }

  // Populate details & dynamic calculations
  const detailed = groupStudents.map(gs => {
    const student = students.find(s => s.id === gs.student_id);
    const group = groups.find(g => g.id === gs.group_id);
    const studentPayments = payments
      .filter(p => p.group_student_id === gs.id)
      .map(p => {
        const acc = accounts.find(a => a.id === p.receiving_account_id);
        return { ...p, receiving_account: acc };
      });

    const total_paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining_balance = Math.max(0, gs.course_price - total_paid);
    const payment_status = getPaymentStatus(gs.course_price, total_paid);
    const receivingAcc = studentPayments[0]?.receiving_account;
    const receiving_account_number = receivingAcc
      ? `${receivingAcc.account_number || receivingAcc.account_name}`
      : '-';

    return {
      ...gs,
      student,
      group,
      payments: studentPayments,
      total_paid,
      remaining_balance,
      receiving_account_number,
      payment_status,
    };
  });

  if (search) {
    const term = search.trim().toLowerCase();
    return detailed.filter(
      gs =>
        (gs.student && gs.student.full_name.toLowerCase().includes(term)) ||
        (gs.student && gs.student.phone.includes(term)) ||
        (gs.group && gs.group.group_number.includes(term)) ||
        (gs.group && gs.group.course_name.toLowerCase().includes(term))
    );
  }

  return detailed;
}

export function getGroupStudentById(id: string): GroupStudent | null {
  const list = getGroupStudentsWithDetails();
  return list.find(gs => gs.id === id) || null;
}

export function addStudentToGroup(data: {
  full_name: string;
  phone: string;
  group_id: string;
  booking_date?: string;
  booking_method: BookingMethod;
  initial_payment?: {
    amount: number;
    payment_method: any;
    receiving_account_id: string;
    receipt_url?: string;
    notes?: string;
  };
  notes?: string;
}): GroupStudent {
  const currentUser = getCurrentUser();
  const center = store.getCenter();
  const groups = store.getGroups();
  const targetGroup = groups.find(g => g.id === data.group_id);

  if (!targetGroup) throw new Error('المجموعة غير موجودة');

  // 1. Find or create student
  let students = store.getStudents();
  let student = students.find(s => s.phone.trim() === data.phone.trim());

  if (!student) {
    student = {
      id: `std-${Date.now()}`,
      center_id: center.id,
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    students = [student, ...students];
    store.saveStudents(students);
  }

  // 2. Check existing active enrollment in same group
  const groupStudents = store.getGroupStudents();
  const existingEnrollment = groupStudents.find(
    gs => gs.group_id === data.group_id && gs.student_id === student!.id && gs.status === 'active'
  );

  if (existingEnrollment) {
    throw new Error('الطالب مسجل بالفعل في هذه المجموعة');
  }

  // 3. Create GroupStudent record
  const newGroupStudent: GroupStudent = {
    id: `gs-${Date.now()}`,
    group_id: data.group_id,
    student_id: student.id,
    booking_date: data.booking_date || new Date().toISOString().split('T')[0],
    booking_method: data.booking_method,
    course_price: targetGroup.course_price,
    status: 'active',
    notes: data.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.saveGroupStudents([newGroupStudent, ...groupStudents]);

  // 4. Record initial payment if provided
  if (data.initial_payment && data.initial_payment.amount > 0) {
    const payments = store.getPayments();
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      group_student_id: newGroupStudent.id,
      amount: data.initial_payment.amount,
      payment_date: data.booking_date || new Date().toISOString().split('T')[0],
      payment_method: data.initial_payment.payment_method,
      receiving_account_id: data.initial_payment.receiving_account_id,
      receipt_url: data.initial_payment.receipt_url,
      created_by: currentUser?.id,
      status: 'valid',
      notes: data.initial_payment.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.savePayments([newPayment, ...payments]);
  }

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `إضافة الطالب "${student.full_name}" إلى المجموعة رقم #${targetGroup.group_number}`,
    entity_type: 'Student',
    entity_id: student.id,
    new_data: newGroupStudent,
  });

  return newGroupStudent;
}

export function updateStudentEnrollmentDetails(
  groupStudentId: string,
  updates: {
    full_name?: string;
    phone?: string;
    booking_date?: string;
    booking_method?: BookingMethod;
    receiving_account_id?: string;
  }
): void {
  const currentUser = getCurrentUser();
  const groupStudents = store.getGroupStudents();
  const index = groupStudents.findIndex(gs => gs.id === groupStudentId);

  if (index === -1) throw new Error('تسجيل الطالب غير موجود');

  const gs = groupStudents[index];

  // 1. Update Student record
  if (updates.full_name || updates.phone) {
    const students = store.getStudents();
    const stdIndex = students.findIndex(s => s.id === gs.student_id);
    if (stdIndex !== -1) {
      const student = students[stdIndex];
      if (updates.full_name) student.full_name = updates.full_name.trim();
      if (updates.phone) student.phone = updates.phone.trim();
      student.updated_at = new Date().toISOString();
      students[stdIndex] = student;
      store.saveStudents(students);
    }
  }

  // 2. Update GroupStudent record
  if (updates.booking_date) gs.booking_date = updates.booking_date;
  if (updates.booking_method) gs.booking_method = updates.booking_method;
  gs.updated_at = new Date().toISOString();

  groupStudents[index] = gs;
  store.saveGroupStudents(groupStudents);

  // 3. Update Payments receiving account if provided
  if (updates.receiving_account_id) {
    const payments = store.getPayments();
    const studentPayments = payments.filter(p => p.group_student_id === groupStudentId && p.status === 'valid');
    studentPayments.forEach(p => {
      p.receiving_account_id = updates.receiving_account_id;
      p.updated_at = new Date().toISOString();
    });
    store.savePayments(payments);
  }

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تعديل بيانات سطر الطالب الحجز والهاتف المكتمل`,
    entity_type: 'StudentEnrollmentEdit',
    entity_id: groupStudentId,
  });
}

export function transferStudentGroup(
  groupStudentId: string,
  newGroupId: string,
  reason: string
): void {
  const currentUser = getCurrentUser();
  const groupStudents = store.getGroupStudents();
  const index = groupStudents.findIndex(gs => gs.id === groupStudentId);

  if (index === -1) throw new Error('تسجيل الطالب غير موجود');

  const oldEnrollment = groupStudents[index];
  const oldGroupId = oldEnrollment.group_id;

  if (oldGroupId === newGroupId) {
    throw new Error('الطالب موجود بالفعل في نفس المجموعة المحول إليها');
  }

  const groups = store.getGroups();
  const newGroup = groups.find(g => g.id === newGroupId);
  if (!newGroup) throw new Error('المجموعة الجديدة غير موجودة');

  // Mark old enrollment transferred
  oldEnrollment.status = 'transferred';
  oldEnrollment.updated_at = new Date().toISOString();

  // Create new active enrollment
  const newEnrollment: GroupStudent = {
    id: `gs-${Date.now()}`,
    group_id: newGroupId,
    student_id: oldEnrollment.student_id,
    booking_date: new Date().toISOString().split('T')[0],
    booking_method: oldEnrollment.booking_method,
    course_price: newGroup.course_price,
    status: 'active',
    notes: `نقل من المجموعة #${oldGroupId}: ${reason}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  groupStudents[index] = oldEnrollment;
  store.saveGroupStudents([newEnrollment, ...groupStudents]);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `نقل الطالب إلى المجموعة رقم #${newGroup.group_number} (السبب: ${reason})`,
    entity_type: 'StudentTransfer',
    entity_id: oldEnrollment.student_id,
  });
}
