import React, { useState } from 'react';
import { LogoSymbol } from '../components/LogoSymbol';
import { authService } from '../services/authService';
import { User } from '../types';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  User as UserIcon,
  AlertCircle,
  Home,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const demoCreds = authService.getDemoCredentials();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authService.login(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    }, 400);
  };

  const handleFillDemo = (role: 'citizen' | 'admin') => {
    if (role === 'citizen') {
      setEmail(demoCreds.citizen.email);
      setPassword(demoCreds.citizen.password);
    } else {
      setEmail(demoCreds.admin.email);
      setPassword(demoCreds.admin.password);
    }
    setErrorMessage('');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* BACKGROUND IMAGE: REAL LOCAL BUILDING + NATURE ASSET */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/hero-city-nature.jpg')`,
        }}
      />
      {/* SOFT TRANSLUCENT OVERLAY FOR DAYLIGHT READABILITY */}
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] -z-10" />

      {/* GLASS LOGIN CARD */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/60 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* LOGO SYMBOL + TITLE */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-sm mb-3">
            <LogoSymbol size={48} showAura />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Sign in to access your <strong className="text-teal-800">Smart Civic Connect</strong> account
          </p>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="name@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-[#0F766E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-[#0F766E]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#0F766E] focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span>Remember me</span>
            </label>

            <span className="text-[11px] text-teal-700 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-md shadow-teal-700/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* DEMO ACCOUNT PRESETS (CONVENIENCE FOR EVALUATORS) */}
        <div className="mt-5 pt-4 border-t border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>Evaluation Quick Credentials</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('citizen')}
              className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200/60 text-left transition-colors"
            >
              <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-800">
                <UserIcon className="w-3 h-3 text-teal-700" />
                <span>Fill Citizen Demo</span>
              </div>
              <span className="text-[9px] text-slate-500 block truncate">
                citizen@smartcivic.in
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200/60 text-left transition-colors"
            >
              <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-800">
                <Shield className="w-3 h-3 text-teal-700" />
                <span>Fill Admin Demo</span>
              </div>
              <span className="text-[9px] text-slate-500 block truncate">
                admin@smartcivic.gov.in
              </span>
            </button>
          </div>
        </div>

        {/* LINK TO REGISTER & HOME */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-col items-center space-y-2 text-xs text-slate-600">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-bold text-[#0F766E] hover:underline"
            >
              Create Account
            </button>
          </p>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <Home className="w-3 h-3" />
            <span>Return to Public Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
