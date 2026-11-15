import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const DemoBanner: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center space-x-1.5 transition-all shadow-xs bg-amber-400/15 border border-amber-400/35 text-amber-300 hover:bg-amber-400/25 cursor-pointer"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>DEMO MODE</span>
        <Info className="w-3 h-3 text-amber-300 opacity-75" />
      </button>

      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl backdrop-blur-2xl border border-cyan-500/30 bg-[#031223]/95 text-slate-200 shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold flex items-center space-x-1 text-amber-400">
              <span>●</span>
              <span>Simulation Environment</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-sm leading-none text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs mt-2 leading-relaxed text-slate-300">
            This interface operates with simulated civic data in <strong className="text-white">Dahisar, Mumbai (R/North Demo Wards 01–06)</strong>.
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-cyan-500/20 text-[11px] space-y-1 text-slate-400">
            <p>• No real municipal authority is contacted.</p>
            <p>• Real multimodal AI inference is enabled.</p>
            <p>• Demo ward boundaries are simulated for academic demonstration.</p>
          </div>
        </div>
      )}
    </div>
  );
};
