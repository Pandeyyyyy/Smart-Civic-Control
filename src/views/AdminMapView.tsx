import React, { useState } from 'react';
import { Complaint, AdminFilters } from '../types';
import { dataStore } from '../services/dataStore';
import { InteractiveMap } from '../components/InteractiveMap';
import { DEMO_WARDS, DEPARTMENTS } from '../data/seedData';
import { CIVIC_CATEGORIES } from '../services/aiService';
import { getCategoryLabel } from '../services/departmentRouter';
import { Filter, RotateCcw, MapPin, Navigation, Info } from 'lucide-react';

interface AdminMapViewProps {
  complaints: Complaint[];
  onNavigate: (view: string, complaintId?: string) => void;
}

export const AdminMapView: React.FC<AdminMapViewProps> = ({
  complaints,
  onNavigate,
}) => {
  const [filters, setFilters] = useState<AdminFilters>({
    city: 'All Cities',
    ward: 'All Wards',
    department: 'All Departments',
    category: 'All Categories',
    status: 'All Statuses',
    search: '',
    dateRange: 'all',
  });

  const filtered = dataStore.filterComplaints(filters);

  const handleReset = () => {
    setFilters({
      city: 'All Cities',
      ward: 'All Wards',
      department: 'All Departments',
      category: 'All Categories',
      status: 'All Statuses',
      search: '',
      dateRange: 'all',
    });
  };

  return (
    <div className="space-y-4 pb-16">
      {/* HEADER & FILTER CONTROLS */}
      <div className="p-5 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white">Geospatial Operations Map</h2>
            <p className="text-xs text-slate-400">
              Interactive Dahisar municipal grid • Plotting <span className="text-[#00D6B8] font-semibold">{filtered.length}</span> filtered pins
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#00D6B8] hover:text-cyan-300 flex items-center space-x-1 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Map Filters</span>
          </button>
        </div>

        {/* COMPACT FILTER BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              <option value="All Cities" className="bg-[#031223] text-white">All Cities</option>
              <option value="Mumbai" className="bg-[#031223] text-white">Mumbai</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Demo Ward</label>
            <select
              value={filters.ward}
              onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              <option value="All Wards" className="bg-[#031223] text-white">All Wards</option>
              {DEMO_WARDS.map((w) => (
                <option key={w.demoWardNumber} value={w.demoWardNumber} className="bg-[#031223] text-white">
                  {w.demoWardNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              <option value="All Departments" className="bg-[#031223] text-white">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#031223] text-white">
                  {d.shortCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              <option value="All Categories" className="bg-[#031223] text-white">All Categories</option>
              {CIVIC_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#031223] text-white">
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-cyan-500/30 bg-[#071A2F]/90 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
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

      {/* FULL MAP CANVAS */}
      <div className="relative">
        <InteractiveMap
          complaints={filtered}
          height="620px"
          onComplaintSelect={(c) => onNavigate('complaint_detail', c.complaintId)}
        />
      </div>
    </div>
  );
};
