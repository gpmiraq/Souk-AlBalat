'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Phone, MessageCircle, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(`رسالة جديدة من ${name}\nالهاتف: ${phone}\n\n${message}`);
    window.open(`https://wa.me/9647701234567?text=${text}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

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
        <span className="text-slate-400 text-sm">تواصل معنا</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-white">تواصل معنا</h1>
          <p className="text-slate-400 text-sm">نحن هنا للمساعدة - تواصل معنا عبر واتساب أو اترك رسالة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Phone, title: 'الهاتف والواتساب', val: '0770 123 4567', sub: 'متاح 9 ص - 9 م يومياً' },
            { icon: MessageCircle, title: 'الدعم الفني', val: 'واتساب مباشر', sub: 'رد خلال ساعة واحدة' },
            { icon: MapPin, title: 'المقر الرئيسي', val: 'بغداد، العراق', sub: 'مع فروع في البصرة وأربيل' },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-center">
              <item.icon className="w-7 h-7 text-amber-400 mx-auto" />
              <h3 className="font-extrabold text-white text-sm">{item.title}</h3>
              <p className="font-bold text-amber-400 text-sm">{item.val}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
          <h2 className="text-lg font-black text-white mb-5">أرسل لنا رسالة عبر واتساب</h2>
          
          {sent && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم فتح واتساب! أرسل الرسالة من هناك.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الاسم الكامل *</label>
                <input required value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">الرسالة *</label>
              <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none" />
            </div>
            <button type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg transition-all">
              <Send className="w-4 h-4" />
              <span>إرسال عبر واتساب</span>
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/about" className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-all">من نحن</Link>
          <Link href="/" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-sm hover:bg-amber-400 transition-all">العودة للمتجر</Link>
        </div>
      </main>
    </div>
  );
}
