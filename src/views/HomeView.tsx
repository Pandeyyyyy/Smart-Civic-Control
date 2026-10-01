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
  Zap,
  Activity,
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/seedData';

// Static public asset path for the building + nature hero background
const heroCityNatureImg = '/hero-city-nature.jpg';

interface HomeViewProps {
  currentUser: User | null;
  onNavigate: (view: string, presetIdOrSection?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ currentUser, onNavigate }) => {
  // Parallax scroll state
  const [scrollY, setScrollY] = useState(0);

  // Animated Counters state
  const [statsCounted, setStatsCounted] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [accuracyCount, setAccuracyCount] = useState(0);
  const [wardCount, setWardCount] = useState(0);
  const [responseHours, setResponseHours] = useState(0);

  // Image load fallback state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // IntersectionObserver refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({ hero: true });

  // Subtle Parallax Scroll Listener
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for scroll-triggered reveals
  useEffect(() => {
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
      { threshold: 0.12 }
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
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION: BUILDING + NATURE BACKGROUND & GLASS COMPOSITION */}
      {/* ---------------------------------------------------- */}
      <section
        ref={heroRef}
        data-section="hero"
        className="relative min-h-[94vh] flex items-center justify-center pt-10 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* REAL BUILDING + NATURE BACKGROUND IMAGE (SKYLINES, TREES, BLUE SKY, DAYLIGHT) */}
        <div
          className="absolute inset-0 -z-20 overflow-hidden bg-cover bg-center bg-no-repeat transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(0, ${scrollY * 0.22}px, 0)`,
            backgroundImage: imageError
              ? 'linear-gradient(135deg, #F8FAFC 0%, #E6FFFA 50%, #CCFBF1 100%)'
              : `url('${heroCityNatureImg}')`,
            backgroundColor: '#0F766E',
          }}
        >
          {!imageError && (
            <img
              src={heroCityNatureImg}
              alt="Modern Smart City skyline with green trees, parks, and clean urban environment in daylight"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center scale-105 pointer-events-none select-none transition-opacity duration-700"
              style={{ opacity: imageLoaded ? 1 : 0.85 }}
            />
          )}
        </div>

        {/* REFINED NATURAL DAYLIGHT OVERLAY:
            Maintains vivid modern skyline and green trees while giving 100% crisp readability to headings and glass panels */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(248,250,252,0.85) 0%, rgba(255,255,255,0.60) 45%, rgba(248,250,252,0.92) 100%)',
            backdropFilter: 'blur(1.5px)',
            WebkitBackdropFilter: 'blur(1.5px)',
          }}
        />

        <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
          {/* HERO TEXT & HEADLINES */}
          <div
            className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
              visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* OFFICIAL LOGO SYMBOL + SMART CIVIC CONNECT TITLE BADGE */}
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full glass-panel shadow-md mb-6 hover:shadow-lg transition-all hover:scale-[1.02]">
              <LogoSymbol size={36} showAura />
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                  Smart Civic Connect
                </span>
                <span className="text-[10px] font-semibold text-[#0F766E] uppercase tracking-wider mt-0.5">
                  AI Civic Resolution System
                </span>
              </div>
            </div>

            {/* MAIN HEADLINES PER SPECIFICATION */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Cleaner Cities, <br />
              <span className="text-[#0F766E] bg-clip-text text-transparent bg-gradient-to-r from-[#0F766E] to-[#115E59]">
                Happier Communities
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
              AI-powered civic complaint management for smarter and safer communities.
              Report urban infrastructure issues with instant vision inference and geocoded ward routing.
            </p>

            {/* CALL TO ACTION BUTTONS WITH HOVER SHIFT & CLICK FEEDBACK */}
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
                className="btn-interactive py-3.5 px-8 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-bold shadow-xl shadow-teal-900/20 flex items-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Report a Problem</span>
                <ArrowRight className="w-4 h-4 icon-shift" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-interactive py-3.5 px-7 rounded-2xl glass-panel hover:bg-white text-slate-900 text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Learn How It Works</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin_dashboard')}
                  className="btn-interactive py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white text-sm font-bold border border-slate-700/50 shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span>Admin Operations</span>
                </button>
              )}
            </div>

            {/* DEMO TESTBED NOTICE BADGE */}
            <div className="mt-6 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-surface text-xs text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
              <span className="font-medium text-slate-600">Operational Testbed:</span>
              <strong className="text-slate-900 font-bold">Mumbai • Dahisar (R/North Demo Wards 01–06)</strong>
            </div>
          </div>

          {/* GLASS AI / SMART CITY FEATURE PANEL (SPEC REQUIREMENT) */}
          <div
            className={`mt-12 w-full max-w-4xl p-5 sm:p-6 rounded-3xl glass-panel border border-white/70 shadow-2xl transition-all duration-700 delay-150 ${
              visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left AI Vision Badge */}
              <div className="md:col-span-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200/70 pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-[#0F766E]" />
                  <span>Multimodal Civic Intelligence</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Instant Urban Breakdown Triage
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Deep transfer learning classifies photos into 9 municipal categories, weighted with voice & text descriptions.
                </p>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-teal-800 font-semibold bg-teal-50/80 px-2.5 py-1 rounded-xl w-fit">
                  <Activity className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>70% Vision + 30% NLP Multimodal Weight</span>
                </div>
              </div>

              {/* Middle Demo Quick Evaluation Presets */}
              <div className="md:col-span-8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-teal-700" />
                    <span>Try 1-Click Evaluation Scenarios:</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Pre-loaded field cases</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEMO_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onNavigate('report_problem', p.id)}
                      className="btn-interactive p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-slate-200/80 hover:border-teal-400 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-[#0F766E]">
                        {p.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {p.demoWard}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
          className={`p-6 sm:p-8 rounded-3xl glass-panel border border-white/80 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center transition-all duration-700 ${
            visibleSections.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="p-3 rounded-2xl hover:bg-white/40 transition-colors">
            <span className="text-3xl sm:text-4xl font-black text-[#0F766E] tracking-tight">
              {resolvedCount}+
            </span>
            <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
              Issues Resolved
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Across Dahisar R/North</p>
          </div>

          <div className="p-3 rounded-2xl hover:bg-white/40 transition-colors">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {accuracyCount}%
            </span>
            <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
              AI Accuracy Match
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Multimodal Vision + NLP</p>
          </div>

          <div className="p-3 rounded-2xl hover:bg-white/40 transition-colors">
            <span className="text-3xl sm:text-4xl font-black text-teal-700 tracking-tight">
              {wardCount}
            </span>
            <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
              Demo Wards Covered
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">East & West Sectors</p>
          </div>

          <div className="p-3 rounded-2xl hover:bg-white/40 transition-colors">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
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
      {/* 3. HOW IT WORKS SECTION (WITH WEAVING CONNECTED LINE ANIMATION) */}
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
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            How Smart Civic Connect Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            From smartphone image capture to automated municipal field dispatch in 5 seamless connected steps.
          </p>
        </div>

        {/* CONNECTED WORKFLOW CONTAINER WITH WEAVING PROGRESS LINE */}
        <div className="relative">
          {/* Animated horizontal connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 -translate-y-6 -z-1 rounded-full weaving-line opacity-75" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isVisible = visibleSections.howItWorks;

              return (
                <div
                  key={st.num}
                  style={{
                    transitionDelay: `${idx * 120}ms`,
                  }}
                  className={`p-5 rounded-3xl glass-card relative group transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-teal-800 tracking-wider">
                      {st.num}
                    </span>
                    <div className="p-3 rounded-2xl bg-teal-50 text-[#0F766E] shadow-2xs group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. PROBLEM CATEGORIES SECTION (STAGGERED CARDS WITH HOVER ARROWS) */}
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
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Supported Problem Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto">
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
                className={`btn-interactive p-5 rounded-3xl glass-card cursor-pointer group transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50/80 flex items-center justify-center text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white transition-all shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F766E] icon-shift opacity-60 group-hover:opacity-100" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                  {cat.label}
                </h3>
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
          className={`p-8 sm:p-12 rounded-3xl glass-panel border border-white/80 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-700 ${
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

            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Transparent Inference:</strong> Real computer vision pipeline with explicit fallback and low-confidence warnings.</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Separation of Concerns:</strong> Administrative wards derived from coordinates, never guessed from images.</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Citizen Accountability:</strong> Complete resolution audit trails with citizen satisfaction ratings upon ticket closure.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-white/80 glass-card">
              <img
                src={heroCityNatureImg}
                alt="Modern sustainable architecture with greenery and park trees"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
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
          className={`p-8 rounded-3xl glass-panel border border-white/80 shadow-md space-y-4 transition-all duration-700 ${
            visibleSections.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-xl font-bold text-slate-900">Municipal Grievance Helpline</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Operating under Dahisar R/North Administrative Ward. For life-threatening emergencies, dial emergency services immediately.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-700">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-surface shadow-2xs">
              <Phone className="w-4 h-4 text-[#0F766E]" />
              <span>Helpline: <strong>1916</strong> (Toll Free)</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-surface shadow-2xs">
              <Mail className="w-4 h-4 text-[#0F766E]" />
              <span>Email: <strong>desk.rnorth@smartcivic.gov.in</strong></span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-surface shadow-2xs">
              <MapPin className="w-4 h-4 text-[#0F766E]" />
              <span>Location: <strong>Dahisar, Mumbai 400068</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-white/60 bg-white/70 backdrop-blur-xl py-10 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <LogoSymbol size={32} />
            <span className="text-sm font-bold text-slate-900">Smart Civic Connect</span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            AI-Based Civic Complaint and Urban Service Management System • Academic College Demonstration
          </p>
        </div>
      </footer>
    </div>
  );
};
