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
  Shield,
  Phone,
  Mail,
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>{t('إدارة حسابات المستخدمين وكلمات المرور', 'User Accounts & Passwords Management')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              'إعادة تسمية المستخدمين، تعديل كلمات المرور، وإضافة وتفعيل الحسابات',
              'Edit names, change passwords, manage roles, and activate/deactivate accounts'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة مساعد جديد', 'Add New Assistant')}</span>
        </button>
      </div>

      {/* DUAL VIEW: MOBILE CARDS + DESKTOP TABLE */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* MOBILE CARDS VIEW */}
        <div className="block md:hidden divide-y divide-slate-100">
          {users.map(u => (
            <div key={u.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900">{u.full_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                  {u.phone && (
                    <p className="text-xs text-slate-600 font-semibold mt-0.5" dir="ltr">
                      {u.phone}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={u.role} type="user" />
                  {u.is_active ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>نشط</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>معطل</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="flex-1 py-2 px-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-bold text-xs border border-purple-200 flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات وكلمة السر</span>
                </button>

                <button
                  onClick={() => handleToggle(u.id)}
                  className={`py-2 px-4 rounded-xl font-bold text-xs border ${
                    u.is_active
                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {u.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md text-slate-500 font-bold border-b border-slate-200/80 z-10 shadow-2xs">
              <tr>
                <th className="p-4">{t('اسم المستخدم', 'User Name')}</th>
                <th className="p-4">{t('البريد الإلكتروني', 'Email')}</th>
                <th className="p-4">{t('رقم الهاتف', 'Phone')}</th>
                <th className="p-4">{t('الدور', 'Role')}</th>
                <th className="p-4">{t('الحالة', 'Status')}</th>
                <th className="p-4">{t('آخر تسجيل دخول', 'Last Login')}</th>
                <th className="p-4 text-left">{t('الإجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-50/90 transition-colors even:bg-slate-50/40 ${
                    u.role === 'manager' ? 'border-r-4 border-r-purple-500' : 'border-r-4 border-r-blue-500'
                  }`}
                >
                  <td className="p-4 font-black text-slate-900">{u.full_name}</td>
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
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-bold text-[11px] border border-purple-200 flex items-center gap-1 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t('تعديل وكلمة السر', 'Edit')}</span>
                    </button>
                    <button
                      onClick={() => handleToggle(u.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border ${
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

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-600" />
                <span>{t('تعديل الحساب وكلمة المرور', 'Edit Account & Password')}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              {editError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('البريد الإلكتروني *', 'Email *')}</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('رقم الهاتف', 'Phone')}</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Password change field */}
              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                <label className="block font-bold text-purple-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('تغيير كلمة المرور للحساب', 'Change Account Password')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="اكتب كلمة سر جديدة..."
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    className="w-full pr-3 pl-10 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('الدور والصلاحيات', 'Role')}</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="assistant">مساعد بالسنتر (Assistant)</option>
                  <option value="manager">مدير السنتر (Manager - كامل الصلاحيات)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/25 active:scale-98"
                >
                  حفظ البيانات وكلمة السر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                <span>{t('إضافة مساعد جديد للسنتر', 'Add New Center Assistant')}</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('الاسم بالكامل *', 'Full Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ريم أحمد"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('البريد الإلكتروني / اسم الدخول *', 'Email / Username *')}</label>
                <input
                  type="email"
                  required
                  placeholder="assistant@center.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('رقم الهاتف', 'Phone')}</label>
                <input
                  type="text"
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('كلمة المرور الأولية *', 'Password *')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pr-3 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/25 active:scale-98"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
