'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, createUser, toggleUserStatus, updateUserProfile } from '@/services/user-service';
import { UserProfile, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import {
  UserCheck,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // New User Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('assistant');
  const [error, setError] = useState('');

  // Edit User Form State
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('assistant');
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
      setError('يرجى ملء الاسم والبريد الإلكتروني');
      return;
    }

    try {
      createUser({
        full_name: fullName,
        email,
        phone,
        role,
      });

      setIsCreateModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل إضافة حساب المستخدَم');
    }
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editingUser) return;

    if (!editFullName || !editEmail) {
      setEditError('يرجى كتابة الاسم والبريد الإلكتروني');
      return;
    }

    try {
      updateUserProfile(editingUser.id, {
        full_name: editFullName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
      });

      setEditingUser(null);
      loadData();
      alert('تم تحديث بيانات الحساب بنجاح');
    } catch (err: any) {
      setEditError(err.message || 'فشل تحديث البيانات');
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
            <span>إدارة حسابات المستخدمين والصلاحيات (Manager Only)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إعادة تسمية المستخدمين، تعديل بيانات الدخول، إضافة وتفعيل وتجميد الحسابات
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة مساعد جديد</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">اسم المستخدم / المحاضر</th>
                <th className="p-4">البريد الإلكتروني / الدخول</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4">الدور / الصلاحية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">آخر تسجيل دخول</th>
                <th className="p-4 text-left">الإجراءات والتعديل</th>
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
                        <span>نشط</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>معطل</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(u.last_login || '') || 'لم يدخل بعد'}</td>
                  <td className="p-4 text-left flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px] border border-purple-200 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>تعديل الاسم/البيانات</span>
                    </button>
                    <button
                      onClick={() => handleToggle(u.id)}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border ${
                        u.is_active
                          ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {u.is_active ? 'تعطيل' : 'تفعيل'}
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" />
                <span>تعديل بيانات الحساب والاسم</span>
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
                <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (الظاهر بالنظام) *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  placeholder="مثال: د. سمر حمدي"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني / اسم الدخول *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الدور والصلاحية *</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="manager">مدير الأكاديمية (Manager) - كامل الصلاحيات</option>
                  <option value="assistant">مساعد الأكاديمية (Assistant) - صلاحيات محددة</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  حفظ التغييرات
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
                <span>إضافة حساب مستخدم جديد</span>
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
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
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
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني / اسم الدخول *</label>
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
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">دور وتصنيف الحساب *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="assistant">مساعد السنتر (Assistant) - صلاحيات محددة</option>
                  <option value="manager">مدير السنتر (Manager) - كامل الصلاحيات</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
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
