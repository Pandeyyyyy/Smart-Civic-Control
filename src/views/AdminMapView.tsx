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
      <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Geospatial Operations Map</h2>
            <p className="text-xs text-slate-500">
              Interactive Dahisar municipal grid • Plotting {filtered.length} filtered pins
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Map Filters</span>
          </button>
        </div>

        {/* COMPACT FILTER BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="All Cities">All Cities</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Demo Ward</label>
            <select
              value={filters.ward}
              onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="All Wards">All Wards</option>
              {DEMO_WARDS.map((w) => (
                <option key={w.demoWardNumber} value={w.demoWardNumber}>
                  {w.demoWardNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="All Departments">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="All Categories">All Categories</option>
              {CIVIC_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full p-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
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
