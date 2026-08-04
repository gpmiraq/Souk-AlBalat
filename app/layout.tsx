import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';

export const metadata: Metadata = {
  title: 'سوق البالات | متجر هجين لبضائع وأوتلت أمازون بالمفرد',
  description: 'منصة إلكترونية هجينة مخصصة لبيع بضائع واستوكات أمازون (البالات والراجعات) بالمفرد بأفضل الأسعار وبأعلى موثوقية في العراق.',
  keywords: ['أمازون', 'ستوكات', 'بالة', 'عراق', 'بغداد', 'أوتلت', 'أجهزة كهرومنزلية', 'سماعات', 'Open Box'],
  openGraph: {
    title: 'سوق البالات | متجر هجين لبضائع أمازون',
    description: 'خصومات تصل إلى 60% على بضائع واستوكات أمازون الأصلية مع ضمان الفحص والطلب المباشر عبر الواتساب.',
    siteName: 'سوق البالات',
    locale: 'ar_IQ',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0F172A" />
      </head>
      <body className="bg-slate-50 dark:bg-carbon-950 text-slate-900 dark:text-white min-h-screen flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
