'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const DemoNoticeBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-slate-950 text-amber-400 px-4 py-2 text-xs font-black border-b border-amber-500/30 flex items-center justify-between gap-3 relative z-30 transition-all">
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 text-center sm:text-right">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">
            <AlertTriangle className="w-3.5 h-3.5" />
            تنبيه إخلاء المسؤولية
          </span>
          <span className="text-[11px] text-slate-200 font-bold">
            إن الموقع هو وسيلة ربط بينك وبين تجار وبائعي الأمازون والبالات، ولا يتحمل مسؤولية التعامل والافتراضيات المباشرة.
          </span>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all flex items-center gap-1 shadow-sm flex-shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
          <span>موافق</span>
        </button>
      </div>
    </div>
  );
};
