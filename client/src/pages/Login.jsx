import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  School,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInstitute } from '../context/InstituteContext';

const Login = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, forgotPassword, resetPassword, loading } = useAuth();
  const { instituteName } = useInstitute();

  // Account Category: 'teacher' (A. TEACHER) | 'admin' (B. ADMINISTRATOR)
  const [category, setCategory] = useState('teacher');

  // Sub-action: 'login' | 'signup' | 'forgot'
  const [actionTab, setActionTab] = useState(() => {
    if (location.pathname === '/signup' || initialMode === 'signup') return 'signup';
    if (location.pathname === '/forgot-password' || initialMode === 'forgot') return 'forgot';
    return 'login';
  });

  // Sync mode with route if user navigates via browser history
  useEffect(() => {
    if (location.pathname === '/signup') setActionTab('signup');
    else if (location.pathname === '/forgot-password') setActionTab('forgot');
    else if (location.pathname === '/login') setActionTab('login');
  }, [location.pathname]);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states - Teacher Sign Up
  const [tName, setTName] = useState('');
  const [tOrg, setTOrg] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tPassword, setTPassword] = useState('');
  const [tConfirmPassword, setTConfirmPassword] = useState('');
  const [showTPassword, setShowTPassword] = useState(false);
  const [showTConfirmPassword, setShowTConfirmPassword] = useState(false);

  // Form states - Admin Sign Up
  const [aName, setAName] = useState('');
  const [aOrg, setAOrg] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aPhone, setAPhone] = useState('');
  const [adminSetupKey, setAdminSetupKey] = useState('');
  const [aPassword, setAPassword] = useState('');
  const [aConfirmPassword, setAConfirmPassword] = useState('');
  const [showAPassword, setShowAPassword] = useState(false);
  const [showAConfirmPassword, setShowAConfirmPassword] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [smtpNotice, setSmtpNotice] = useState('');

  // Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearAlerts = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleActionSwitch = (tab) => {
    clearAlerts();
    setActionTab(tab);
    if (tab === 'login') navigate('/login', { replace: true });
    else if (tab === 'signup') navigate('/signup', { replace: true });
    else if (tab === 'forgot') navigate('/forgot-password', { replace: true });
  };

  // 1. Teacher Login
  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both your teacher email and password.');
      return;
    }

    const res = await login(loginEmail.trim(), loginPassword, 'teacher');
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  // 2. Administrator Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    const res = await login(loginEmail.trim(), loginPassword, 'admin');
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  // 3. Teacher Sign Up
  const handleTeacherSignup = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!tName.trim() || !tEmail.trim() || !tPassword.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (tPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (tPassword !== tConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const payload = {
      name: tName.trim(),
      email: tEmail.trim(),
      password: tPassword,
      confirmPassword: tConfirmPassword,
      role: 'teacher',
      organization: tOrg.trim() || instituteName || 'Delhi Public International Academy',
      phone: tPhone.trim(),
    };

    const res = await signup(payload);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message || 'Failed to create teacher account.');
    }
  };

  // 4. Administrator Sign Up (with Setup Key)
  const handleAdminSignup = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!aName.trim() || !aEmail.trim() || !aPassword.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!adminSetupKey.trim()) {
      setErrorMsg('Administrator accounts require a verified institutional setup key.');
      return;
    }

    if (aPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (aPassword !== aConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const payload = {
      name: aName.trim(),
      email: aEmail.trim(),
      password: aPassword,
      confirmPassword: aConfirmPassword,
      role: 'admin',
      adminSecretKey: adminSetupKey.trim(),
      organization: aOrg.trim() || instituteName || 'Delhi Public International Academy',
      phone: aPhone.trim(),
    };

    const res = await signup(payload);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message || 'Failed to create administrator account.');
    }
  };

  // 5. Password Reset Request
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    const res = await forgotPassword(forgotEmail.trim());
    if (res.success) {
      if (res.emailConfigured) {
        setSuccessMsg(res.message);
        setForgotStep(2);
      } else {
        setSmtpNotice(res.message);
        if (res.resetToken) setResetToken(res.resetToken);
        setForgotStep(2);
      }
    } else {
      setErrorMsg(res.message || 'Account not found with this email.');
    }
  };

  // 6. Password Reset Execution
  const handleForgotReset = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!resetToken.trim()) {
      setErrorMsg('Please enter the password reset verification token.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = await resetPassword(resetToken.trim(), newPassword, confirmNewPassword);
    if (res.success) {
      setSuccessMsg('Password has been reset successfully! You can now sign in.');
      setLoginEmail(forgotEmail);
      setForgotStep(1);
      setForgotEmail('');
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => handleActionSwitch('login'), 1500);
    } else {
      setErrorMsg(res.message || 'Failed to reset password. Token may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden transition-colors">
      {/* Brand Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#00264D]/5 dark:bg-[#00264D]/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-[#FF7F00]/10 dark:bg-[#FF7F00]/15 blur-3xl pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
        
        {/* ============================================================== */}
        {/* LEFT BRANDING PANEL (#00264D Midnight Navy & #FF7F00 Accent)   */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-[#00264D] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#FF7F00]/25 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#001D3D] blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Logo and Brand Title */}
            <div className="inline-flex items-center gap-3.5 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center p-1 shadow-lg border border-white/20 shrink-0">
                <img
                  src="/logo.jpg"
                  alt="AnkSetu Logo"
                  className="h-full w-full object-contain rounded-xl"
                />
              </div>
              <div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-white block leading-none">
                  ANK<span className="text-[#FF7F00]">SETU</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mt-1 block">
                  School Result & AI System
                </span>
              </div>
            </div>

            {/* Headline & Tagline */}
            <h2 className="font-heading font-extrabold text-2xl lg:text-3xl leading-snug text-white">
              Smart Student Performance & Result Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium leading-relaxed">
              "Smart Results. Better Insights. Stronger Students."
            </p>

            {/* Value Highlights */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-white/10 text-[#FF7F00] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Automated Marks & Grade Engine</h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Instant calculation with official CBSE and State Board grading rules.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-white/10 text-[#FF7F00] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Diagnostic Insights</h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Pinpoint weak academic areas and generate personalized recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-white/10 text-[#FF7F00] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Role-Based Academic Security</h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Separated portals for Teachers and Institutional Administrators.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Institute Name */}
          <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="truncate max-w-[200px]" title={instituteName}>{instituteName}</span>
            <span className="text-[#FF7F00]">AnkSetu 2.0</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT AUTHENTICATION PANEL                                     */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          
          {/* TOP MANDATORY TITLE (Requirement 4) */}
          <div className="mb-6">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
              Create Your Account / Welcome Back
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Choose your role category below to sign in or register for your institutional portal.
            </p>
          </div>

          {/* TWO SEPARATED CATEGORIES: A. TEACHER vs B. ADMINISTRATOR */}
          {actionTab !== 'forgot' && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Category A: TEACHER */}
              <button
                type="button"
                onClick={() => { setCategory('teacher'); clearAlerts(); }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  category === 'teacher'
                    ? 'border-[#00264D] dark:border-[#FF7F00] bg-[#00264D]/5 dark:bg-[#00264D]/30 ring-2 ring-[#00264D]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    category === 'teacher'
                      ? 'bg-[#00264D] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block leading-tight">
                    A. TEACHER
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Academic Access
                  </span>
                </div>
              </button>

              {/* Category B: ADMINISTRATOR */}
              <button
                type="button"
                onClick={() => { setCategory('admin'); clearAlerts(); }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  category === 'admin'
                    ? 'border-[#00264D] dark:border-[#FF7F00] bg-[#00264D]/5 dark:bg-[#00264D]/30 ring-2 ring-[#00264D]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    category === 'admin'
                      ? 'bg-[#00264D] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <School className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block leading-tight">
                    B. ADMINISTRATOR
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Management Access
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Action Tabs: [ Login ] | [ Sign Up ] for the selected category */}
          {actionTab !== 'forgot' && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 max-w-xs">
              <button
                type="button"
                onClick={() => handleActionSwitch('login')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  actionTab === 'login'
                    ? 'bg-[#00264D] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {category === 'teacher' ? 'Teacher Login' : 'Admin Login'}
              </button>
              <button
                type="button"
                onClick={() => handleActionSwitch('signup')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  actionTab === 'signup'
                    ? 'bg-[#00264D] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {category === 'teacher' ? 'Teacher Sign Up' : 'Admin Sign Up'}
              </button>
            </div>
          )}

          {/* Alert: Error */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Alert: Success */}
          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* ============================================================== */}
          {/* FLOW 1: TEACHER AUTHENTICATION (CATEGORY A)                    */}
          {/* ============================================================== */}
          {category === 'teacher' && actionTab === 'login' && (
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Teacher Email / Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="teacher@anksetu.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
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
                  onClick={() => handleActionSwitch('forgot')}
                  className="text-[#FF7F00] hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in as Teacher...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as Teacher</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  New teacher in the institute?{' '}
                  <button
                    type="button"
                    onClick={() => handleActionSwitch('signup')}
                    className="text-[#00264D] dark:text-[#FF7F00] font-bold hover:underline"
                  >
                    Teacher Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}

          {category === 'teacher' && actionTab === 'signup' && (
            <form onSubmit={handleTeacherSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  School / Institute Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={tOrg || instituteName}
                    onChange={(e) => setTOrg(e.target.value)}
                    placeholder={instituteName}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Teacher Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={tEmail}
                    onChange={(e) => setTEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showTPassword ? 'text' : 'password'}
                      value={tPassword}
                      onChange={(e) => setTPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowTPassword(!showTPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showTPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showTConfirmPassword ? 'text' : 'password'}
                      value={tConfirmPassword}
                      onChange={(e) => setTConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowTConfirmPassword(!showTConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showTConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Creating Teacher Account...' : 'Create Teacher Account'}
              </button>

              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleActionSwitch('login')}
                    className="text-[#00264D] dark:text-[#FF7F00] font-bold hover:underline"
                  >
                    Teacher Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* FLOW 2: ADMINISTRATOR AUTHENTICATION (CATEGORY B)              */}
          {/* ============================================================== */}
          {category === 'admin' && actionTab === 'login' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Administrator Email / Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@anksetu.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
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
                  onClick={() => handleActionSwitch('forgot')}
                  className="text-[#FF7F00] hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in as Administrator...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as Administrator</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Need admin access?{' '}
                  <button
                    type="button"
                    onClick={() => handleActionSwitch('signup')}
                    className="text-[#00264D] dark:text-[#FF7F00] font-bold hover:underline"
                  >
                    Admin Sign Up (Setup Key)
                  </button>
                </p>
              </div>
            </form>
          )}

          {category === 'admin' && actionTab === 'signup' && (
            <form onSubmit={handleAdminSignup} className="space-y-3">
              {/* Security Warning Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
                  <strong>Security Restriction:</strong> Public administrator accounts cannot be registered without a valid Institutional Setup Key.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={aName}
                    onChange={(e) => setAName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Institution Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={aOrg || instituteName}
                    onChange={(e) => setAOrg(e.target.value)}
                    placeholder={instituteName}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Official Admin Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={aEmail}
                    onChange={(e) => setAEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={aPhone}
                    onChange={(e) => setAPhone(e.target.value)}
                    placeholder="+91 98111 22334"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Setup Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  <input
                    type="password"
                    value={adminSetupKey}
                    onChange={(e) => setAdminSetupKey(e.target.value)}
                    placeholder="Enter Institutional Setup Key"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-amber-50/50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00264D] focus:ring-1 focus:ring-[#00264D]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAPassword ? 'text' : 'password'}
                      value={aPassword}
                      onChange={(e) => setAPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAPassword(!showAPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAConfirmPassword ? 'text' : 'password'}
                      value={aConfirmPassword}
                      onChange={(e) => setAConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAConfirmPassword(!showAConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Verifying & Registering Admin...' : 'Create Administrator Account'}
              </button>

              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleActionSwitch('login')}
                    className="text-[#00264D] dark:text-[#FF7F00] font-bold hover:underline"
                  >
                    Admin Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* FLOW 3: VERIFIED FORGOT PASSWORD WORKFLOW                      */}
          {/* ============================================================== */}
          {actionTab === 'forgot' && (
            <div className="space-y-5">
              <div>
                <button
                  type="button"
                  onClick={() => handleActionSwitch('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#00264D] dark:hover:text-white transition-colors mb-3"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF7F00] block mb-1">
                  Account Recovery
                </span>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  Reset Account Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {forgotStep === 1
                    ? 'Enter your registered email address to initiate verification.'
                    : 'Enter the verification token and choose your new password.'}
                </p>
              </div>

              {smtpNotice && (
                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-300 text-xs font-medium space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Password Reset Verification</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">{smtpNotice}</p>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="your.email@school.edu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Generate Reset Token'}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleForgotReset} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Verification Token
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Enter the 64-character verification token"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F00] focus:ring-1 focus:ring-[#FF7F00]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#00264D] hover:bg-[#FF7F00] text-white font-bold text-xs shadow-md shadow-[#00264D]/15 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Saving...' : 'Save New Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
