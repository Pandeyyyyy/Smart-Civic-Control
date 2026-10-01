import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 hover:bg-amber-500/15 text-[11px] font-semibold flex items-center space-x-1.5 transition-all shadow-2xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>DEMO MODE</span>
        <Info className="w-3 h-3 text-amber-600 opacity-70" />
      </button>

      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-amber-800 flex items-center space-x-1">
              <span>●</span>
              <span>Simulation Environment</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-slate-400 hover:text-slate-600 text-sm leading-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            This interface operates with simulated civic data in <strong>Dahisar, Mumbai (R/North Demo Wards 01–06)</strong>.
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p>• No real municipal authority is contacted.</p>
            <p>• Real multimodal AI inference is enabled.</p>
            <p>• Demo ward boundaries are simulated for academic demonstration.</p>
          </div>
        </div>
      )}
    </div>
  );
};
