import { formatCurrency, formatDate } from './utils';
import { GroupStudent, Payment, Group, Settlement, AuditLog } from '@/types';

/**
 * Generic CSV Exporter with UTF-8 BOM for flawless Arabic text in Excel
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    alert('لا توجد بيانات لتصديرها');
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.map(k => `"${k.replace(/"/g, '""')}"`).join(separator) +
    '\r\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            if (cell instanceof Date) {
              cell = cell.toLocaleDateString('ar-EG');
            } else {
              cell = cell.toString();
            }
            cell = cell.replace(/"/g, '""');
            return `"${cell}"`;
          })
          .join(separator);
      })
      .join('\r\n');

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) needed by Excel to render Arabic cleanly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export Students Directory to CSV
 */
export function exportStudentsToCSV(students: GroupStudent[]) {
  const rows = students.map((gs, idx) => ({
    '#': idx + 1,
    'اسم الطالب': gs.student?.full_name || '-',
    'رقم الهاتف': gs.student?.phone || '-',
    'المجموعة': `مجموعة #${gs.group?.group_number || '-'} (${gs.group?.course_name || '-'})`,
    'المحاضر': gs.group?.trainer_name || '-',
    'سعر الكورس (ج.م)': gs.course_price || 0,
    'المسدد (ج.م)': gs.total_paid || 0,
    'المتبقي (ج.م)': gs.remaining_balance || 0,
    'حالة السداد': gs.payment_status || 'Not Paid',
    'وسيلة الحجز': gs.booking_method || '-',
    'تاريخ الحجز': formatDate(gs.booking_date),
    'ملاحظات': gs.notes || '-',
  }));

  exportToCSV('SHLA_دليل_الطلاب', rows);
}

/**
 * Export Group Enrolled Students to CSV
 */
export function exportGroupStudentsToCSV(group: Group, students: GroupStudent[]) {
  const rows = students.map((gs, idx) => ({
    '#': idx + 1,
    'اسم الطالب': gs.student?.full_name || '-',
    'رقم الهاتف': gs.student?.phone || '-',
    'تاريخ الحجز': formatDate(gs.booking_date),
    'وسيلة الحجز': gs.booking_method || '-',
    'محفظة/حساب الاستلام': gs.receiving_account_number || 'خزينة السنتر',
    'المسدد (ج.م)': gs.total_paid || 0,
    'المتبقي (ج.م)': gs.remaining_balance || 0,
    'الحالة المالية': gs.payment_status || 'Not Paid',
    'الإيصال المرفق': gs.payments?.[0]?.receipt_url ? 'يوجد إيصال' : 'لا يوجد إيصال',
  }));

  exportToCSV(`SHLA_طلاب_مجموعة_${group.group_number}`, rows);
}

/**
 * Export Payments / Transactions to CSV
 */
export function exportPaymentsToCSV(payments: any[]) {
  const rows = payments.map((p, idx) => ({
    '#': idx + 1,
    'معرف العملية': `#${p.id.slice(-6)}`,
    'اسم الطالب': p.groupStudent?.student?.full_name || 'طالب',
    'رقم الهاتف': p.groupStudent?.student?.phone || '-',
    'المجموعة': `مجموعة #${p.groupStudent?.group?.group_number || '-'}`,
    'المبلغ المدفوع (ج.م)': p.amount,
    'تاريخ الدفع': formatDate(p.payment_date),
    'طريقة الدفع': p.payment_method,
    'جهة الاستلام': p.custom_receiving_account || p.receiving_account?.account_name || 'خزينة السنتر',
    'حالة المعاملة': p.status === 'valid' ? 'معتمدة' : 'ملغاة/مصححة',
    'يوجد إيصال': p.receipt_url ? 'نعم' : 'لا',
    'ملاحظات': p.notes || '-',
  }));

  exportToCSV('SHLA_سجل_المدفوعات', rows);
}

/**
 * Export Groups Directory to CSV
 */
export function exportGroupsToCSV(groups: Group[]) {
  const rows = groups.map((g, idx) => ({
    '#': idx + 1,
    'رقم المجموعة': g.group_number,
    'اسم الكورس': g.course_name,
    'المستوى': g.level,
    'المحاضر': g.trainer_name,
    'الأيام': g.days?.join(' - ') || '-',
    'الميعاد': `${g.start_time} - ${g.end_time}`,
    'تاريخ البدء': formatDate(g.start_date),
    'عدد المحاضرات': g.total_sessions,
    'سعر الكورس (ج.م)': g.course_price,
    'عدد الطلاب المسجلين': g.student_count || 0,
    'حالة المجموعة': g.status === 'active' ? 'نشطة' : g.status === 'completed' ? 'مكتملة' : 'مؤرشفة',
    'ملاحظات': g.notes || '-',
  }));

  exportToCSV('SHLA_قائمة_المجموعات', rows);
}

/**
 * Export Financial Settlements to CSV
 */
export function exportSettlementsToCSV(settlements: Settlement[]) {
  const rows = settlements.map((s, idx) => ({
    '#': idx + 1,
    'معرف التسليم': `#${s.id.slice(-6)}`,
    'تاريخ ووقت التسليم': formatDate(s.settlement_date),
    'المبلغ المسلم للمدير (ج.م)': s.amount,
    'المسلم': s.delivered_by_name || s.delivered_by || 'السنتر',
    'المستلم': s.received_by_name || s.received_by || 'محفظة المدير',
    'ملاحظات التسليم': s.notes || '-',
  }));

  exportToCSV('SHLA_تسليمات_الخزينة_للمدير', rows);
}

/**
 * Export Audit Logs to CSV
 */
export function exportAuditLogsToCSV(logs: AuditLog[]) {
  const rows = logs.map((l, idx) => ({
    '#': idx + 1,
    'المستخدم': l.user_name || 'النظام',
    'الحدث / الحركة': l.action,
    'نوع الكيان': l.entity_type,
    'معرف الكيان': l.entity_id || '-',
    'التاريخ والوقت': new Date(l.created_at).toLocaleString('ar-EG'),
    'البيانات': l.new_data ? JSON.stringify(l.new_data) : '-',
  }));

  exportToCSV('SHLA_سجل_عمليات_النظام', rows);
}
