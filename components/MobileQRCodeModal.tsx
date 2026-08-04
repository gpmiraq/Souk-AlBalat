'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Copy, Check, QrCode, ExternalLink, Sparkles } from 'lucide-react';

interface MobileQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileQRCodeModal: React.FC<MobileQRCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [customIp, setCustomIp] = useState('192.168.3.8');
  const [useLanIp, setUseLanIp] = useState(true);
  const [port, setPort] = useState('3000');
  const [currentUrl, setCurrentUrl] = useState('http://192.168.3.8:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPort = window.location.port || '3000';
      setPort(currentPort);
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setCurrentUrl(window.location.origin);
      } else {
        setCurrentUrl(useLanIp ? `http://${customIp}:${currentPort}` : window.location.origin);
      }
    }
  }, [useLanIp, customIp]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeUrl = currentUrl;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(activeUrl)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white dark:bg-carbon-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-carbon-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-7 h-7 animate-bounce" />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 flex items-center justify-center gap-2">
          <span>مسح الباركود لفتح المتجر على الموبايل</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
          وجّه كاميرا هاتفك المحمول نحو الرمز أدناه لفتح المتجر مباشرة
        </p>

        {/* Local Network IP Warning */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4 text-right text-xs">
          <p className="font-bold text-amber-600 dark:text-amber-400 mb-1">
            ⚠️ للتجربة من الهاتف المحمول:
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            1. يجب أن يكون الهاتف والحاسوب متصلين بـ <strong>نفس شبكة الـ Wi-Fi</strong>.
            <br />
            2. رابط <code className="bg-amber-500/20 px-1 rounded">localhost</code> لا يعمل على الهاتف، لذلك استخدمنا IP الحاسوب: <code className="bg-amber-500/20 px-1 rounded">{customIp}:{port}</code>.
          </p>
        </div>

        {/* IP Switcher / Input */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <input
            type="text"
            value={customIp}
            onChange={(e) => setCustomIp(e.target.value)}
            placeholder="IP الشبكة المحلية"
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-carbon-950 text-xs text-center font-mono w-36 text-slate-900 dark:text-white"
          />
          <button
            onClick={() => setUseLanIp(!useLanIp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              useLanIp ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-carbon-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {useLanIp ? 'IP الشبكة (مفعّل)' : 'localhost'}
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-amber-500/40 inline-block shadow-xl mb-4">
          <img
            src={qrSvgUrl}
            alt="QR Code لفتح المتجر على الموبايل"
            className="w-48 h-48 rounded-xl object-contain mx-auto"
          />
        </div>

        {/* URL Box & Copy */}
        <div className="p-3 bg-slate-50 dark:bg-carbon-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs font-mono mb-4">
          <span className="truncate text-slate-700 dark:text-slate-300 font-bold">
            {activeUrl}
          </span>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1 flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
