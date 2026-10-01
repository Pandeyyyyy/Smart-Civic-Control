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
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#0F766E] uppercase tracking-wider mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>JURISDICTION MANAGEMENT</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Dahisar R/North Administrative Demo Wards
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
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
              className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200/60">
                    {ward.demoWardNumber}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Lat: {ward.centerLat.toFixed(3)}, Lng: {ward.centerLng.toFixed(3)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{ward.wardName}</h3>
                <span className="text-[11px] text-slate-500">
                  {ward.city} • Administrative Ward {ward.administrativeWard}
                </span>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Population</span>
                    <span className="font-semibold text-slate-800">{ward.populationEstimate.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Issues</span>
                    <span className="font-bold text-slate-900">{wardComplaints.length} tickets</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-amber-700 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pending} Pending</span>
                  </span>
                  <span className="text-emerald-700 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{resolved} Resolved</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('admin_map')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
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
