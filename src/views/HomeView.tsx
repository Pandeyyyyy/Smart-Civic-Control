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
  Sparkles,
  ChevronDown,
  Clock,
  Layers,
  Phone,
  Mail,
  Check,
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/seedData';

// Static public asset path for the building + nature hero background
const heroCityNatureImg = '/hero-city-nature.jpg';

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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION: BUILDING + NATURE BACKGROUND & GLASS HERO */}
      {/* ---------------------------------------------------- */}
      <section
        ref={heroRef}
        data-section="hero"
        className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* REAL BUILDING + NATURE BACKGROUND IMAGE (SMART CITY SKYLINE + GREEN TREES + BLUE SKY) */}
        <div
          className="absolute inset-0 -z-20 overflow-hidden bg-cover bg-center bg-no-repeat bg-slate-900"
          style={{ backgroundImage: `url('${heroCityNatureImg}')` }}
        >
          <img
            src={heroCityNatureImg}
            alt="Smart City Skyline with Green Parks, Trees, and Nature"
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* REFINED READABILITY OVERLAY: PRESERVES VIVID SKYLINE, GREEN TREES & NATURE WHILE ENSURING CRISP CONTRAST FOR TEXT */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-900/40 to-[#F8FAFC]/90 -z-10" />

        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* LOGO SYMBOL + TITLE BADGE */}
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-md mb-6 animate-in fade-in duration-500">
            <LogoSymbol size={38} showAura />
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Smart Civic Connect
            </span>
          </div>

          {/* MAIN HEADLINES FROM SPECIFICATION */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
            Cleaner Cities, <br />
            <span className="text-teal-200">Happier Communities</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
            AI-powered civic complaint management for smarter, safer communities.
            Report urban issues with instant multimodal vision and geocoded ward routing.
          </p>

          {/* CALL TO ACTION BUTTONS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  onNavigate('report_problem');
                } else {
                  onNavigate('login');
                }
              }}
              className="py-3 px-7 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold shadow-xl shadow-teal-900/30 flex items-center space-x-2 transition-all hover:scale-[1.02]"
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
              className="py-3 px-6 rounded-2xl bg-white/85 hover:bg-white text-slate-900 text-sm font-semibold border border-white/60 shadow-lg backdrop-blur-md transition-all hover:scale-[1.02]"
            >
              <span>Learn How It Works</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => onNavigate('admin_dashboard')}
                className="py-3 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white text-sm font-semibold border border-white/20 backdrop-blur-md transition-all flex items-center space-x-1.5"
              >
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Admin Operations</span>
              </button>
            )}
          </div>

          {/* DEMO TESTBED NOTICE */}
          <div className="mt-6 inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-xs text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span>Operational Testbed:</span>
            <strong className="text-slate-900">Mumbai • Dahisar (R/North Demo Wards 01–06)</strong>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. STATS & LIVE CIVIC INTELLIGENCE PANEL (WITH COUNTER ANIMATIONS) */}
      {/* ---------------------------------------------------- */}
      <section
        ref={statsRef}
        data-section="stats"
        className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 mb-16 relative z-10"
      >
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/70 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center transition-all duration-700 ${
            visibleSections.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div>
            <span className="text-3xl sm:text-4xl font-extrabold text-[#0F766E] tracking-tight">
              {resolvedCount}+
            </span>
            <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
              Issues Resolved
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Across Dahisar R/North</p>
          </div>

          <div>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {accuracyCount}%
            </span>
            <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
              AI Accuracy Match
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Multimodal Vision + NLP</p>
          </div>

          <div>
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 tracking-tight">
              {wardCount}
            </span>
            <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
              Demo Wards Covered
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">East & West Sectors</p>
          </div>

          <div>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              &lt; {responseHours}h
            </span>
            <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
              Avg Field Dispatch
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Target SLA Execution</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. HOW IT WORKS SECTION (WITH SEQUENTIAL REVEAL) */}
      {/* ---------------------------------------------------- */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        data-section="howItWorks"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-12"
      >
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-[#0F766E] uppercase">
            Civic Resolution Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How Smart Civic Connect Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
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
                className={`p-5 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/60 shadow-xs hover:shadow-md transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-teal-700 tracking-wider">
                    {st.num}
                  </span>
                  <div className="p-2.5 rounded-xl bg-teal-50 text-[#0F766E] shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. PROBLEM CATEGORIES SECTION (STAGGERED CARDS) */}
      {/* ---------------------------------------------------- */}
      <section
        id="categories"
        ref={categoriesRef}
        data-section="categories"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-12"
      >
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-[#0F766E] uppercase">
            Multimodal Classification
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Supported Problem Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
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
                className={`p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 hover:border-teal-300 shadow-xs hover:shadow-md cursor-pointer transition-all duration-500 hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0F766E] mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{cat.label}</h3>
                <p className="text-[11px] text-slate-500 mt-1 truncate">{cat.dept}</p>
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
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16"
      >
        <div
          className={`p-8 sm:p-12 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-700 ${
            visibleSections.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#0F766E] tracking-widest uppercase">
              About Smart Civic Connect
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pioneering Clean, Sustainable Communities Through Civic Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Smart Civic Connect transforms municipal service delivery by eliminating red tape and classification guesswork. By uniting computer vision with localized geographic boundaries, grievances are directed to the exact engineers responsible within seconds of reporting.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-700">
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>No Fake Predictions:</strong> Robust inference with transparent fallback and low-confidence warnings.</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Separation of Concerns:</strong> Administrative wards derived from coordinates, never from images.</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Transparent Accountability:</strong> Complete resolution audit trails with citizen satisfaction ratings.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-white/80">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="Modern sustainable architecture with greenery"
                className="w-full h-80 object-cover"
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
        className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center"
      >
        <div
          className={`p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-4 transition-all duration-700 ${
            visibleSections.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-xl font-bold text-slate-900">Municipal Grievance Helpline</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Operating under Dahisar R/North Administrative Ward. For life-threatening emergencies, dial emergency services immediately.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-700">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#0F766E]" />
              <span>Helpline: <strong>1916</strong> (Toll Free)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#0F766E]" />
              <span>Email: <strong>desk.rnorth@smartcivic.gov.in</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#0F766E]" />
              <span>Location: <strong>Dahisar, Mumbai 400068</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-xl py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <LogoSymbol size={30} />
            <span className="text-sm font-bold text-slate-900">Smart Civic Connect</span>
          </div>
          <p className="text-xs text-slate-500">
            AI-Based Civic Complaint and Urban Service Management System • Academic College Demonstration
          </p>
        </div>
      </footer>
    </div>
  );
};
