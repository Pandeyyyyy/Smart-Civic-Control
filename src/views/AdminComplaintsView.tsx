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
      <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Municipal Complaint Register</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Displaying {sorted.length} matching tickets across Dahisar R/North Demo Wards
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-interactive py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6-WAY FILTER PANEL (CRITICAL REQUIREMENT) */}
      <div className="p-5 rounded-3xl glass-panel shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-teal-700" />
            <span>Active Filters & Query</span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        {/* 5 DROPDOWNS: CITY, WARD, DEPARTMENT, CATEGORY, STATUS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* CITY */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">City</label>
            <select
              value={filters.city}
              onChange={(e) => {
                setFilters({ ...filters, city: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All Cities">All Cities</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          {/* WARD */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Demo Ward</label>
            <select
              value={filters.ward}
              onChange={(e) => {
                setFilters({ ...filters, ward: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All Wards">All Wards</option>
              {DEMO_WARDS.map((w) => (
                <option key={w.demoWardNumber} value={w.demoWardNumber}>
                  {w.demoWardNumber}
                </option>
              ))}
            </select>
          </div>

          {/* DEPARTMENT */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => {
                setFilters({ ...filters, department: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All Departments">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortCode} – {d.departmentName.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All Categories">All Categories</option>
              {CIVIC_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* COMPLAINTS DATA TABLE */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs">
        {paginated.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-slate-700">No complaints matching filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters to show all registered records.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200/60">
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
              <tbody className="divide-y divide-slate-100">
                {paginated.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onNavigate('complaint_detail', c.complaintId)}
                  >
                    {/* ID */}
                    <td className="py-3 px-3 font-bold text-teal-800 whitespace-nowrap">
                      {c.complaintId}
                    </td>

                    {/* IMAGE */}
                    <td className="py-3 px-2">
                      <img
                        src={c.imageUrl}
                        alt="Thumbnail"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                      />
                    </td>

                    {/* PROBLEM */}
                    <td className="py-3 px-3 font-semibold text-slate-800 capitalize whitespace-nowrap">
                      {c.finalCategory.replace('_', ' ')}
                    </td>

                    {/* AI CONFIDENCE */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">
                        {Math.round((c.aiConfidence || 0.93) * 100)}%
                      </span>
                    </td>

                    {/* CITY / AREA */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {c.city} • {c.area}
                    </td>

                    {/* WARD */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-teal-800">{c.demoWardNumber}</span>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]">
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
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'In Progress'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : c.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* DATE */}
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
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
                        className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
                        title="Send to Authority (Demo Showcase)"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {c.status !== 'Rejected' && c.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => onOpenRejectModal(c)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Reject Complaint"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onNavigate('complaint_detail', c.complaintId)}
                        className="py-1 px-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11px] font-semibold transition-colors"
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
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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
