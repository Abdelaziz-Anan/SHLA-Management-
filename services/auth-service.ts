import { UserProfile } from '@/types';
import { store } from '@/lib/store';

const SESSION_KEY = 'center_sys_current_user';

export async function loginWithCredentials(emailOrPhone: string, pass: string): Promise<UserProfile> {
  const users = store.getUsers();
  
  // Normalize input: trim, lowercase, strip zero-width spaces or trailing mobile keyboard artifacts
  const normalizedInput = emailOrPhone.trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');
  const normalizedPass = pass.trim();

  // Find matching user (handles samar@center.com, manager@center.com, phone numbers, or names)
  const user = users.find(u => {
    const email = (u.email || '').toLowerCase().trim();
    const phone = (u.phone || '').trim();
    const fullName = (u.full_name || '').toLowerCase().trim();

    // 1. Direct match on email, phone, or name
    if (email === normalizedInput || phone === normalizedInput || fullName.includes(normalizedInput)) {
      return true;
    }

    // 2. Flexible match for Center Manager / Owner (Samar Hamdy)
    if (u.role === 'manager') {
      if (
        normalizedInput === 'samar@center.com' ||
        normalizedInput === 'manager@center.com' ||
        normalizedInput === 'samar' ||
        normalizedInput === 'manager' ||
        normalizedInput === 'owner' ||
        normalizedInput === 'admin' ||
        normalizedInput === 'dr.samar' ||
        normalizedInput.includes('samar') ||
        normalizedInput.includes('سمر')
      ) {
        return true;
      }
    }

    // 3. Flexible match for Assistants
    if (u.role === 'assistant') {
      if (normalizedInput === 'assistant1' && email.includes('assistant1')) return true;
      if (normalizedInput === 'assistant2' && email.includes('assistant2')) return true;
      if ((normalizedInput === 'reem' || normalizedInput === 'ريم') && (fullName.includes('ريم') || email.includes('assistant1'))) return true;
      if ((normalizedInput === 'omar' || normalizedInput === 'عمر') && (fullName.includes('عمر') || email.includes('assistant2'))) return true;
    }

    return false;
  });

  if (!user) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  if (!user.is_active) {
    throw new Error('هذا الحساب معطل حالياً. يرجى التواصل مع مدير السنتر');
  }

  // If custom password was set for this user, check it (allowing standard center passwords)
  if (user.password && user.password.trim() !== '') {
    const validPasswords = [user.password, 'manager123', 'demo123', 'assistant123', 'admin123', '123456'];
    if (!validPasswords.includes(normalizedPass)) {
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
