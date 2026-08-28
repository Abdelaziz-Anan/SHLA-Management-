import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/language-context';

export const metadata: Metadata = {
  title: 'SHLA Management | Samar Hamdy Language Academy',
  description: 'نظام إلكتروني متكامل لإدارة أكاديمية د/ سمر حمدي - SHLA Management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SHLA Management',
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
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
