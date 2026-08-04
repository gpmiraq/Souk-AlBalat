'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Lock, User, LogIn, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

export default function VendorLoginPage() {
  const router = useRouter();
  const { loginVendor } = useCart();
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');

  const usernameId = useId();
  const passwordId = useId();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى كتابة اسم المستخدم وكلمة المرور');
      return;
    }

    const success = loginVendor(username, password);
    if (success) {
      router.push('/vendor/portal');
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handleQuickDemoLogin = () => {
    loginVendor('demo', 'demo');
    router.push('/vendor/portal');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Top Navbar Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pt-2">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمتجر الرئيسي</span>
        </Link>

        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black">
          بوابة التجار والشركاء
        </span>
      </div>

      {/* Center Card Container */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-carbon-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-black text-white mb-1">
              دخول التجار والشركاء
            </h1>
            <p className="text-xs text-slate-400">
              منصة بالات العراق لتجار أمازون والـ DHL والبالات الأوروبية والصينية
            </p>
          </div>

          {/* Direct Fast Demo Login Button */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <p className="text-xs text-amber-300 font-bold mb-2">
              حساب تجريبي مجهز للتشغيل والمعاينة المباشرة:
            </p>
            <button
              onClick={handleQuickDemoLogin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>دخول تجريبي بنقرة واحدة (demo / demo)</span>
            </button>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor={usernameId} className="block text-slate-300 font-bold mb-1">اسم المستخدم (Username):</label>
              <div className="relative">
                <input
                  id={usernameId}
                  type="text"
                  required
                  placeholder="demo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 rounded-2xl bg-carbon-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor={passwordId} className="block text-slate-300 font-bold mb-1">كلمة المرور (Password):</label>
              <div className="relative">
                <input
                  id={passwordId}
                  type="password"
                  required
                  placeholder="demo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 rounded-2xl bg-carbon-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>تسجيل الدخول لبوابة البائعين</span>
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            <span className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              حساب تجريبي موثق ديمو ديمو (demo / demo)
            </span>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-slate-600 pb-2">
        منصة بالات العراق • التشغيل التجريبي للتجار والشركاء
      </div>
    </div>
  );
}
