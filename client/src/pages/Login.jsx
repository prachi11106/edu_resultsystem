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
    <div className="min-h-screen bg-[#FBEFEF] text-[#332F35] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Pastel Decorative Abstract Shapes */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#FFE2E2] blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#C5B3D3] blur-3xl opacity-40 pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-[#F5CBCB] grid grid-cols-1 md:grid-cols-12 overflow-hidden relative z-10">
        
        {/* LEFT BRANDING DECORATIVE PANEL */}
        <div className="md:col-span-5 bg-[#C5B3D3] text-[#332F35] p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-[#FFE2E2]/60 blur-xl"></div>

          <div>
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-[#F5CBCB] flex items-center justify-center text-[#332F35] shadow-xs border border-white">
                <Sparkles className="h-6 w-6 text-[#332F35]" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-[#332F35]">
                ANK<span className="text-[#625B64]">SETU</span>
              </span>
            </div>

            <h2 className="font-heading font-extrabold text-xl leading-tight text-[#332F35]">
              Smart Student Performance & Result Management
            </h2>
            <p className="text-xs text-[#332F35]/80 mt-2 font-semibold italic">
              "Smart Results. Better Insights. Stronger Students."
            </p>

            <ul className="mt-8 space-y-3 text-xs font-bold text-[#332F35]">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#F5CBCB]" />
                <span>Automated marks & grade calculation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#F5CBCB]" />
                <span>AI-powered student performance insights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#F5CBCB]" />
                <span>Downloadable A4 pastel report cards</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 border-t border-[#332F35]/10 text-[11px] font-bold text-[#332F35]/70">
            Delhi Public Int. Academy • AnkSetu System
          </div>
        </div>

        {/* RIGHT LOGIN FORM PANEL (#FFFFFF) */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#625B64] block mb-1">
              Portal Sign In
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-[#332F35]">
              Teacher Login
            </h2>
            <p className="text-xs text-[#625B64] mt-1 font-medium">
              Enter your teacher or administrative credentials to proceed.
            </p>
          </div>

          {(localError || authError) && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FFE2E2] border border-[#F5CBCB] text-[#332F35] text-xs font-bold">
              <ShieldAlert className="h-4 w-4 shrink-0 text-[#332F35]" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#332F35] mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#625B64]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@anksetu.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs font-bold text-[#332F35] placeholder-[#8A818A] focus:outline-none focus:ring-2 focus:ring-[#C5B3D3] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#332F35] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#625B64]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs font-bold text-[#332F35] placeholder-[#8A818A] focus:outline-none focus:ring-2 focus:ring-[#C5B3D3] focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#625B64] hover:text-[#332F35]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#332F35] font-bold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#F5CBCB] text-[#F5CBCB] focus:ring-[#C5B3D3] h-4 w-4"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Demo Credentials:\n\nTeacher: teacher@anksetu.edu / password123\nAdmin: admin@anksetu.edu / password123')}
                className="text-[#625B64] hover:underline font-bold"
              >
                Forgot Password?
              </button>
            </div>

            {/* PRIMARY LOGIN BUTTON (#F5CBCB with text #332F35 and hover #C5B3D3) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#F5CBCB] hover:bg-[#C5B3D3] text-[#332F35] font-extrabold text-xs shadow-xs disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* QUICK DEMO ACCESS BAR */}
          <div className="pt-4 border-t border-[#FFE2E2]">
            <span className="text-[10px] font-extrabold text-[#625B64] uppercase tracking-wider text-center block mb-2">
              Quick 1-Click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('teacher')}
                className="py-2 px-3 rounded-xl bg-[#FFE2E2] hover:bg-[#F5CBCB] text-[#332F35] text-xs font-extrabold transition-all text-center"
              >
                Teacher Login
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-2 px-3 rounded-xl bg-[#C5B3D3] hover:bg-[#F5CBCB] text-[#332F35] text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
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
