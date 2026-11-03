import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, PlusCircle, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/results?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between no-print shadow-xs">
      {/* Left: Mobile Toggle & Page Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#FF7F00] focus:ring-2 focus:ring-[#FF7F00]/20 transition-all outline-none"
          />
        </form>
      </div>

      {/* Right: School Badge & Action Buttons */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-[#00264D] text-xs font-semibold border border-slate-200">
          <Building2 className="h-3.5 w-3.5 text-slate-500" />
          <span>Delhi Public Int. Academy</span>
        </div>

        <button
          onClick={() => navigate('/marks-entry')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF7F00] hover:bg-[#E06D00] text-white text-xs font-bold shadow-xs shadow-[#FF7F00]/20 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Enter Marks</span>
        </button>

        <button
          onClick={() => navigate('/result-analysis')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00264D] hover:bg-[#001D3D] text-white text-xs font-bold shadow-xs transition-all"
          title="AI Analysis Hub"
        >
          <Sparkles className="h-4 w-4 text-[#FF7F00]" />
          <span className="hidden sm:inline">AI Analysis</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-[#00264D] text-white font-bold text-xs flex items-center justify-center border-2 border-[#FF7F00] shadow-xs">
            {user?.name?.charAt(0) || 'T'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Teacher'}</p>
            <p className="text-[10px] font-semibold text-slate-500 capitalize">{user?.role || 'teacher'} Access</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
