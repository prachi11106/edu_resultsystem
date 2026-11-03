import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loginAsDemo, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('teacher@anksetu.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setLocalError(res.message || 'Invalid login credentials.');
    }
  };

  const handleQuickDemo = (role) => {
    loginAsDemo(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Brand Decorative Shapes */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-[#00264D]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#FF7F00]/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 overflow-hidden relative z-10">
        
        {/* LEFT BRANDING PANEL (#00264D Midnight Navy) */}
        <div className="md:col-span-5 bg-[#00264D] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FF7F00]/20 blur-2xl"></div>

          <div>
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md border border-white/20 shrink-0">
                <img
                  src="/logo.jpg"
                  alt="AnkSetu Logo"
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-white block leading-none">
                  ANK<span className="text-[#FF7F00]">SETU</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 mt-1 block">
                  Result & AI Portal
                </span>
              </div>
            </div>

            <h2 className="font-heading font-extrabold text-xl leading-snug text-white">
              Smart Student Performance & Result Management
            </h2>
            <p className="text-xs text-slate-300 mt-2 font-medium">
              "Smart Results. Better Insights. Stronger Students."
            </p>

            <ul className="mt-8 space-y-3.5 text-xs font-semibold text-slate-200">
              <li className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-[#FF7F00] shrink-0" />
                <span>Automated marks & grade calculation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-[#FF7F00] shrink-0" />
                <span>AI-powered student performance insights</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-[#FF7F00] shrink-0" />
                <span>Downloadable & printable official report cards</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 border-t border-white/10 text-[11px] font-medium text-slate-300">
            Delhi Public Int. Academy • AnkSetu System
          </div>
        </div>

        {/* RIGHT LOGIN FORM PANEL (#FFFFFF) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF7F00] block mb-1">
              Portal Sign In
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900">
              Teacher & Admin Login
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your academic credentials to access the AnkSetu portal.
            </p>
          </div>

          {(localError || authError) && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@anksetu.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#00264D] focus:ring-[#FF7F00] h-4 w-4"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Demo Credentials:\n\nTeacher: teacher@anksetu.edu / password123\nAdmin: admin@anksetu.edu / password123')}
                className="text-slate-500 hover:text-[#00264D] font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* PRIMARY LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* QUICK DEMO ACCESS BAR */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center block mb-2.5">
              Quick 1-Click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('teacher')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center"
              >
                Teacher Login
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-2.5 px-3 rounded-xl bg-[#00264D]/10 hover:bg-[#00264D] text-[#00264D] hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#FF7F00]" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
