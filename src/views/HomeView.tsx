import React, { useEffect, useRef, useState } from 'react';
import { LogoSymbol } from '../components/LogoSymbol';
import { User } from '../types';
import {
  Upload,
  Cpu,
  MapPin,
  Building2,
  CheckCircle2,
  Trash2,
  AlertOctagon,
  Droplets,
  Lightbulb,
  Dam,
  Trees,
  Construction,
  ArrowRight,
  Shield,
  Phone,
  Mail,
  Check,
} from 'lucide-react';

interface HomeViewProps {
  currentUser: User | null;
  onNavigate: (view: string, presetIdOrSection?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ currentUser, onNavigate }) => {
  // Animated Counters state
  const [statsCounted, setStatsCounted] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [accuracyCount, setAccuracyCount] = useState(0);
  const [wardCount, setWardCount] = useState(0);
  const [responseHours, setResponseHours] = useState(0);

  // IntersectionObserver refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({ hero: true });

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleSections({
        hero: true,
        stats: true,
        howItWorks: true,
        categories: true,
        about: true,
        contact: true,
      });
      setResolvedCount(1248);
      setAccuracyCount(94);
      setWardCount(6);
      setResponseHours(18);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute('data-section');
            if (section) {
              setVisibleSections((prev) => ({ ...prev, [section]: true }));

              // Trigger counter animation when stats section enters view
              if (section === 'stats' && !statsCounted) {
                setStatsCounted(true);
                animateCounters();
              }
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = [heroRef, statsRef, howItWorksRef, categoriesRef, aboutRef, contactRef];
    sections.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [statsCounted]);

  const animateCounters = () => {
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setResolvedCount(Math.round(progress * 1248));
      setAccuracyCount(Math.round(progress * 94));
      setWardCount(Math.round(progress * 6));
      setResponseHours(Math.round(progress * 18));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);
  };

  const steps = [
    {
      num: '01',
      title: 'Upload Image',
      desc: 'Capture or browse a photo of the civic issue directly from your smartphone or computer.',
      icon: Upload,
    },
    {
      num: '02',
      title: 'AI Multimodal Detection',
      desc: 'Trained civic vision classifier evaluates the image with natural language description weighting.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Geocoded Location',
      desc: 'Browser GPS or Dahisar Demo Ward detection assigns precise geographic coordinates.',
      icon: MapPin,
    },
    {
      num: '04',
      title: 'Department Assignment',
      desc: 'Automatic routing engine directs ticket to the responsible municipal department and engineer.',
      icon: Building2,
    },
    {
      num: '05',
      title: 'Track Resolution',
      desc: 'Monitor real-time progress timeline, field updates, and submit satisfaction feedback upon closure.',
      icon: CheckCircle2,
    },
  ];

  const categories = [
    { id: 'garbage_overflow', label: 'Garbage Overflow', icon: Trash2, dept: 'Solid Waste Management' },
    { id: 'pothole', label: 'Pothole', icon: AlertOctagon, dept: 'Road Department' },
    { id: 'water_leakage', label: 'Water Leakage', icon: Droplets, dept: 'Hydraulic Department' },
    { id: 'broken_streetlight', label: 'Broken Streetlight', icon: Lightbulb, dept: 'Electrical Department' },
    { id: 'drainage_blockage', label: 'Drainage Blockage', icon: Dam, dept: 'Drainage Department' },
    { id: 'illegal_dumping', label: 'Illegal Dumping', icon: Trash2, dept: 'Solid Waste Management' },
    { id: 'road_damage', label: 'Road Damage', icon: Construction, dept: 'Road Department' },
    { id: 'fallen_tree', label: 'Fallen Tree', icon: Trees, dept: 'Tree / Garden Dept' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white relative selection:bg-[#00D6B8]/30 selection:text-[#22D3EE] overflow-x-hidden">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION: CINEMATIC LEFT-ALIGNED HERO */}
      {/* ---------------------------------------------------- */}
      <section
        ref={heroRef}
        data-section="hero"
        className="relative min-h-[92vh] flex items-center pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT SIDE: BRANDING, HEADLINE, CTAS, TESTBED */}
          <div
            className={`lg:col-span-7 xl:col-span-7 text-left transition-all duration-700 ${
              visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* BRANDING BADGE */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#031223]/70 backdrop-blur-md border border-cyan-500/30 shadow-lg shadow-cyan-950/20 mb-6">
              <LogoSymbol size={28} showAura />
              <span className="text-xs sm:text-sm font-semibold text-cyan-300 tracking-tight">
                Smart Civic Connect
              </span>
              <span className="text-[10px] text-cyan-400/80 font-medium hidden sm:inline border-l border-cyan-500/30 pl-2">
                AI Urban Service Platform
              </span>
            </div>

            {/* MAIN HEADLINE */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-xl">
              Cleaner Cities, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D6B8] via-[#22D3EE] to-[#38BDF8]">
                Happier Communities
              </span>
            </h1>

            {/* SUPPORTING DESCRIPTION */}
            <p className="mt-5 text-base sm:text-lg text-slate-200/90 max-w-xl font-normal leading-relaxed drop-shadow-md">
              AI-powered civic complaint management for smarter, safer communities.
              Report urban issues with instant multimodal vision and geocoded ward routing.
            </p>

            {/* CALL TO ACTION BUTTONS */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    onNavigate('report_problem');
                  } else {
                    onNavigate('login');
                  }
                }}
                className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-sm font-semibold shadow-lg shadow-teal-500/25 flex items-center space-x-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <span>Report a Problem</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3.5 px-6 rounded-2xl bg-[#031223]/65 hover:bg-[#071A2F]/80 text-white text-sm font-semibold border border-cyan-500/25 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:border-cyan-400/50 cursor-pointer"
              >
                <span>Learn How It Works</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin_dashboard')}
                  className="py-3.5 px-6 rounded-2xl bg-[#031223]/80 hover:bg-slate-900 text-white text-sm font-semibold border border-teal-500/30 backdrop-blur-md transition-all flex items-center space-x-2 hover:border-teal-400 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span>Admin Operations</span>
                </button>
              )}
            </div>

            {/* OPERATIONAL TESTBED INDICATOR */}
            <div className="mt-8 inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#031223]/60 backdrop-blur-md border border-cyan-500/20 text-xs text-slate-300 shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D6B8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D6B8]"></span>
              </span>
              <span className="text-slate-400">Operational Testbed:</span>
              <strong className="text-white font-semibold">Mumbai • Dahisar (R/North Demo Wards 01–06)</strong>
            </div>
          </div>

          {/* RIGHT SIDE: CLEAR SPACE FOR THE ROTATING EARTH BACKGROUND VIDEO */}
          <div
            className="hidden lg:block lg:col-span-5 xl:col-span-5 min-h-[420px] pointer-events-none select-none"
            aria-hidden="true"
          >
            {/* Transparent clear zone allowing full visibility of the rotating Earth in the background video */}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. STATS & LIVE CIVIC INTELLIGENCE PANEL */}
      {/* ---------------------------------------------------- */}
      <section
        ref={statsRef}
        data-section="stats"
        className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 mb-20 relative z-10"
      >
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-[#031223]/65 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-black/50 grid grid-cols-2 md:grid-cols-4 gap-6 text-center transition-all duration-700 ${
            visibleSections.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#00D6B8] tracking-tight drop-shadow-sm">
              {resolvedCount}+
            </span>
            <h4 className="text-xs font-bold text-white mt-1.5 uppercase tracking-wider">
              Issues Resolved
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Across Dahisar R/North</p>
          </div>

          <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-300 tracking-tight drop-shadow-sm">
              {accuracyCount}%
            </span>
            <h4 className="text-xs font-bold text-white mt-1.5 uppercase tracking-wider">
              AI Accuracy Match
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Multimodal Vision + NLP</p>
          </div>

          <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#00D6B8] tracking-tight drop-shadow-sm">
              {wardCount}
            </span>
            <h4 className="text-xs font-bold text-white mt-1.5 uppercase tracking-wider">
              Demo Wards Covered
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">East & West Sectors</p>
          </div>

          <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-300 tracking-tight drop-shadow-sm">
              &lt; {responseHours}h
            </span>
            <h4 className="text-xs font-bold text-white mt-1.5 uppercase tracking-wider">
              Avg Field Dispatch
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Target SLA Execution</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. HOW IT WORKS SECTION */}
      {/* ---------------------------------------------------- */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        data-section="howItWorks"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-[#00D6B8] uppercase">
            Civic Resolution Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-2 tracking-tight">
            How Smart Civic Connect Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            From smartphone image capture to automated municipal field dispatch in 5 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isVisible = visibleSections.howItWorks;

            return (
              <div
                key={st.num}
                style={{
                  transitionDelay: `${idx * 120}ms`,
                }}
                className={`p-5 rounded-3xl bg-[#031223]/65 backdrop-blur-xl border border-cyan-500/15 hover:border-cyan-400/50 shadow-xl hover:shadow-cyan-950/40 hover:-translate-y-1.5 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-[#00D6B8] tracking-wider">
                    {st.num}
                  </span>
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/25 text-[#22D3EE] shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white">{st.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. PROBLEM CATEGORIES SECTION */}
      {/* ---------------------------------------------------- */}
      <section
        id="categories"
        ref={categoriesRef}
        data-section="categories"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-[#00D6B8] uppercase">
            Multimodal Classification
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-2 tracking-tight">
            Supported Problem Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            Our vision pipeline classifies urban issues into 9 distinct municipal categories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isVisible = visibleSections.categories;

            return (
              <div
                key={cat.id}
                style={{
                  transitionDelay: `${idx * 80}ms`,
                }}
                onClick={() => {
                  if (currentUser) onNavigate('report_problem');
                  else onNavigate('login');
                }}
                className={`p-5 rounded-3xl bg-[#031223]/65 backdrop-blur-xl border border-cyan-500/15 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-950/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-500/25 flex items-center justify-center text-[#00D6B8] group-hover:text-cyan-300 group-hover:border-cyan-400/50 mb-3 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{cat.dept}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. ABOUT / SMART CITY IMPACT SECTION */}
      {/* ---------------------------------------------------- */}
      <section
        id="about"
        ref={aboutRef}
        data-section="about"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <div
          className={`p-8 sm:p-12 rounded-3xl bg-[#031223]/65 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-700 ${
            visibleSections.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#00D6B8] tracking-widest uppercase">
              About Smart Civic Connect
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Pioneering Clean, Sustainable Communities Through Civic Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Smart Civic Connect transforms municipal service delivery by eliminating red tape and classification guesswork. By uniting computer vision with localized geographic boundaries, grievances are directed to the exact engineers responsible within seconds of reporting.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[#00D6B8] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-white">No Fake Predictions:</strong> Robust inference with transparent fallback and low-confidence warnings.</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[#00D6B8] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-white">Separation of Concerns:</strong> Administrative wards derived from coordinates, never from images.</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[#00D6B8] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-white">Transparent Accountability:</strong> Complete resolution audit trails with citizen satisfaction ratings.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30 group">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="Modern sustainable architecture with greenery"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. CONTACT & MUNICIPAL DESK SECTION */}
      {/* ---------------------------------------------------- */}
      <section
        id="contact"
        ref={contactRef}
        data-section="contact"
        className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center relative z-10"
      >
        <div
          className={`p-8 rounded-3xl bg-[#031223]/65 backdrop-blur-xl border border-cyan-500/20 shadow-xl space-y-4 transition-all duration-700 ${
            visibleSections.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Municipal Grievance Helpline</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Operating under Dahisar R/North Administrative Ward. For life-threatening emergencies, dial emergency services immediately.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-cyan-500/15">
              <Phone className="w-4 h-4 text-[#00D6B8]" />
              <span>Helpline: <strong className="text-white font-semibold">1916</strong> (Toll Free)</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-cyan-500/15">
              <Mail className="w-4 h-4 text-[#00D6B8]" />
              <span>Email: <strong className="text-white font-semibold">desk.rnorth@smartcivic.gov.in</strong></span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-cyan-500/15">
              <MapPin className="w-4 h-4 text-[#00D6B8]" />
              <span>Location: <strong className="text-white font-semibold">Dahisar, Mumbai 400068</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-cyan-500/15 bg-[#020817]/60 backdrop-blur-xl py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <LogoSymbol size={30} />
            <span className="text-sm font-bold text-white tracking-tight">Smart Civic Connect</span>
          </div>
          <p className="text-xs text-slate-400 text-center sm:text-right">
            AI-Based Civic Complaint and Urban Service Management System • Academic College Demonstration
          </p>
        </div>
      </footer>
    </div>
  );
};
