import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate brief smooth interaction
    setTimeout(async () => {
      await login(username, password);
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between items-center py-8 px-4 font-sans text-slate-800 antialiased selection:bg-blue-100">
      <div />

      {/* Main Centered Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 my-auto">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quality Service & Review
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-[280px]">
            Sign in to access your quality and audit console
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="user-input">
              User
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="user-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your user"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="password-input">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition cursor-pointer"
                onClick={() => alert('For password recovery, please contact your organization administrator.')}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Session Checkbox */}
          <div className="flex items-center pt-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600 cursor-pointer select-none">
              Remember session on this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col items-center gap-2 text-center text-xs text-slate-500 max-w-md">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Bank-grade TLS 1.3 encrypted connection</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Terms of Service</span>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Security</span>
        </div>
        <div className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Quality Service. All rights reserved.
        </div>
      </div>
    </div>
  );
};
