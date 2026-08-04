'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, FileText, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const termsData = [
  {
    title: '1. قبول الشروط والأحكام',
    content: `باستخدامك لمنصة سوق البالات، فإنك تقر بقراءة هذه الشروط والموافقة عليها بالكامل. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة. نحتفظ بالحق في تعديل هذه الشروط في أي وقت مع إشعار مسبق للمستخدمين المسجلين.`,
  },
  {
    title: '2. التسجيل وإنشاء الحساب',
    content: `يجب أن تكون بالغاً (18 سنة فأكثر) أو بموافقة ولي أمرك. عند التسجيل، أنت ملزم بتقديم معلومات صحيحة وحقيقية. رقم هاتفك هو هويتك الرئيسية ويجب أن يكون رقماً حقيقياً خاصاً بك. المصادقة عبر OTP مطلوبة لتفعيل الحساب. أنت مسؤول عن الحفاظ على سرية بيانات دخولك.`,
  },
  {
    title: '3. حقوق وواجبات التجار',
    content: `يجب أن تكون البضاعة المعروضة حقيقية ومطابقة للصور والوصف بدقة. لا يُسمح بعرض بضائع مسروقة أو مقرصنة أو مزورة. الملابس والأحذية والمستحضرات المعروضة يجب أن تكون جديدة تماماً. الرد على استفسارات الزبائن خلال ساعة واحدة. الإفصاح الكامل عن حالة البضاعة وأي عيوب ظاهرة.`,
  },
  {
    title: '4. حقوق وواجبات الزبائن',
    content: `التحقق من تفاصيل البضاعة قبل الحجز والشراء. الحجز ملزم - في حال عدم الاستلام قد تُطبق رسوم إلغاء. مهلة الحجز المؤقت ساعة واحدة فقط وتنتهي تلقائياً. التواصل المحترم مع التجار واحترام وقتهم. الإبلاغ الفوري عن أي مشكلة في البضاعة عبر زر الإبلاغ.`,
  },
  {
    title: '5. الدفع والمعاملات',
    content: `جميع الأسعار معروضة بالدينار العراقي (IQD). الدفع يتم مباشرة بين الزبون والتاجر - المنصة لا تتوسط في المدفوعات. لا نتحمل مسؤولية النزاعات المالية بين الطرفين بعد إتمام الصفقة. الفواتير والإيصالات مسؤولية التاجر. لا يُسمح بالدفع المسبق إلا عند التأكد من موثوقية التاجر.`,
  },
  {
    title: '6. سياسة الإلغاء والاسترجاع',
    content: `الاسترجاع يخضع لاتفاق التاجر والزبون مباشرة. المنصة توفر وساطة في النزاعات لكن لا تضمن استرجاع المبالغ. في حالة الاحتيال الموثق، قد نوجه لجهات قانونية. العطور والكوزمتك لا تُسترجع بعد الفتح لأسباب صحية وسلامة.`,
  },
  {
    title: '7. المحتوى المحظور',
    content: `يُحظر تماماً عرض: الأسلحة والمتفجرات، المخدرات والمواد المخدرة، المواد الإباحية، البضائع المنتهكة للملكية الفكرية، المنتجات الغذائية منتهية الصلاحية، البضائع المسروقة أو غير الشرعية. المخالفة تؤدي لإغلاق الحساب فوراً وإبلاغ الجهات المختصة.`,
  },
  {
    title: '8. سجلات التتبع والمراقبة',
    content: `نحتفظ بسجلات تفصيلية لكل نشاط على المنصة بما في ذلك: عنوان IP لكل جلسة، توقيت الدخول والخروج، عمليات البحث والمشاهدة، الطلبات والحجوزات. هذه السجلات تُستخدم لأغراض الأمان وحل النزاعات وتحسين الخدمة. يمكن تقديمها للجهات القانونية عند الطلب الرسمي.`,
  },
  {
    title: '9. إخلاء المسؤولية',
    content: `سوق البالات منصة وسيطة فقط. لا نتحمل مسؤولية جودة البضاعة أو صحة الوصف الذي يقدمه التاجر. لا نضمن توفر البضاعة أو سلامة الشحن. قرار الشراء هو مسؤولية الزبون الكاملة بعد التحقق والاتفاق مع التاجر.`,
  },
];

export default function TermsPage() {
  const [openSection, setOpenSection] = useState<number | null>(0);

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
        <span className="text-slate-400 text-sm">شروط الاستخدام</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-bold">
            <FileText className="w-4 h-4" />
            آخر تحديث: {new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long' })}
          </div>
          <h1 className="text-3xl font-black text-white">شروط وأحكام الاستخدام</h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            هذه الشروط والأحكام تحكم استخدامك لمنصة سوق البالات. يرجى قراءتها بعناية قبل التسجيل.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h3 className="font-extrabold text-emerald-400 text-sm">المسموح به</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• بضائع أمازون والبالات الأوروبية</li>
              <li>• إلكترونيات وأجهزة جديدة/مجددة</li>
              <li>• ملابس وأحذية جديدة بالتاغ فقط</li>
              <li>• عطور وكوزمتك صالحة الاستخدام</li>
            </ul>
          </div>
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-2">
            <XCircle className="w-6 h-6 text-red-400" />
            <h3 className="font-extrabold text-red-400 text-sm">غير المسموح</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• ملابس مستعملة نهائياً</li>
              <li>• بضائع مسروقة أو مزورة</li>
              <li>• مواد مخدرة أو أسلحة</li>
              <li>• الاحتيال أو التضليل</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h3 className="font-extrabold text-amber-400 text-sm">تنبيهات مهمة</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• الحجز مؤقت لمدة ساعة فقط</li>
              <li>• فحص البضاعة قبل الدفع</li>
              <li>• عطور: مسؤولية الزبون</li>
              <li>• IP ونشاطك محفوظ ومتابع</li>
            </ul>
          </div>
        </div>

        {/* Accordion Terms */}
        <div className="space-y-3">
          {termsData.map((section, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-right hover:bg-slate-800/60 transition-colors"
              >
                <h2 className="font-extrabold text-white text-sm">{section.title}</h2>
                {openSection === i
                  ? <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
              </button>
              {openSection === i && (
                <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-5 bg-slate-900 border border-amber-500/30 rounded-2xl text-sm text-slate-300 leading-relaxed">
          <p className="font-bold text-amber-400 mb-2">✅ بالتسجيل في المنصة، أنت توافق على جميع الشروط والأحكام المذكورة أعلاه.</p>
          <p>للاستفسار عن أي شرط أو حكم، يرجى التواصل معنا عبر صفحة الاتصال.</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/privacy" className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-all">سياسة الخصوصية</Link>
          <Link href="/contact" className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-all">اتصل بنا</Link>
          <Link href="/" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-sm hover:bg-amber-400 transition-all">العودة للمتجر</Link>
        </div>
      </main>
    </div>
  );
}
