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
    <header className="sticky top-0 z-30 h-16 bg-[#FBEFEF]/90 backdrop-blur-md border-b border-[#F5CBCB]/60 px-4 lg:px-8 flex items-center justify-between no-print">
      {/* Left: Mobile Toggle & Page Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-[#332F35] hover:bg-[#FFE2E2] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#625B64]" />
          <input
            type="text"
            placeholder="Search student name or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#F5CBCB] text-[#332F35] placeholder-[#8A818A] focus:ring-2 focus:ring-[#C5B3D3] transition-all outline-none"
          />
        </form>
      </div>

      {/* Right: School Badge & Action Buttons */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFE2E2] text-[#332F35] text-xs font-bold border border-[#F5CBCB]">
          <Building2 className="h-3.5 w-3.5 text-[#625B64]" />
          <span>Delhi Public Int. Academy</span>
        </div>

        <button
          onClick={() => navigate('/marks-entry')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5CBCB] hover:bg-[#C5B3D3] text-[#332F35] text-xs font-extrabold shadow-xs transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Enter Marks</span>
        </button>

        <button
          onClick={() => navigate('/result-analysis')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C5B3D3] hover:bg-[#F5CBCB] text-[#332F35] text-xs font-extrabold shadow-xs transition-all"
          title="AI Analysis Hub"
        >
          <Sparkles className="h-4 w-4 text-[#332F35]" />
          <span className="hidden sm:inline">AI Analysis</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#F5CBCB]">
          <div className="h-8 w-8 rounded-full bg-[#F5CBCB] text-[#332F35] font-extrabold text-xs flex items-center justify-center border border-white">
            {user?.name?.charAt(0) || 'T'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-extrabold text-[#332F35] leading-tight">{user?.name}</p>
            <p className="text-[10px] font-semibold text-[#625B64] capitalize">{user?.role} Access</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
