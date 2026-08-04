'use client';

import React, { useState } from 'react';
import { X, AlertOctagon, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, Vendor } from '../types';

interface ReportModalProps {
  product?: Product | null;
  vendor?: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  product,
  vendor,
  isOpen,
  onClose,
}) => {
  const { siteSettings, currentUser, setIsAuthModalOpen } = useCart();
  const [reasonCategory, setReasonCategory] = useState('احتيال أو عدم تطابق المواصفات');
  const [customDetails, setCustomDetails] = useState('');

  if (!isOpen) return null;

  const targetName = product ? product.title : vendor ? vendor.name : 'بضاعة غير محددة';
  const targetCode = product ? product.model : vendor ? vendor.id : 'N/A';

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();

    // Require user registration/login before reporting
    if (!currentUser) {
      onClose();
      setIsAuthModalOpen(true);
      return;
    }

    const reportLines = [
      '🚨 *إبلاغ عاجل عن حالة احتيال / مخالفة جديدة*',
      '----------------------------------------',
      `*الجهة المشتكى عليها:* ${targetName}`,
      `*الموديل / الكود:* ${targetCode}`,
      vendor ? `*اسم التاجر:* ${vendor.name}` : '',
      '----------------------------------------',
      `*نوع المخالفة:* ${reasonCategory}`,
      customDetails ? `*تفاصيل إضافية:* ${customDetails}` : '',
      '----------------------------------------',
      '*بيانات الزبون المُبلّغ:*',
      `• *الاسم:* ${currentUser.fullName}`,
      `• *الهاتف:* ${currentUser.phone}`,
      `• *المحافظة:* ${currentUser.city || 'غير محدد'}`,
      '----------------------------------------',
      `تم إرسال هذا الإبلاغ من نظام حماية الزبائن لـ ${siteSettings.siteName}`,
    ].filter(Boolean);

    const messageString = reportLines.join('\n');
    const whatsappUrl = `https://wa.me/${siteSettings.adminPhone}?text=${encodeURIComponent(messageString)}`;

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white dark:bg-carbon-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 transition-colors my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-carbon-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
            تقديم إبلاغ عن مخالفة أو احتيال
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            سيتم توجيه الإبلاغ فوراً لإدارة الموقع للتحقيق واتخاذ الإجراءات
          </p>
        </div>

        {/* Target Info Badge */}
        <div className="p-3 bg-slate-50 dark:bg-carbon-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 text-xs">
          <span className="text-slate-400 block text-[10px]">المحتوى المبلغ عنه:</span>
          <span className="font-extrabold text-slate-900 dark:text-white truncate block">
            {targetName}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSendReport} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              اختر نوع المخالفة أو السبب:
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="احتيال أو عدم تطابق المواصفات">احتيال أو عدم تطابق المواصفات المعروضة</option>
              <option value="بضاعة مستعملة منشورة كجديدة">بضاعة مستعملة منشورة على أنها جديدة بالختم</option>
              <option value="عدم الالتزام بالسعر أو السلوك">عدم الالتزام بالسعر المعلن أو تلاعب بالخصم</option>
              <option value="عطور أو كوزمتك منتهية الصلاحية">عطور أو كوزمتك غير آمنة / منتهية الصلاحية</option>
              <option value="محتوى غير لائق أو وهمي">محتوى إعلان وهمي أو غير لائق</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              تفاصيل إضافية (اختياري):
            </label>
            <textarea
              rows={3}
              placeholder="اكتب أي ملاحظات تساعد إدارة الموقع على الفحص والتحقيق..."
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>إرسال الإبلاغ المباشر عبر واتساب الإدارة</span>
          </button>
        </form>

      </div>
    </div>
  );
};
