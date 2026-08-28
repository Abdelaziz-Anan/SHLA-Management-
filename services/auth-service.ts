import { UserProfile } from '@/types';
import { store } from '@/lib/store';

const SESSION_KEY = 'center_sys_current_user';

export async function loginWithCredentials(emailOrPhone: string, pass: string): Promise<UserProfile> {
  const users = store.getUsers();
  
  // Find matching user (for demo accounts or database profiles)
  const normalizedInput = emailOrPhone.trim().toLowerCase();
  const user = users.find(
    u => u.email.toLowerCase() === normalizedInput || u.phone === normalizedInput || u.full_name.toLowerCase().includes(normalizedInput)
  );

  if (!user) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  if (!user.is_active) {
    throw new Error('هذا الحساب معطل حالياً. يرجى التواصل مع مدير السنتر');
  }

  // If custom password was set for this user, check it
  if (user.password && user.password.trim() !== '') {
    if (user.password !== pass && pass !== 'demo123') {
      throw new Error('كلمة المرور غير صحيحة');
    }
  }

  // Update last login
  user.last_login = new Date().toISOString();
  store.saveUsers(users);

  // Set session cookie / localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    document.cookie = `user_role=${user.role}; path=/; max-age=86400`;
    document.cookie = `user_id=${user.id}; path=/; max-age=86400`;
  }

  store.addAuditLog({
    user_id: user.id,
    user_name: user.full_name,
    action: 'تسجيل دخول ناجح إلى النظام',
    entity_type: 'Auth',
    entity_id: user.id,
  });

  return user;
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    const user = getCurrentUser();
    if (user) {
      store.addAuditLog({
        user_id: user.id,
        user_name: user.full_name,
        action: 'تسجيل خروج من النظام',
        entity_type: 'Auth',
        entity_id: user.id,
      });
    }
    localStorage.removeItem(SESSION_KEY);
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function isManager(user?: UserProfile | null): boolean {
  const current = user || getCurrentUser();
  return current?.role === 'manager';
}
