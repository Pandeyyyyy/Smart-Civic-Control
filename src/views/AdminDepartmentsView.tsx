import React from 'react';
import { Complaint } from '../types';
import { DEPARTMENTS, DEPARTMENT_RULES } from '../data/seedData';
import { getCategoryLabel } from '../services/departmentRouter';
import { Building2, Shield, Mail, Clock, CheckCircle2 } from 'lucide-react';

interface AdminDepartmentsViewProps {
  complaints: Complaint[];
}

export const AdminDepartmentsView: React.FC<AdminDepartmentsViewProps> = ({ complaints }) => {
  return (
    <div className="space-y-6 pb-16">
      {/* HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#00D6B8] uppercase tracking-wider mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>MUNICIPAL ORGANIZATIONAL STRUCTURE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Department Directory & Routing Matrix
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Automated routing protocols mapping problem categories to municipal directorates, SLA targets, and executive engineers.
        </p>
      </div>

      {/* DEPARTMENTS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPARTMENTS.map((dept) => {
          const deptComplaints = complaints.filter((c) => c.departmentId === dept.id);
          const active = deptComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected').length;

          return (
            <div
              key={dept.id}
              className="p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 hover:border-cyan-400/50 hover:shadow-cyan-950/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <span
                  className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white shadow-2xs"
                  style={{ backgroundColor: dept.color }}
                >
                  {dept.shortCode}
                </span>
                <span className="text-[11px] font-semibold text-[#00D6B8] bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {active} Active Tickets
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{dept.departmentName}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="pt-3 border-t border-cyan-500/15 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Head Officer:</span>
                  <span className="font-semibold text-white truncate max-w-[170px]">
                    {dept.headOfficer}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Email:</span>
                  <span className="text-slate-300 truncate max-w-[170px]">{dept.contactEmail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPARTMENT RULES TABLE */}
      <div className="p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
        <h3 className="text-sm font-bold text-white mb-1">Configured Routing Rules Matrix</h3>
        <p className="text-xs text-slate-400 mb-4">
          Deterministic classification map: Category + Ward → Target Directorate
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#071A2F]/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-cyan-500/20">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Problem Category</th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Target Directorate</th>
                <th className="py-2.5 px-3">Priority SLA</th>
                <th className="py-2.5 px-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/15">
              {DEPARTMENT_RULES.map((r) => {
                const targetDept = DEPARTMENTS.find((d) => d.id === r.departmentId);
                return (
                  <tr key={r.id} className="hover:bg-[#071A2F]/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {getCategoryLabel(r.category)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {r.city} ({r.wardNumber})
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#00D6B8]">
                      {targetDept?.departmentName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.priority === 'Immediate'
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                            : r.priority === 'High'
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-cyan-500/15'
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
