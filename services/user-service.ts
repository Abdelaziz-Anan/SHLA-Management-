import { UserProfile, UserRole } from '@/types';
import { store } from '@/lib/store';
import { getCurrentUser } from './auth-service';

export function getUsers(): UserProfile[] {
  return store.getUsers();
}

export function createUser(data: {
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
}): UserProfile {
  const currentUser = getCurrentUser();
  const users = store.getUsers();

  const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
  if (existing) {
    throw new Error('اسم المستخدم / البريد الإلكتروني موجود بالفعل');
  }

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    full_name: data.full_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim(),
    password: data.password ? data.password.trim() : undefined,
    role: data.role,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.saveUsers([...users, newUser]);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `إضافة مستخدم جديد: ${newUser.full_name} (دور: ${newUser.role})`,
    entity_type: 'User',
    entity_id: newUser.id,
    new_data: newUser,
  });

  return newUser;
}

export function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: UserRole;
  }
): UserProfile {
  const currentUser = getCurrentUser();
  const users = store.getUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) throw new Error('المستخدم غير موجود');

  const oldUser = users[index];
  const updatedUser: UserProfile = {
    ...oldUser,
    full_name: updates.full_name !== undefined ? updates.full_name : oldUser.full_name,
    email: updates.email !== undefined ? updates.email : oldUser.email,
    phone: updates.phone !== undefined ? updates.phone : oldUser.phone,
    password: updates.password && updates.password.trim() !== '' ? updates.password.trim() : oldUser.password,
    role: updates.role !== undefined ? updates.role : oldUser.role,
    updated_at: new Date().toISOString(),
  };

  users[index] = updatedUser;
  store.saveUsers(users);

  // If currentUser edited themselves, update session
  if (currentUser && currentUser.id === userId) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('center_sys_current_user', JSON.stringify(updatedUser));
    }
  }

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تعديل بيانات/كلمة سر الحساب: ${updatedUser.full_name} (${updatedUser.email})`,
    entity_type: 'UserUpdate',
    entity_id: userId,
    old_data: oldUser,
    new_data: updatedUser,
  });

  return updatedUser;
}

export function toggleUserStatus(userId: string): UserProfile {
  const currentUser = getCurrentUser();
  const users = store.getUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) throw new Error('المستخدم غير موجود');

  const target = users[index];

  // Prevent disabling the main manager if it's the only manager
  if (target.role === 'manager' && target.is_active) {
    const activeManagers = users.filter(u => u.role === 'manager' && u.is_active);
    if (activeManagers.length <= 1) {
      throw new Error('لا يمكن تعطيل حساب المدير الرئيسي الوحيد في النظام');
    }
  }

  target.is_active = !target.is_active;
  target.updated_at = new Date().toISOString();
  users[index] = target;

  store.saveUsers(users);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `${target.is_active ? 'تفعيل' : 'تعطيل'} حساب المستخدم: ${target.full_name}`,
    entity_type: 'User',
    entity_id: userId,
  });

  return target;
}

export function updateUserRole(userId: string, newRole: UserRole): UserProfile {
  const currentUser = getCurrentUser();
  const users = store.getUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) throw new Error('المستخدم غير موجود');

  const target = users[index];
  target.role = newRole;
  target.updated_at = new Date().toISOString();

  users[index] = target;
  store.saveUsers(users);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تعديل صلاحيات المستخدم ${target.full_name} إلى ${newRole}`,
    entity_type: 'UserPermission',
    entity_id: userId,
  });

  return target;
}
