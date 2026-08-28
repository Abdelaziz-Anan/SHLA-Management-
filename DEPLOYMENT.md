# دليل رفع وتشغيل النظام على Vercel و Supabase (Vercel & Supabase Deployment Guide)

تم بناء **نظام إدارة السنتر الرقمي (English Center Management System)** ليعمل بكفاءة عالية على **Vercel** و **Supabase** مجاناً بالكامل وبأعلى درجات الأمان والسرعة.

---

## أولاً: تشغيل المشروع على Vercel للحصول على رابط دائم (Permanent Vercel URL)

للحصول على رابط دائم مثل `https://center-name.vercel.app` يمكنك فتحه من الموبايل أو الآيفون أو أي جهاز في العالم:

### الخطوة 1: رفع الكود على GitHub
1. قم بإنشاء مستودع جديد (Repository) على حسابك في GitHub.
2. ارفع كود المشروع الحالي إلى المستودع.

### الخطوة 2: الربط مع Vercel
1. افتح موقع [Vercel.com](https://vercel.com) وسجل الدخول بحساب GitHub.
2. انقر على **"Add New Project"** واختر المستودع الخاص بالنظام.
3. اضغط **"Deploy"**.

سيقوم Vercel ببناء وتوليد رابط دائم للسنتر خلال دقيقة واحدة!

---

## ثانياً: ربط قاعدة البيانات والملفات بركيزة Supabase (اختياري للإنتاج)

إذا أردت ربط قاعدة بيانات PostgreSQL و Supabase Auth و Storage:

1. أنشئ مشروعاً جديداً مجانياً على [Supabase.com](https://supabase.com).
2. افتح **SQL Editor** في لوحة التحكم وانفذ كود السكريبت الموجود بالملف [`supabase/schema.sql`](file:///e:/Z%20e%20z%20o/S%20system/supabase/schema.sql).
3. انفذ سكريبت البيانات الأولية المرفق بالملف [`supabase/seed.sql`](file:///e:/Z%20e%20z%20o/S%20system/supabase/seed.sql).
4. اضف متغيرات البيئة في لوحة تحكم Vercel (Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## ثالثاً: الحسابات الأولية الجاهزة للاختبار والتسجيل

| الحساب | البريد الإلكتروني | كلمة المرور | الدور والصلاحيات |
| :--- | :--- | :--- | :--- |
| **المدير (Manager)** | `manager@center.com` | `manager123` | مدير السنتر (كامل الصلاحيات والماليات والأدوار) |
| **مساعد 1 (Assistant 1)** | `assistant1@center.com` | `assistant123` | مساعد بالسنتر (تسجيل طلاب، دفعات، إيصالات) |
| **مساعد 2 (Assistant 2)** | `assistant2@center.com` | `assistant123` | مساعد بالسنتر (تسجيل طلاب، دفعات، إيصالات) |

---

## رابعاً: تشغيل المشروع محلياً (Local Development)

لتشغيل السنتر محلياً في جهازك:

```bash
npm run dev
```

ثم افتح المتصفح على: `http://localhost:3000`
