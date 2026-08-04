'use client';

import React from 'react';
import { X, ShieldCheck, HelpCircle, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

interface ConditionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConditionGuideModal: React.FC<ConditionGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-carbon-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                دليل حالات وتصنيفات بضائع بالات العراق (Amazon & DHL Outlet)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تعرف على معنى درجات الفحص لضمان التحديد الدقيق لما يناسبك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-carbon-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conditions Explanation List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* OPEN BOX */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-sm text-sky-600 dark:text-sky-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                علبة مفتوحة (OPEN BOX)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-500 text-white">
                أحدث حالة - كالجديد 100%
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              منتج جديد تماماً، فتحت العلبة الخارجية فقط للتحقق من الملحقات أو إرجاع الزبون من أمازون في مهلة الإرجاع. البضاعة لم تستخدم وتأتي مع كامل ملحقاتها كرتونية محفوفة.
            </p>
          </div>

          {/* GRADE A / NEW */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                جديد بالختم (NEW) / درجة أولى
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                ممتاز بالختم أو الفحص الكامل
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              منتج مفحوص ومضمون بالكامل يعمل بكفاءة 100% بدون أي مشكلة تقنية، بضاعة مغلفة بالختم الأصلي أو بحالة ممتاز جداً.
            </p>
          </div>

          {/* GRADE B / USED */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                مستعمل (USED)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                أفضل قيمة وسعر مخفض جداً
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              منتج شغال ومضمون 100% تقنياً، ولكن يحتوي على خدوش أو أثار استخدام واضحة من الخارج أو علبة كارتون بديلة. ممتاز لمن يبحث عن أرخص سعر وأعلى أداء.
            </p>
          </div>

          {/* SCRAP - TOOLS & PARTS */}
          <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-600" />
                فحم - أدوات (SCRAP)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-white">
                قطع وأدوات وتصفية
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              بضاعة نقص أو عاطلة تنفع قطع غيار وأدوات للمصلحين والورش بأسعار تصفية رمزية.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
          >
            فهمت، العودة للمتجر
          </button>
        </div>

      </div>
    </div>
  );
};
