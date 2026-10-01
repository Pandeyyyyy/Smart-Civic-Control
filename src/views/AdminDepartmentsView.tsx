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
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#0F766E] uppercase tracking-wider mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>MUNICIPAL ORGANIZATIONAL STRUCTURE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Department Directory & Routing Matrix
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
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
              className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <span
                  className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white shadow-2xs"
                  style={{ backgroundColor: dept.color }}
                >
                  {dept.shortCode}
                </span>
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                  {active} Active Tickets
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{dept.departmentName}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Head Officer:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                    {dept.headOfficer}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Email:</span>
                  <span className="text-slate-700 truncate max-w-[170px]">{dept.contactEmail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPARTMENT RULES TABLE */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Configured Routing Rules Matrix</h3>
        <p className="text-xs text-slate-500 mb-4">
          Deterministic classification map: Category + Ward → Target Directorate
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Problem Category</th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Target Directorate</th>
                <th className="py-2.5 px-3">Priority SLA</th>
                <th className="py-2.5 px-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEPARTMENT_RULES.map((r) => {
                const targetDept = DEPARTMENTS.find((d) => d.id === r.departmentId);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {getCategoryLabel(r.category)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {r.city} ({r.wardNumber})
                    </td>
                    <td className="py-2.5 px-3 font-medium text-teal-800">
                      {targetDept?.departmentName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.priority === 'Immediate'
                            ? 'bg-rose-50 text-rose-700'
                            : r.priority === 'High'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1">
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
