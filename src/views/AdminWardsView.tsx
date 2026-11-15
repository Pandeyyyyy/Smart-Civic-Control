import React from 'react';
import { Complaint } from '../types';
import { DEMO_WARDS } from '../data/seedData';
import { Layers, MapPin, Users, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface AdminWardsViewProps {
  complaints: Complaint[];
  onNavigate: (view: string, complaintId?: string) => void;
}

export const AdminWardsView: React.FC<AdminWardsViewProps> = ({ complaints, onNavigate }) => {
  return (
    <div className="space-y-6 pb-16">
      {/* HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#00D6B8] uppercase tracking-wider mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>JURISDICTION MANAGEMENT</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Dahisar R/North Administrative Demo Wards
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Ward boundary configuration and active civic grievance density across Demo Wards 01–06.
          (Clearly marked as simulated demo wards for college evaluation).
        </p>
      </div>

      {/* WARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_WARDS.map((ward) => {
          const wardComplaints = complaints.filter((c) => c.demoWardNumber === ward.demoWardNumber);
          const pending = wardComplaints.filter((c) => c.status === 'Pending').length;
          const resolved = wardComplaints.filter((c) => c.status === 'Resolved').length;

          return (
            <div
              key={ward.id}
              className="p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 hover:border-cyan-400/50 hover:shadow-cyan-950/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-[#00D6B8] bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                    {ward.demoWardNumber}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Lat: {ward.centerLat.toFixed(3)}, Lng: {ward.centerLng.toFixed(3)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{ward.wardName}</h3>
                <span className="text-[11px] text-slate-400">
                  {ward.city} • Administrative Ward {ward.administrativeWard}
                </span>

                <div className="mt-4 p-3 rounded-2xl bg-[#071A2F]/70 border border-cyan-500/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Population</span>
                    <span className="font-semibold text-white">{ward.populationEstimate.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Issues</span>
                    <span className="font-bold text-[#00D6B8]">{wardComplaints.length} tickets</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-cyan-500/20">
                  <span className="text-amber-400 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pending} Pending</span>
                  </span>
                  <span className="text-emerald-400 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{resolved} Resolved</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('admin_map')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-[#071A2F]/80 hover:bg-[#071A2F] text-white hover:text-[#00D6B8] border border-cyan-500/25 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>View on Operational Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
