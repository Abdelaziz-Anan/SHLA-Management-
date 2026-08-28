import { getGroupStudentsWithDetails } from './student-service';
import { store } from '@/lib/store';
import { getFinanceSummary } from './finance-service';

export function getOutstandingDebtorsReport() {
  const allStudents = getGroupStudentsWithDetails();
  return allStudents
    .filter(gs => (gs.remaining_balance || 0) > 0)
    .sort((a, b) => (b.remaining_balance || 0) - (a.remaining_balance || 0));
}

export function getGroupRevenueReport() {
  const groups = store.getGroups();
  const allGroupStudents = getGroupStudentsWithDetails();

  return groups.map(g => {
    const studentsInGroup = allGroupStudents.filter(gs => gs.group_id === g.id);
    const totalCollected = studentsInGroup.reduce((sum, gs) => sum + (gs.total_paid || 0), 0);
    const totalOutstanding = studentsInGroup.reduce((sum, gs) => sum + (gs.remaining_balance || 0), 0);
    const expectedTotal = studentsInGroup.length * g.course_price;

    return {
      group: g,
      student_count: studentsInGroup.length,
      expected_total: expectedTotal,
      total_collected: totalCollected,
      total_outstanding: totalOutstanding,
    };
  });
}

export function exportToCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
