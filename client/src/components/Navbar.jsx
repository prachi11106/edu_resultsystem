import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Building2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInstitute } from '../context/InstituteContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const { instituteName } = useInstitute();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/results?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between no-print shadow-xs transition-colors">
      {/* Left: Mobile Toggle & Page Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search student name or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
          />
        </form>
      </div>

      {/* Right: School Badge & Theme Toggle & User Info */}
      <div className="flex items-center gap-3">
        {/* Dynamic Institute Name Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#00264D] dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 max-w-xs truncate">
          <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="truncate" title={instituteName}>{instituteName}</span>
        </div>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="h-8 w-8 rounded-full bg-[#00264D] text-white font-bold text-xs flex items-center justify-center border-2 border-[#FF7F00] shadow-xs shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'teacher'} Access</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
