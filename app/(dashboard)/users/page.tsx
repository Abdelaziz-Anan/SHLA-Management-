'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, createUser, toggleUserStatus, updateUserProfile } from '@/services/user-service';
import { UserProfile, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { useLanguage } from '@/lib/language-context';
import {
  UserCheck,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // New User Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('assistant');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Edit User Form State
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('assistant');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState('');

  const loadData = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email) {
      setError(t('يرجى ملء الاسم والبريد الإلكتروني', 'Please enter name and email'));
      return;
    }

    try {
      createUser({
        full_name: fullName,
        email,
        phone,
        password,
        role,
      });

      setIsCreateModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      loadData();
      alert(t('تم إنشاء الحساب بنجاح', 'User account created successfully'));
    } catch (err: any) {
      setError(err.message || t('فشل إضافة حساب المستخدَم', 'Failed to add user'));
    }
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editingUser) return;

    if (!editFullName || !editEmail) {
      setEditError(t('يرجى كتابة الاسم والبريد الإلكتروني', 'Please enter name and email'));
      return;
    }

    try {
      updateUserProfile(editingUser.id, {
        full_name: editFullName,
        email: editEmail,
        phone: editPhone,
        password: editPassword,
        role: editRole,
      });

      setEditingUser(null);
      loadData();
      alert(t('تم تحديث بيانات الحساب وكلمة المرور بنجاح', 'Account details and password updated successfully'));
    } catch (err: any) {
      setEditError(err.message || t('فشل تحديث البيانات', 'Failed to update user'));
    }
  };

  const handleToggle = (userId: string) => {
    try {
      toggleUserStatus(userId);
      loadData();
    } catch (e: any) {
      alert(e.message || 'تعذر تغيير حالة الحساب');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-purple-600" />
            <span>{t('إدارة حسابات المستخدمين وكلمات المرور', 'User Accounts & Passwords Management')}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t(
              'إعادة تسمية المستخدمين، تعديل كلمات المرور، إضافة وتفعيل وتجميد الحسابات',
              'Edit names, change passwords, manage roles, and activate/deactivate accounts'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{t('إضافة مساعد جديد', 'Add New Assistant')}</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">{t('اسم المستخدم / المحاضر', 'User Name')}</th>
                <th className="p-4">{t('البريد الإلكتروني / الدخول', 'Email / Username')}</th>
                <th className="p-4">{t('رقم الهاتف', 'Phone')}</th>
                <th className="p-4">{t('الدور / الصلاحية', 'Role')}</th>
                <th className="p-4">{t('الحالة', 'Status')}</th>
                <th className="p-4">{t('آخر تسجيل دخول', 'Last Login')}</th>
                <th className="p-4 text-left">{t('الإجراءات والتعديل', 'Actions & Edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-extrabold text-slate-900">{u.full_name}</td>
                  <td className="p-4 font-medium text-slate-600">{u.email}</td>
                  <td className="p-4 font-semibold text-slate-700" dir="ltr">{u.phone || '-'}</td>
                  <td className="p-4">
                    <StatusBadge status={u.role} type="user" />
                  </td>
                  <td className="p-4">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('نشط', 'Active')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('معطل', 'Disabled')}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(u.last_login || '') || t('لم يدخل بعد', 'Never')}</td>
                  <td className="p-4 text-left flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px] border border-purple-200 flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t('تعديل البيانات وكلمة السر', 'Edit Details & Password')}</span>
                    </button>
                    <button
                      onClick={() => handleToggle(u.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] border ${
                        u.is_active
                          ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {u.is_active ? t('تعطيل', 'Disable') : t('تفعيل', 'Activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT USER MODAL (INCLUDES PASSWORD CHANGE FIELD) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" />
                <span>{t('تعديل الحساب وكلمة المرور', 'Edit Account & Password')}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-6 space-y-4 text-xs">
              {editError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {editError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('اسم المستخدم (الظاهر بالنظام) *', 'User Display Name *')}</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  placeholder="مثال: د / سمر حمدي"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('البريد الإلكتروني / اسم الدخول *', 'Email / Username *')}</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Password Edit Field */}
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <label className="block font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-600" />
                  <span>{t('تغيير كلمة المرور (Password)', 'Change Password')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder={t('أدخل كلمة المرور الجديدة...', 'Type new password...')}
                    className="w-full pr-3 pl-10 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-semibold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-purple-700 mt-1 font-medium">
                  {t('اكتب كلمة سر جديدة إذا أردت تغييرها للحساب', 'Type a new password to update account login password')}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('رقم الهاتف', 'Phone Number')}</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('الدور والصلاحية *', 'Role *')}</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="manager">{t('مدير الأكاديمية (Manager) - كامل الصلاحيات', 'Academy Manager - Full Access')}</option>
                  <option value="assistant">{t('مساعد الأكاديمية (Assistant) - صلاحيات محددة', 'Academy Assistant - Limited Access')}</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  {t('حفظ التغييرات وكلمة المرور', 'Save Changes & Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <span>{t('إضافة حساب مستخدم جديد', 'Add New User')}</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('الاسم الكامل *', 'Full Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مريم خالد"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('البريد الإلكتروني / اسم الدخول *', 'Email / Username *')}</label>
                <input
                  type="email"
                  required
                  placeholder="assistant3@center.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('كلمة المرور الحساب (Password)', 'Account Password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-3 pl-10 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('رقم الهاتف', 'Phone')}</label>
                <input
                  type="text"
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('دور وتصنيف الحساب *', 'Role *')}</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="assistant">{t('مساعد السنتر (Assistant) - صلاحيات محددة', 'Assistant')}</option>
                  <option value="manager">{t('مدير السنتر (Manager) - كامل الصلاحيات', 'Manager')}</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  {t('إنشاء الحساب', 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
