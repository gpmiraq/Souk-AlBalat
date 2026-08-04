'use client';

import React, { useState, useId } from 'react';
import { X, Phone, UserCheck, LogIn, Compass, Navigation, AlertCircle, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const UserAuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginCustomer, siteSettings } = useCart();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  
  // Registration Form State
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('بغداد');
  const [district, setDistrict] = useState('');
  const [landmark, setLandmark] = useState('');
  
  // SMS OTP Verification Step State
  const [step, setStep] = useState<'INFO' | 'OTP'>('INFO');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(false);

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const fullNameInputId = useId();
  const phoneInputId = useId();
  const citySelectId = useId();
  const districtInputId = useId();
  const landmarkInputId = useId();

  if (!isAuthModalOpen) return null;

  const handleGpsDetect = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsDetectingGps(true);
      setGpsStatus('جاري تحديد الإحداثيات عبر الـ GPS...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGps(false);
          setGpsStatus(`تم تحديد موقعك بنجاح! (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setDistrict('موقع مستكشف عبر الخارطة (GPS)');
        },
        () => {
          setIsDetectingGps(false);
          setGpsStatus('تعذر الوصول للـ GPS تلقائياً، يرجى كتابة المنطقة يدوياً.');
        },
        { timeout: 8000 }
      );
    } else {
      setGpsStatus('خاصية الـ GPS غير مدعومة في متصفحك.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim() && name.trim()) {
      // Advance to SMS OTP Verification Step
      setStep('OTP');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate SMS OTP Verification (accepts any 4-digit code like 1234)
    if (otpCode.length === 4) {
      loginCustomer(phone.trim(), name.trim(), city, district.trim(), landmark.trim());
      setStep('INFO');
      setOtpCode('');
    } else {
      setOtpError(true);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      loginCustomer(phone.trim(), name.trim() || 'زبون موثق', city, district, landmark);
    }
  };

  const handleSocialLogin = (provider: 'GOOGLE' | 'APPLE') => {
    loginCustomer('07709988776', `زبون ${provider}`, 'بغداد', 'موقع موثق عبر الحساب الرقمي');
  };

  const iraqCities = [
    'بغداد', 'أربيل', 'البصرة', 'النجف الأشرف', 'كربلاء المقدسة',
    'الموصل (نينوى)', 'بابل (الحلة)', 'السليمانية', 'دهوك', 'ذي قار (الناصرية)',
    'كركوك', 'ديالى (بعقوبة)', 'الأنبار (الرمادي)', 'المثنى (السمواة)',
    'واسط (كوت)', 'القادسية (الديوانية)', 'ميسان (العمارة)', 'صلاح الدين (تكريت)',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white dark:bg-carbon-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 transition-colors my-6">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-carbon-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dual Tab Header (Login vs Register) */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-carbon-950 rounded-2xl mb-5 font-extrabold text-xs">
          <button
            onClick={() => { setActiveTab('REGISTER'); setStep('INFO'); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'REGISTER'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            تسجيل حساب جديد وتوثيق
          </button>
          
          <button
            onClick={() => setActiveTab('LOGIN')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'LOGIN'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            تسجيل الدخول مباشرة
          </button>
        </div>

        {/* TAB 1: NEW REGISTER & PHONE VERIFICATION */}
        {activeTab === 'REGISTER' && (
          <>
            {step === 'INFO' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-0.5">
                    إنشاء حساب جديد وتأكيد الموقع
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    أدخل معلوماتك الشخصية وموقعك للحصول على مصادقة رقمية سريعة
                  </p>
                </div>

                {/* Social Login Options */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('GOOGLE')}
                    className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-2"
                  >
                    <span>الدخول بـ Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('APPLE')}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 flex items-center justify-center gap-2"
                  >
                    <span>الدخول بـ Apple</span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold">أو التسجيل برقم الواتساب والمعلومات</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={fullNameInputId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      الاسم الكامل: *
                    </label>
                    <input
                      id={fullNameInputId}
                      type="text"
                      required
                      placeholder="اسمك الثلاثي"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor={phoneInputId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      رقم الواتساب للتأكيد: *
                    </label>
                    <input
                      id={phoneInputId}
                      type="text"
                      required
                      placeholder="07701234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* GPS Location Button */}
                <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px]">
                    تحديد الموقع التلقائي:
                  </span>
                  <button
                    type="button"
                    onClick={handleGpsDetect}
                    disabled={isDetectingGps}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-[10px]"
                  >
                    {isDetectingGps ? 'جاري الفحص...' : 'استخدام الخارطة 📍'}
                  </button>
                </div>
                {gpsStatus && <p className="text-[10px] text-sky-500 font-mono">{gpsStatus}</p>}

                {/* Address Selectors */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor={citySelectId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">المحافظة:</label>
                    <select
                      id={citySelectId}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 font-bold"
                    >
                      {iraqCities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={districtInputId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">المنطقة:</label>
                    <input
                      id={districtInputId}
                      type="text"
                      required
                      placeholder="المنصور"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label htmlFor={landmarkInputId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نقطة دالة:</label>
                    <input
                      id={landmarkInputId}
                      type="text"
                      required
                      placeholder="قرب البريد"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>متابعة إرسال رمز المصادقة SMS</span>
                </button>
              </form>
            ) : (
              /* SMS OTP VERIFICATION STEP */
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  المصادقة وتوثيق رقم الهاتف
                </h3>
                <p className="text-xs text-slate-500">
                  تم إرسال رمز التوثيق المكون من 4 أرقام لـ <strong className="text-amber-500 font-mono">{phone}</strong>
                </p>

                <div>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1 2 3 4"
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value); setOtpError(false); }}
                    className="w-48 mx-auto px-4 py-3 rounded-2xl bg-slate-50 dark:bg-carbon-950 border-2 border-amber-500 text-center font-mono font-black text-xl tracking-widest text-slate-900 dark:text-white focus:outline-none"
                  />
                  {otpError && <p className="text-[11px] text-red-500 font-bold mt-1">يرجى إدخال 4 أرقام للمصادقة</p>}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('INFO')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-carbon-800 text-slate-600 dark:text-slate-300 font-bold"
                  >
                    تغيير الرقم
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد التوثيق وتفعيل الحساب</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* TAB 2: SIMPLE DIRECT LOGIN */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="text-center mb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                تسجيل الدخول المباشر
              </h3>
              <p className="text-xs text-slate-500">
                أدخل رقم هاتفك للوصول لحسابك الحالي وسلتك المقسمة
              </p>
            </div>

            <div>
              <label htmlFor={phoneInputId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                رقم الهاتف (واتساب): *
              </label>
              <input
                id={phoneInputId}
                type="text"
                required
                placeholder="07701234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول الحساب</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
