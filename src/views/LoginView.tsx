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
      {/* GLASS LOGIN CARD */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 animate-in fade-in zoom-in-95 duration-300">
        {/* LOGO SYMBOL + TITLE */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#071A2F]/80 backdrop-blur-md border border-cyan-500/30 shadow-sm mb-3">
            <LogoSymbol size={48} showAura />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Sign in to access your <strong className="text-[#00D6B8]">Smart Civic Connect</strong> account
          </p>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
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
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-cyan-500/30 bg-[#071A2F] text-[#00D6B8] focus:ring-cyan-500 w-3.5 h-3.5"
              />
              <span>Remember me</span>
            </label>

            <span className="text-[11px] text-[#00D6B8] hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-xs font-semibold shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
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
        <div className="mt-5 pt-4 border-t border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#00D6B8]" />
              <span>Evaluation Quick Credentials</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('citizen')}
              className="py-1.5 px-2 rounded-xl bg-[#071A2F]/70 hover:bg-[#071A2F]/90 border border-cyan-500/20 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-1 text-[11px] font-bold text-white">
                <UserIcon className="w-3 h-3 text-[#00D6B8]" />
                <span>Fill Citizen Demo</span>
              </div>
              <span className="text-[9px] text-slate-400 block truncate">
                citizen@smartcivic.in
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-2 rounded-xl bg-[#071A2F]/70 hover:bg-[#071A2F]/90 border border-cyan-500/20 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-1 text-[11px] font-bold text-white">
                <Shield className="w-3 h-3 text-[#00D6B8]" />
                <span>Fill Admin Demo</span>
              </div>
              <span className="text-[9px] text-slate-400 block truncate">
                admin@smartcivic.gov.in
              </span>
            </button>
          </div>
        </div>

        {/* LINK TO REGISTER & HOME */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex flex-col items-center space-y-2 text-xs text-slate-400">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-bold text-[#00D6B8] hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Home className="w-3 h-3" />
            <span>Return to Public Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
