import React, { useState } from 'react';
import { Complaint, ComplaintStatus, AdminFilters } from '../types';
import { dataStore } from '../services/dataStore';
import { DEMO_WARDS, DEPARTMENTS } from '../data/seedData';
import { CIVIC_CATEGORIES } from '../services/aiService';
import { getCategoryLabel } from '../services/departmentRouter';
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  Send,
  ShieldAlert,
  ChevronDown,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface AdminComplaintsViewProps {
  complaints: Complaint[];
  onNavigate: (view: string, complaintId?: string) => void;
  onOpenSendToAuthority: (complaint: Complaint) => void;
  onOpenRejectModal: (complaint: Complaint) => void;
}

export const AdminComplaintsView: React.FC<AdminComplaintsViewProps> = ({
  complaints,
  onNavigate,
  onOpenSendToAuthority,
  onOpenRejectModal,
}) => {
  // Multi-Filter state
  const [filters, setFilters] = useState<AdminFilters>({
    city: 'All Cities',
    ward: 'All Wards',
    department: 'All Departments',
    category: 'All Categories',
    status: 'All Statuses',
    search: '',
    dateRange: 'all',
  });

  const [sortField, setSortField] = useState<'createdAt' | 'aiConfidence' | 'complaintId'>('createdAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Real Multi-Filtering execution
  const filteredComplaints = dataStore.filterComplaints(filters);

  // Sorting
  const sorted = [...filteredComplaints].sort((a, b) => {
    if (sortField === 'createdAt') {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    }
    if (sortField === 'aiConfidence') {
      const confA = a.aiConfidence || 0;
      const confB = b.aiConfidence || 0;
      return sortAsc ? confA - confB : confB - confA;
    }
    return sortAsc
      ? a.complaintId.localeCompare(b.complaintId)
      : b.complaintId.localeCompare(a.complaintId);
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleResetFilters = () => {
    setFilters({
      city: 'All Cities',
      ward: 'All Wards',
      department: 'All Departments',
      category: 'All Categories',
      status: 'All Statuses',
      search: '',
      dateRange: 'all',
    });
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Complaint ID',
      'Category',
      'AI Confidence',
      'City',
      'Area',
      'Ward',
      'Department',
      'Status',
      'Created At',
      'Address',
    ];

    const rows = sorted.map((c) => [
      c.complaintId,
      c.finalCategory,
      `${Math.round((c.aiConfidence || 0.9) * 100)}%`,
      c.city,
      c.area,
      c.demoWardNumber,
      `"${c.departmentName}"`,
      c.status,
      c.createdAt,
      `"${c.address.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smart_civic_complaints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickStatusChange = (complaintId: string, newStatus: ComplaintStatus) => {
    dataStore.updateStatus(complaintId, newStatus, `Status updated to ${newStatus} by Ward Officer.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER & CSV EXPORT */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Municipal Complaint Register</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Displaying {sorted.length} matching tickets across Dahisar R/North Demo Wards
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="py-2.5 px-4 rounded-xl bg-[#071A2F]/80 hover:bg-[#071A2F] text-white text-xs font-semibold border border-cyan-500/30 shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00D6B8]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6-WAY FILTER PANEL (CRITICAL REQUIREMENT) */}
      <div className="p-5 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-white">
            <Filter className="w-3.5 h-3.5 text-[#00D6B8]" />
            <span>Active Filters & Query</span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-semibold text-[#00D6B8] hover:text-cyan-300 flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setCurrentPage(1);
            }}
            placeholder="Search complaint ID, description, address, category, or citizen name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
          />
        </div>

        {/* 5 DROPDOWNS: CITY, WARD, DEPARTMENT, CATEGORY, STATUS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* CITY */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
            <select
              value={filters.city}
              onChange={(e) => {
                setFilters({ ...filters, city: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="All Cities" className="bg-[#031223] text-white">All Cities</option>
              <option value="Mumbai" className="bg-[#031223] text-white">Mumbai</option>
            </select>
          </div>

          {/* WARD */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Demo Ward</label>
            <select
              value={filters.ward}
              onChange={(e) => {
                setFilters({ ...filters, ward: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="All Wards" className="bg-[#031223] text-white">All Wards</option>
              {DEMO_WARDS.map((w) => (
                <option key={w.demoWardNumber} value={w.demoWardNumber} className="bg-[#031223] text-white">
                  {w.demoWardNumber}
                </option>
              ))}
            </select>
          </div>

          {/* DEPARTMENT */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => {
                setFilters({ ...filters, department: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="All Departments" className="bg-[#031223] text-white">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#031223] text-white">
                  {d.shortCode} – {d.departmentName.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="All Categories" className="bg-[#031223] text-white">All Categories</option>
              {CIVIC_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#031223] text-white">
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="All Statuses" className="bg-[#031223] text-white">All Statuses</option>
              <option value="Pending" className="bg-[#031223] text-white">Pending</option>
              <option value="In Progress" className="bg-[#031223] text-white">In Progress</option>
              <option value="Resolved" className="bg-[#031223] text-white">Resolved</option>
              <option value="Rejected" className="bg-[#031223] text-white">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* COMPLAINTS DATA TABLE */}
      <div className="p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
        {paginated.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-white">No complaints matching filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters to show all registered records.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#071A2F] hover:bg-[#071A2F]/80 text-white text-xs font-semibold border border-cyan-500/25 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#071A2F]/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-cyan-500/20">
                <tr>
                  <th className="py-3 px-3 rounded-l-xl">ID</th>
                  <th className="py-3 px-2">Image</th>
                  <th className="py-3 px-3">Problem</th>
                  <th className="py-3 px-3">AI Confidence</th>
                  <th className="py-3 px-3">City / Area</th>
                  <th className="py-3 px-3">Ward</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/15">
                {paginated.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#071A2F]/70 transition-colors group cursor-pointer"
                    onClick={() => onNavigate('complaint_detail', c.complaintId)}
                  >
                    {/* ID */}
                    <td className="py-3 px-3 font-bold text-[#00D6B8] whitespace-nowrap">
                      {c.complaintId}
                    </td>

                    {/* IMAGE */}
                    <td className="py-3 px-2">
                      <img
                        src={c.imageUrl}
                        alt="Thumbnail"
                        className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 shadow-2xs"
                      />
                    </td>

                    {/* PROBLEM */}
                    <td className="py-3 px-3 font-semibold text-white capitalize whitespace-nowrap">
                      {c.finalCategory.replace('_', ' ')}
                    </td>

                    {/* AI CONFIDENCE */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-200">
                        {Math.round((c.aiConfidence || 0.93) * 100)}%
                      </span>
                    </td>

                    {/* CITY / AREA */}
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {c.city} • {c.area}
                    </td>

                    {/* WARD */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-[#00D6B8]">{c.demoWardNumber}</span>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[150px]">
                      {c.departmentName}
                    </td>

                    {/* STATUS DROPDOWN */}
                    <td
                      className="py-3 px-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={c.status}
                        onChange={(e) => handleQuickStatusChange(c.complaintId, e.target.value as ComplaintStatus)}
                        className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-full border focus:outline-none cursor-pointer ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                            : c.status === 'In Progress'
                            ? 'bg-sky-950/70 text-sky-300 border-sky-500/30'
                            : c.status === 'Rejected'
                            ? 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                            : 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="Pending" className="bg-[#031223] text-white">Pending</option>
                        <option value="In Progress" className="bg-[#031223] text-white">In Progress</option>
                        <option value="Resolved" className="bg-[#031223] text-white">Resolved</option>
                        <option value="Rejected" className="bg-[#031223] text-white">Rejected</option>
                      </select>
                    </td>

                    {/* DATE */}
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* ACTIONS */}
                    <td
                      className="py-3 px-3 text-right whitespace-nowrap space-x-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenSendToAuthority(c)}
                        className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/60 transition-colors cursor-pointer"
                        title="Send to Authority (Demo Showcase)"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {c.status !== 'Rejected' && c.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => onOpenRejectModal(c)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition-colors cursor-pointer"
                          title="Reject Complaint"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onNavigate('complaint_detail', c.complaintId)}
                        className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {currentPage} of {totalPages} ({sorted.length} total tickets)
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded-xl border text-xs font-semibold ${
                  currentPage === 1
                    ? 'border-cyan-500/15 text-slate-600 cursor-not-allowed bg-[#071A2F]/40'
                    : 'border-cyan-500/30 text-white hover:bg-[#071A2F] bg-[#071A2F]/80 cursor-pointer'
                }`}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-1 rounded-xl border text-xs font-semibold ${
                  currentPage === totalPages
                    ? 'border-cyan-500/15 text-slate-600 cursor-not-allowed bg-[#071A2F]/40'
                    : 'border-cyan-500/30 text-white hover:bg-[#071A2F] bg-[#071A2F]/80 cursor-pointer'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
