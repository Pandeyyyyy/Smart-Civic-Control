import React, { useState } from 'react';
import { LogoSymbol } from '../components/LogoSymbol';
import { authService } from '../services/authService';
import { User } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface RegisterViewProps {
  onRegisterSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!mobile.trim()) {
      setErrorMessage('Please enter your mobile contact number.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authService.register({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        password,
      });

      setIsLoading(false);

      if (result.success && result.user) {
        onRegisterSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Registration failed. Please try again.');
      }
    }, 400);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* GLASS REGISTER CARD */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#071A2F]/80 backdrop-blur-md border border-cyan-500/30 shadow-sm mb-3">
            <LogoSymbol size={48} showAura />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create Citizen Account
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Join <strong className="text-[#00D6B8]">Smart Civic Connect</strong> to report and track municipal civic services
          </p>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* FULL NAME */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. Hemant Pandey"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          {/* EMAIL */}
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
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          {/* MOBILE */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Mobile Contact Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="+91 98200 00000"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Password (min 6 characters)
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
                className="w-full pl-9 pr-10 py-2 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-cyan-500/30 text-xs text-white bg-[#071A2F]/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            By registering, you confirm that your reported municipal complaints are authentic and field verifiable.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-xs font-semibold shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Citizen Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-cyan-500/20 flex flex-col items-center space-y-2 text-xs text-slate-400">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-[#00D6B8] hover:underline cursor-pointer"
            >
              Sign In
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
