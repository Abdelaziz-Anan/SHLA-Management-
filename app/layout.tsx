import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام إدارة السنتر | English Center Management System',
  description: 'نظام إلكتروني متكامل لإدارة مجموعات ومدفوعات وحسابات سنتر اللغة الإنجليزية',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'نظام السنتر',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full bg-slate-50">
      <body className="h-full font-sans antialiased text-slate-900 bg-slate-50 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
