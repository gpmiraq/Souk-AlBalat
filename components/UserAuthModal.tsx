'use client';

import React, { useState } from 'react';
import { X, Phone, MapPin, ShieldCheck, CheckCircle2, Navigation, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

const IRAQ_GOVERNORATES = [
  'بغداد','البصرة','نينوى (الموصل)','أربيل','السليمانية','دهوك',
  'النجف الأشرف','كربلاء المقدسة','بابل (الحلة)','كركوك',
  'ذي قار (الناصرية)','الأنبار (الرمادي)','ديالي (بعقوبة)',
  'صلاح الدين (تكريت)','واسط (الكوت)','القادسية (الديوانية)',
  'ميسان (العمارة)','المثنى (السماوة)',
];

// The verified admin Google account
const ADMIN_EMAIL = 'gpm.iraq@gmail.com';
const ADMIN_NAME = 'أبو وارث أمازون';

type Step = 'GOOGLE_LOGIN' | 'PHONE' | 'LOCATION';

export const UserAuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginCustomer, currentUser, setIsAdminDashboardOpen } = useCart();

  const [step, setStep] = useState<Step>('GOOGLE_LOGIN');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [city, setCity] = useState('بغداد');
  const [district, setDistrict] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedUser, setSavedUser] = useState<UserProfile | null>(null);

  if (!isAuthModalOpen) return null;

  // ─ Step 1: Google Sign-In ────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    const clientId = '277858300469-jommje8hvf62duu7r6cgp9so1nut0576.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent('openid email profile');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;
    window.location.href = url;
  };

  // Called from CartContext when Google OAuth token is parsed on mount
  // Here we handle the next step if user is logged in but missing phone
  const handleContinueAfterGoogle = () => {
    if (currentUser && currentUser.phone && currentUser.phone !== '07709988776') {
      // Already has real phone number - close
      setIsAuthModalOpen(false);
    } else {
      setStep('PHONE');
    }
  };

  // ─ Step 2: Phone Entry ───────────────────────────────────────────────────
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned || cleaned.length < 10) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)');
      return;
    }
    setPhoneError('');
    setStep('LOCATION');
  };

  // ─ Step 3: Location + Save ──────────────────────────────────────────────
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district.trim()) return;
    setIsSaving(true);

    const base: UserProfile = currentUser || { id: `user_${Date.now()}`, fullName: 'مستخدم جديد', role: 'CUSTOMER', isMember: true, phone: '' };
    const updatedUser: UserProfile = {
      ...base,
      phone: phone.replace(/\s/g, ''),
      city,
      address: `${city} - ${district.trim()}${landmark.trim() ? ' / ' + landmark.trim() : ''}`,
      isMember: true,
      role: 'CUSTOMER',
      registeredAt: base.registeredAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Check if this is the admin
    if ((base as UserProfile).email === ADMIN_EMAIL) {
      (updatedUser as any).isSiteAdmin = true;
      updatedUser.fullName = ADMIN_NAME;
    }

    loginCustomer(updatedUser);
    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
    } catch {}

    setSavedUser(updatedUser);
    setIsSaving(false);
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setStep('GOOGLE_LOGIN');
    }, 1800);
  };

  // ─ Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Gradient Top Bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444, #8b5cf6)' }} />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Progress */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          {(['GOOGLE_LOGIN', 'PHONE', 'LOCATION'] as Step[]).map((s, i) => (
            <div
              key={s}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: step === s ? 32 : 12,
                background: step === s ? '#f59e0b' : (
                  ['GOOGLE_LOGIN', 'PHONE', 'LOCATION'].indexOf(step) > i ? '#22c55e' : 'rgba(255,255,255,0.15)'
                )
              }}
            />
          ))}
        </div>

        <div className="px-8 pt-4 pb-8">

          {/* ── STEP 1: Google Login ── */}
          {step === 'GOOGLE_LOGIN' && (
            <div className="text-center">
              {/* Logo */}
              <div className="mx-auto mb-5 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                <span className="text-4xl">🛍️</span>
              </div>

              <h2 className="text-2xl font-black text-white mb-1">سوق البالات</h2>
              <p className="text-slate-400 text-sm mb-8">سجّل دخولك لتتمكن من الحجز والطلب</p>

              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg mb-4"
              >
                {/* Google SVG Icon */}
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                تسجيل الدخول بحساب Google
              </button>

              {/* If already logged in with Google, show continue */}
              {currentUser && (
                <button
                  onClick={handleContinueAfterGoogle}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-all"
                >
                  متابعة كـ {currentUser.fullName} ←
                </button>
              )}

              <p className="mt-6 text-xs text-slate-500">
                بتسجيل دخولك توافق على شروط الاستخدام وسياسة الخصوصية
              </p>
            </div>
          )}

          {/* ── STEP 2: Phone Number ── */}
          {step === 'PHONE' && (
            <div>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-xl font-black text-white mb-1">رقم هاتفك</h2>
                <p className="text-slate-400 text-sm">يُستخدم للتواصل والتوصيل — مرة واحدة فقط</p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">رقم الهاتف (واتساب)</label>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-amber-500 transition-colors">
                    <span className="text-slate-400 text-sm font-mono">🇮🇶 +964</span>
                    <div className="w-px h-5 bg-slate-600" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="07X XXXX XXXX"
                      className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-right font-mono"
                      dir="ltr"
                      autoFocus
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1 text-red-400 text-xs">{phoneError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-black text-slate-950 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  التالي ←
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 3: Location ── */}
          {step === 'LOCATION' && (
            <div>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-black text-white mb-1">موقعك للتوصيل</h2>
                <p className="text-slate-400 text-sm">يُحفظ في ملفك ويُرسل تلقائياً مع الطلبات</p>
              </div>

              <form onSubmit={handleLocationSubmit} className="space-y-4">
                {/* Governorate */}
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">المحافظة</label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-4 py-3 outline-none appearance-none focus:border-amber-500 transition-colors"
                    >
                      {IRAQ_GOVERNORATES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">المنطقة / الحي <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="مثال: المنصور، شارع 14 رمضان"
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-2xl px-4 py-3 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">أقرب نقطة دالة</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="مثال: قرب مول زيونة، أمام مدرسة..."
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-2xl px-4 py-3 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Save Button */}
                {savedUser ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    تم حفظ بياناتك بنجاح! مرحباً {savedUser.fullName} 🎉
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 rounded-2xl font-black text-slate-950 transition-all hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-70"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                  >
                    {isSaving ? '⏳ جاري الحفظ...' : 'حفظ وإكمال التسجيل ✓'}
                  </button>
                )}
              </form>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>
    </div>
  );
};
