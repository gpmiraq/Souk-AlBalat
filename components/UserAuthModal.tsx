'use client';

import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

const IRAQ_GOVERNORATES = [
  'بغداد','البصرة','نينوى (الموصل)','أربيل','السليمانية','دهوك',
  'النجف الأشرف','كربلاء المقدسة','بابل (الحلة)','كركوك',
  'ذي قار (الناصرية)','الأنبار (الرمادي)','ديالي (بعقوبة)',
  'صلاح الدين (تكريت)','واسط (الكوت)','القادسية (الديوانية)',
  'ميسان (العمارة)','المثنى (السماوة)',
];

const ADMIN_EMAIL = 'gpm.iraq@gmail.com';
const ADMIN_NAME = 'أبو وارث أمازون';

type Step = 'GOOGLE' | 'PHONE' | 'LOCATION' | 'DONE';

export const UserAuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginCustomer } = useCart();

  const [step, setStep] = useState<Step>('GOOGLE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2: Phone
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Step 3: Location
  const [city, setCity] = useState('بغداد');
  const [district, setDistrict] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Signed-in Google user (temp before full profile save)
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  if (!isAuthModalOpen) return null;

  const closeModal = () => {
    setIsAuthModalOpen(false);
    setStep('GOOGLE');
    setError('');
    setPhone('');
    setDistrict('');
    setLandmark('');
    setPendingUser(null);
  };

  // ─ Step 1: Firebase Google Popup ────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const uid = String(firebaseUser.uid || '');
      const userEmail = String(firebaseUser.email || '');
      const userDisplayName = String(firebaseUser.displayName || '');
      const userPhotoURL = String(firebaseUser.photoURL || '');

      const isAdmin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const userId = `google_${uid}`;

      // Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const existingProfile = userSnap.data() as UserProfile;
        loginCustomer(existingProfile);
        closeModal();
      } else {
        const newProfile: UserProfile = {
          id: userId,
          fullName: isAdmin ? ADMIN_NAME : (userDisplayName || 'مستخدم جديد'),
          email: userEmail,
          avatar: userPhotoURL,
          phone: '',
          role: 'CUSTOMER',
          isMember: true,
          ...(isAdmin ? { isSiteAdmin: true } : {}),
          registeredAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        setPendingUser(newProfile);
        setStep('PHONE');
      }
    } catch (err: any) {
      console.error('Firebase Google Sign-In error:', err?.code, err?.message);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup - no error needed
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('⚠️ يجب تفعيل Google Sign-In في Firebase Console أولاً. (operation-not-allowed)');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('⚠️ النطاق غير مضاف في Firebase Auth المسموح بها. (unauthorized-domain)');
      } else if (err.code === 'auth/popup-blocked') {
        setError('⚠️ المتصفح منع نافذة Google - يرجى السماح للنوافذ المنبثقة وإعادة المحاولة.');
      } else {
        setError(`خطأ: ${err?.code || err?.message || 'غير معروف'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─ Step 2: Phone Submit ─────────────────────────────────────────────────
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)');
      return;
    }
    setPhoneError('');
    setStep('LOCATION');
  };

  // ─ Step 3: Location Submit + Final Save ─────────────────────────────────
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district.trim() || !pendingUser) return;
    setIsSaving(true);

    const fullAddress = `${city} - ${district.trim()}${landmark.trim() ? ' / ' + landmark.trim() : ''}`;
    const finalUser: UserProfile = {
      ...pendingUser,
      phone: phone.replace(/\D/g, ''),
      city,
      address: fullAddress,
    };

    try {
      await setDoc(doc(db, 'users', finalUser.id), finalUser);
    } catch {}

    loginCustomer(finalUser);
    setStep('DONE');
    setTimeout(closeModal, 2000);
    setIsSaving(false);
  };

  // ─ UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={closeModal} />

      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(255,255,255,0.07)',
          animation: 'scaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* Gradient Bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%)' }} />

        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/8 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 pt-6 pb-1">
          {(['GOOGLE', 'PHONE', 'LOCATION'] as Step[]).map((s, i) => {
            const currentIdx = ['GOOGLE', 'PHONE', 'LOCATION'].indexOf(step);
            const isActive = step === s;
            const isDone = currentIdx > i;
            return (
              <div
                key={s}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: isActive ? 32 : 12,
                  background: isDone ? '#22c55e' : isActive ? '#f59e0b' : 'rgba(255,255,255,0.12)',
                }}
              />
            );
          })}
        </div>

        <div className="px-8 pt-5 pb-8">

          {/* ── STEP 1: Google Login ── */}
          {step === 'GOOGLE' && (
            <div className="text-center">
              <div
                className="mx-auto mb-5 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              >
                <span className="text-4xl">🛍️</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-1">سوق البالات</h2>
              <p className="text-slate-400 text-sm mb-8">
                سجّل دخولك بحساب Google لتتمكن من الحجز والطلب
              </p>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-70 disabled:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                {isLoading ? 'جاري فتح نافذة Google...' : 'تسجيل الدخول بحساب Google'}
              </button>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-bold">
                  {error}
                </div>
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
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl">
                  📱
                </div>
                <h2 className="text-xl font-black text-white mb-1">
                  أهلاً {pendingUser?.fullName?.split(' ')[0]}!
                </h2>
                <p className="text-slate-400 text-sm">أدخل رقم هاتفك للتواصل والتوصيل</p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">رقم الهاتف (واتساب) *</label>
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 border transition-colors focus-within:border-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="text-slate-400 text-sm">🇮🇶</span>
                    <span className="text-slate-400 text-sm font-mono">+964</span>
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
                  {phoneError && <p className="mt-1 text-red-400 text-xs">{phoneError}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-black text-slate-950 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  التالي →
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 3: Location ── */}
          {step === 'LOCATION' && (
            <div>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                  📍
                </div>
                <h2 className="text-xl font-black text-white mb-1">موقعك للتوصيل</h2>
                <p className="text-slate-400 text-sm">يُحفظ في ملفك ويُرسل تلقائياً مع كل طلب</p>
              </div>

              <form onSubmit={handleLocationSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">المحافظة</label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full rounded-2xl px-4 py-3 text-white appearance-none outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {IRAQ_GOVERNORATES.map(g => <option key={g} value={g} style={{ background: '#1e293b' }}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">المنطقة / الحي <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="مثال: المنصور، شارع 14 رمضان"
                    required
                    className="w-full rounded-2xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">أقرب نقطة دالة</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="مثال: قرب مول زيونة، أمام مدرسة..."
                    className="w-full rounded-2xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 rounded-2xl font-black text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-70 mt-2"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  {isSaving ? '⏳ جاري الحفظ...' : 'حفظ وإكمال التسجيل ✓'}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 'DONE' && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-black text-white mb-2">مرحباً بك! 🎉</h2>
              <p className="text-slate-400">تم حفظ بياناتك بنجاح. يمكنك الآن الحجز والطلب.</p>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
