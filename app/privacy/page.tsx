'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Lock, Eye, Database, Share2, Shield, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: 'البيانات التي نجمعها',
      content: [
        'الاسم الكامل ورقم الهاتف عند التسجيل',
        'عنوان IP والجهاز المستخدم لكل جلسة دخول',
        'المنتجات التي تم مشاهدتها والبحث عنها',
        'طلبات الحجز والشراء والمدفوعات',
        'موقعك الجغرافي التقريبي (المحافظة) إذا أذنت بذلك',
        'وقت وتاريخ كل عملية دخول وخروج',
      ],
    },
    {
      icon: Eye,
      title: 'كيف نستخدم بياناتك',
      content: [
        'معالجة طلبات الحجز والشراء وتأكيدها',
        'التواصل معك بخصوص طلباتك عبر الواتساب',
        'إرسال عروض ترويجية برضاك المسبق',
        'تحسين تجربة الاستخدام وأداء الموقع',
        'منع الاحتيال وحماية حقوق التجار والزبائن',
        'الامتثال للقوانين والأنظمة المعمول بها',
      ],
    },
    {
      icon: Share2,
      title: 'مشاركة البيانات مع الأطراف الثالثة',
      content: [
        'لا نبيع أي بيانات شخصية لأطراف ثالثة نهائياً',
        'قد نشارك بيانات الطلب مع التاجر المعني فقط',
        'نستخدم خدمات Firebase (Google) لتخزين البيانات بأمان',
        'شركات الشحن تحصل فقط على اسم المستلم والعنوان',
      ],
    },
    {
      icon: Lock,
      title: 'أمان البيانات',
      content: [
        'تشفير SSL/TLS لجميع الاتصالات',
        'تخزين كلمات المرور بتشفير bcrypt آمن',
        'مصادقة ثنائية عبر SMS OTP',
        'مراجعة دورية لصلاحيات الوصول',
        'سجلات تدقيق كاملة لكل عملية',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans" dir="rtl">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <span className="font-black text-white text-lg">سوق البالات</span>
        </Link>
        <ArrowRight className="w-4 h-4 text-slate-500" />
        <span className="text-slate-400 text-sm">سياسة الخصوصية</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold">
            <Shield className="w-4 h-4" />
            آخر تحديث: {new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long' })}
          </div>
          <h1 className="text-3xl font-black text-white">سياسة الخصوصية</h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">نحن ملتزمون بحماية خصوصيتك. هذه السياسة توضح كيفية جمع بياناتك واستخدامها وحمايتها.</p>
        </div>

        <div className="space-y-5">
          {sections.map((section, i) => (
            <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-black text-white">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-white">تواصل معنا بخصوص الخصوصية</h2>
          </div>
          <p className="text-slate-400 text-sm">إذا كانت لديك أي استفسارات حول سياسة الخصوصية أو تريد حذف بياناتك، تواصل معنا عبر الواتساب.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-sm mt-2 hover:bg-amber-400 transition-all">
            تواصل مع الدعم
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/terms" className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-all">شروط الاستخدام</Link>
          <Link href="/" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-sm hover:bg-amber-400 transition-all">العودة للمتجر</Link>
        </div>
      </main>
    </div>
  );
}
