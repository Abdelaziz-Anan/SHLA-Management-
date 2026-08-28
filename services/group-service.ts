import { Group, GroupSession, GroupStatus } from '@/types';
import { store } from '@/lib/store';
import { getCurrentUser } from './auth-service';

export function getGroups(filters?: {
  search?: string;
  status?: GroupStatus;
  trainer?: string;
  course?: string;
}): Group[] {
  let groups = store.getGroups();
  const groupStudents = store.getGroupStudents();

  // Attach student count
  groups = groups.map(g => {
    const count = groupStudents.filter(gs => gs.group_id === g.id && gs.status === 'active').length;
    return { ...g, student_count: count };
  });

  if (!filters) return groups;

  if (filters.status) {
    groups = groups.filter(g => g.status === filters.status);
  }

  if (filters.trainer) {
    groups = groups.filter(g => g.trainer_name.toLowerCase().includes(filters.trainer!.toLowerCase()));
  }

  if (filters.course) {
    groups = groups.filter(g => g.course_name.toLowerCase().includes(filters.course!.toLowerCase()));
  }

  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    groups = groups.filter(
      g =>
        g.group_number.toLowerCase().includes(term) ||
        g.course_name.toLowerCase().includes(term) ||
        g.trainer_name.toLowerCase().includes(term) ||
        (g.notes && g.notes.toLowerCase().includes(term)) ||
        (g.days && g.days.some(d => d.toLowerCase().includes(term)))
    );
  }

  return groups;
}

export function getGroupById(id: string): Group | null {
  const groups = getGroups();
  return groups.find(g => g.id === id) || null;
}

export function getGroupSessions(groupId: string): GroupSession[] {
  const sessions = store.getSessions();
  return sessions
    .filter(s => s.group_id === groupId)
    .sort((a, b) => a.session_number - b.session_number);
}

export function createGroup(groupData: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'center_id'>): Group {
  const currentUser = getCurrentUser();
  const groups = store.getGroups();
  const center = store.getCenter();

  const newGroup: Group = {
    ...groupData,
    id: `grp-${Date.now()}`,
    center_id: center.id,
    created_by: currentUser?.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student_count: 0,
  };

  store.saveGroups([newGroup, ...groups]);

  // Generate sessions automatically
  generateSessionsForGroup(newGroup);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `إنشاء مجموعة جديدة رقم #${newGroup.group_number} (${newGroup.course_name})`,
    entity_type: 'Group',
    entity_id: newGroup.id,
    new_data: newGroup,
  });

  return newGroup;
}

export function updateGroup(id: string, updates: Partial<Group>): Group {
  const currentUser = getCurrentUser();
  const groups = store.getGroups();
  const index = groups.findIndex(g => g.id === id);

  if (index === -1) throw new Error('المجموعة غير موجودة');

  const oldGroup = groups[index];
  const updatedGroup = {
    ...oldGroup,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  groups[index] = updatedGroup;
  store.saveGroups(groups);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تعديل بيانات المجموعة رقم #${updatedGroup.group_number}`,
    entity_type: 'Group',
    entity_id: id,
    old_data: oldGroup,
    new_data: updatedGroup,
  });

  return updatedGroup;
}

export function updateSessionDate(sessionId: string, newDate: string, notes?: string): GroupSession {
  const currentUser = getCurrentUser();
  const sessions = store.getSessions();
  const index = sessions.findIndex(s => s.id === sessionId);

  if (index === -1) throw new Error('المحاضرة غير موجودة');

  const oldSession = sessions[index];
  const updatedSession = {
    ...oldSession,
    session_date: newDate,
    notes: notes !== undefined ? notes : oldSession.notes,
  };

  sessions[index] = updatedSession;
  store.saveSessions(sessions);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تعديل تاريخ المحاضرة رقم ${updatedSession.session_number} إلى ${newDate}`,
    entity_type: 'Session',
    entity_id: sessionId,
    old_data: oldSession,
    new_data: updatedSession,
  });

  return updatedSession;
}

export function generateSessionsForGroup(group: Group): GroupSession[] {
  const sessions: GroupSession[] = [];
  const total = group.total_sessions || 8;
  const startDate = new Date(group.start_date);

  for (let i = 1; i <= total; i++) {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() + (i - 1) * 3.5); // Approx spacing
    const dateStr = sessionDate.toISOString().split('T')[0];

    sessions.push({
      id: `ses-${group.id}-${i}`,
      group_id: group.id,
      session_number: i,
      session_date: dateStr,
      status: 'scheduled',
    });
  }

  const existingSessions = store.getSessions().filter(s => s.group_id !== group.id);
  store.saveSessions([...existingSessions, ...sessions]);

  return sessions;
}
