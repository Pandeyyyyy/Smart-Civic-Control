import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { DEMO_WARDS } from '../data/seedData';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';

interface InteractiveMapProps {
  complaints?: Complaint[];
  selectedLocation?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
  height?: string | number;
  className?: string;
  onComplaintSelect?: (complaint: Complaint) => void;
  highlightWard?: string;
}

// Bounding box for Dahisar, Mumbai (R/North)
const BOUNDS = {
  minLat: 19.238,
  maxLat: 19.274,
  minLng: 72.835,
  maxLng: 72.878,
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  complaints = [],
  selectedLocation,
  onLocationSelect,
  interactive = false,
  height = '420px',
  className = '',
  onComplaintSelect,
  highlightWard,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedMarker, setSelectedMarker] = useState<Complaint | null>(null);
  const [showWardBoundaries, setShowWardBoundaries] = useState(true);

  // Convert lat/lng to percentage X/Y in Dahisar viewport
  const coordsToPercent = (lat: number, lng: number) => {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return {
      x: Math.max(4, Math.min(96, x)),
      y: Math.max(6, Math.min(94, y)),
    };
  };

  // Convert percentage X/Y back to lat/lng
  const percentToCoords = (px: number, py: number) => {
    const lng = BOUNDS.minLng + (px / 100) * (BOUNDS.maxLng - BOUNDS.minLng);
    const lat = BOUNDS.maxLat - (py / 100) * (BOUNDS.maxLat - BOUNDS.minLat);
    return { lat, lng };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onLocationSelect) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const { lat, lng } = percentToCoords(px, py);
    onLocationSelect(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Resolved':
        return '#16A34A'; // Green
      case 'In Progress':
        return '#0284C7'; // Blue
      case 'Pending':
        return '#D97706'; // Amber
      case 'Rejected':
        return '#DC2626'; // Red
      default:
        return '#0F766E';
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-[#EEF2F7] shadow-sm select-none ${className}`}
      style={{ height }}
    >
      {/* MAP BACKGROUND GRAPHIC (DAHISAR, MUMBAI URBAN GRID & WARDS) */}
      <div
        className="absolute inset-0 cursor-crosshair overflow-hidden transition-transform duration-200"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        onClick={handleMapClick}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="urbanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,3" />
            </pattern>
            <linearGradient id="creekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Background land */}
          <rect width="1000" height="650" fill="#F1F5F9" />
          <rect width="1000" height="650" fill="url(#urbanGrid)" />

          {/* Dahisar Creek / Coastal Wetland (West edge) */}
          <path
            d="M 0 0 C 120 180 80 320 160 480 C 190 540 140 650 140 650 L 0 650 Z"
            fill="url(#creekGrad)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          <text x="35" y="320" fill="#0284C7" fontSize="13" fontWeight="600" opacity="0.65" transform="rotate(-75 35 320)">
            Dahisar Creek & Mangroves
          </text>

          {/* Western Express Highway (East corridor) */}
          <path
            d="M 820 0 L 800 650"
            stroke="#94A3B8"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 820 0 L 800 650"
            stroke="#F8FAFC"
            strokeWidth="1.5"
            strokeDasharray="10,8"
          />
          <text x="830" y="240" fill="#475569" fontSize="11" fontWeight="700" letterSpacing="1" transform="rotate(88 830 240)">
            WESTERN EXPRESS HIGHWAY (NH-48)
          </text>

          {/* New Link Road (West corridor) */}
          <path
            d="M 310 0 C 330 220 340 400 350 650"
            stroke="#CBD5E1"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <text x="325" y="160" fill="#64748B" fontSize="11" fontWeight="600" transform="rotate(86 325 160)">
            New Link Road (Dahisar West)
          </text>

          {/* Dahisar Railway Line (Center) */}
          <path
            d="M 580 0 L 590 650"
            stroke="#475569"
            strokeWidth="3.5"
          />
          <path
            d="M 580 0 L 590 650"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="6,6"
          />

          {/* Dahisar Station Marker */}
          <rect x="568" y="290" width="46" height="26" rx="4" fill="#0F172A" />
          <text x="591" y="307" fill="#FFFFFF" fontSize="10" fontWeight="700" textAnchor="middle">
            DAHISAR STN
          </text>

          {/* DEMO WARD BOUNDARIES & LABELS */}
          {showWardBoundaries && (
            <g id="demo-ward-overlays">
              {/* Ward 01 - Dahisar East Station */}
              <rect x="590" y="120" width="200" height="220" rx="12" fill={highlightWard === 'Demo Ward 01' ? '#CCFBF1' : '#F8FAFC'} fillOpacity={highlightWard === 'Demo Ward 01' ? 0.6 : 0.25} stroke="#0F766E" strokeWidth={highlightWard === 'Demo Ward 01' ? 2.5 : 1.2} strokeDasharray="5,4" />
              <text x="690" y="150" fill="#0F766E" fontSize="12" fontWeight="700" textAnchor="middle">
                DEMO WARD 01
              </text>
              <text x="690" y="166" fill="#64748B" fontSize="10" textAnchor="middle">
                Dahisar East (Anand Nagar)
              </text>

              {/* Ward 02 - Rawalpada */}
              <rect x="730" y="320" width="220" height="200" rx="12" fill={highlightWard === 'Demo Ward 02' ? '#CCFBF1' : '#F8FAFC'} fillOpacity={highlightWard === 'Demo Ward 02' ? 0.6 : 0.25} stroke="#0F766E" strokeWidth={highlightWard === 'Demo Ward 02' ? 2.5 : 1.2} strokeDasharray="5,4" />
              <text x="840" y="350" fill="#0F766E" fontSize="12" fontWeight="700" textAnchor="middle">
                DEMO WARD 02
              </text>
              <text x="840" y="366" fill="#64748B" fontSize="10" textAnchor="middle">
                Rawalpada & Ketkipada
              </text>

              {/* Ward 03 - Kandar Pada */}
              <rect x="240" y="80" width="280" height="240" rx="12" fill={highlightWard === 'Demo Ward 03' ? '#CCFBF1' : '#F8FAFC'} fillOpacity={highlightWard === 'Demo Ward 03' ? 0.6 : 0.25} stroke="#0F766E" strokeWidth={highlightWard === 'Demo Ward 03' ? 2.5 : 1.2} strokeDasharray="5,4" />
              <text x="380" y="110" fill="#0F766E" fontSize="12" fontWeight="700" textAnchor="middle">
                DEMO WARD 03
              </text>
              <text x="380" y="126" fill="#64748B" fontSize="10" textAnchor="middle">
                Kandar Pada & Link Road
              </text>

              {/* Ward 04 - Mandapeshwar */}
              <rect x="260" y="350" width="270" height="240" rx="12" fill={highlightWard === 'Demo Ward 04' ? '#CCFBF1' : '#F8FAFC'} fillOpacity={highlightWard === 'Demo Ward 04' ? 0.6 : 0.25} stroke="#0F766E" strokeWidth={highlightWard === 'Demo Ward 04' ? 2.5 : 1.2} strokeDasharray="5,4" />
              <text x="395" y="380" fill="#0F766E" fontSize="12" fontWeight="700" textAnchor="middle">
                DEMO WARD 04
              </text>
              <text x="395" y="396" fill="#64748B" fontSize="10" textAnchor="middle">
                Mandapeshwar Caves Area
              </text>

              {/* Ward 05 - Ashokvan */}
              <rect x="620" y="440" width="200" height="190" rx="12" fill={highlightWard === 'Demo Ward 05' ? '#CCFBF1' : '#F8FAFC'} fillOpacity={highlightWard === 'Demo Ward 05' ? 0.6 : 0.25} stroke="#0F766E" strokeWidth={highlightWard === 'Demo Ward 05' ? 2.5 : 1.2} strokeDasharray="5,4" />
              <text x="720" y="470" fill="#0F766E" fontSize="12" fontWeight="700" textAnchor="middle">
                DEMO WARD 05
              </text>
              <text x="720" y="486" fill="#64748B" fontSize="10" textAnchor="middle">
                Ashokvan & WEH
              </text>

              {/* Ward 06 - Gaothan / Coastal */}
              <rect x="130" y="10" width="160" height="240" rx="12" fill={highlightWard === 'Demo Ward 06' ? '#CCFBF1' : '#F8FAFC'} fillOpacity={highlightWard === 'Demo Ward 06' ? 0.6 : 0.25} stroke="#0F766E" strokeWidth={highlightWard === 'Demo Ward 06' ? 2.5 : 1.2} strokeDasharray="5,4" />
              <text x="210" y="40" fill="#0F766E" fontSize="12" fontWeight="700" textAnchor="middle">
                DEMO WARD 06
              </text>
              <text x="210" y="56" fill="#64748B" fontSize="10" textAnchor="middle">
                Gaothan & Creek Belt
              </text>
            </g>
          )}
        </svg>

        {/* COMPLAINT MARKERS */}
        {complaints.map((c) => {
          const { x, y } = coordsToPercent(c.latitude, c.longitude);
          const color = getStatusColor(c.status);
          const isSelected = selectedMarker?.id === c.id;

          return (
            <div
              key={c.id}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10 transition-transform duration-150 hover:scale-125"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMarker(c);
                if (onComplaintSelect) onComplaintSelect(c);
              }}
            >
              <div
                className="flex items-center justify-center p-1.5 rounded-full shadow-md text-white border-2 border-white"
                style={{ backgroundColor: color }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <div
                className="w-1 h-2 mx-auto shadow-sm"
                style={{ backgroundColor: color }}
              />
            </div>
          );
        })}

        {/* SELECTED / CURRENT LOCATION PIN (For Report Problem) */}
        {selectedLocation && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-20 animate-bounce"
            style={{
              left: `${coordsToPercent(selectedLocation.lat, selectedLocation.lng).x}%`,
              top: `${coordsToPercent(selectedLocation.lat, selectedLocation.lng).y}%`,
            }}
          >
            <div className="flex flex-col items-center">
              <div className="px-2 py-0.5 rounded-full bg-teal-800 text-white text-[11px] font-semibold shadow-lg whitespace-nowrap mb-0.5">
                Reported Location
              </div>
              <div className="p-2 rounded-full bg-[#0F766E] text-white shadow-xl ring-4 ring-teal-300/60">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="w-1.5 h-3 bg-[#0F766E]" />
            </div>
          </div>
        )}
      </div>

      {/* TOP CONTROLS OVERLAY (GLASS PANEL) */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm flex items-center space-x-2 text-xs font-medium text-slate-700">
          <Navigation className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Mumbai • Dahisar (R/North)</span>
          <span className="text-slate-400">|</span>
          <span className="text-teal-700 font-semibold">{complaints.length} issues</span>
        </div>

        <div className="pointer-events-auto flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setShowWardBoundaries(!showWardBoundaries)}
            className={`p-2 rounded-xl border backdrop-blur-md shadow-sm text-xs flex items-center space-x-1 transition-colors ${
              showWardBoundaries
                ? 'bg-teal-700 text-white border-teal-600'
                : 'bg-white/80 text-slate-700 border-white/60 hover:bg-white'
            }`}
            title="Toggle Demo Ward Boundaries"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Wards</span>
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.2))}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm text-slate-700 hover:bg-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm text-slate-700 hover:bg-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BOTTOM LEGEND OVERLAY */}
      <div className="absolute bottom-3 left-3 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/70 shadow-sm flex items-center space-x-3 text-[11px] text-slate-600">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Pending</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>In Progress</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Resolved</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>Rejected</span>
          </span>
        </div>
      </div>

      {/* CLICKED MARKER GLASS INFO CARD */}
      {selectedMarker && (
        <div className="absolute top-14 left-4 right-4 sm:right-auto sm:w-80 pointer-events-auto z-30 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-xl text-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 mb-1">
                  {selectedMarker.complaintId}
                </span>
                <h4 className="text-sm font-semibold capitalize text-slate-900">
                  {selectedMarker.finalCategory.replace('_', ' ')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMarker(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 my-2">
              {selectedMarker.description}
            </p>

            <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2 mb-3">
              <div className="flex justify-between">
                <span>Ward:</span>
                <span className="font-medium text-slate-700">{selectedMarker.demoWardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Dept:</span>
                <span className="font-medium text-slate-700 truncate max-w-[170px]">{selectedMarker.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className="font-semibold"
                  style={{ color: getStatusColor(selectedMarker.status) }}
                >
                  {selectedMarker.status}
                </span>
              </div>
            </div>

            {onComplaintSelect && (
              <button
                type="button"
                onClick={() => onComplaintSelect(selectedMarker)}
                className="w-full py-1.5 px-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-medium flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
              >
                <span>View Full Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE HINT FOR CITIZEN LOCATION SELECTION */}
      {interactive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium shadow-md">
            Click anywhere on the map to pinpoint complaint location
          </div>
        </div>
      )}
    </div>
  );
};
