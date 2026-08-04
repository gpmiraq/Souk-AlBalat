'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck, Truck, Star, Users, Package, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <span className="font-black text-white text-lg">سوق البالات</span>
        </Link>
        <ArrowRight className="w-4 h-4 text-slate-500" />
        <span className="text-slate-400 text-sm">من نحن</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-bold">
            <Zap className="w-4 h-4" />
            سوق البالات - Amazon & DHL Outlet IQ
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">من نحن؟</h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            أول وأكبر منصة متخصصة في بيع بضائع أمازون، الأوبن بوكس، البالات الأوروبية، وطرود DHL بالمفرد في العراق، مع ضمان الفحص الكامل وأفضل الأسعار.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Package, label: 'بضائع معروضة', value: '+500' },
            { icon: Users, label: 'تجار معتمدين', value: '+50' },
            { icon: Truck, label: 'محافظة خدمها', value: '18' },
            { icon: Star, label: 'تقييم الزبائن', value: '4.9/5' },
          ].map((stat, i) => (
            <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
              <stat.icon className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h2 className="text-xl font-black text-amber-400">رسالتنا</h2>
          <p className="text-slate-300 leading-relaxed">
            نسعى لتوفير منصة موثوقة وشفافة تربط التجار المعتمدين بالزبائن في العراق، من خلال عرض بضائع ذات جودة مفحوصة وموثقة بأسعار تنافسية. نؤمن بأن كل عراقي يستحق الوصول إلى بضائع عالمية بأسعار معقولة مع ضمان الشفافية الكاملة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, title: 'فحص 100%', desc: 'كل قطعة تمر بفحص شامل قبل العرض للبيع' },
            { icon: Globe, title: 'تغطية شاملة', desc: 'نصل لجميع محافظات العراق عبر شركات الشحن المعتمدة' },
            { icon: Users, title: 'تجار موثقون', desc: 'جميع التجار يمرون بعملية تحقق وموافقة الإدارة' },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <item.icon className="w-7 h-7 text-amber-400" />
              <h3 className="font-extrabold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Link href="/contact" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all">تواصل معنا</Link>
          <Link href="/" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all border border-slate-700">العودة للمتجر</Link>
        </div>
      </main>
    </div>
  );
}
