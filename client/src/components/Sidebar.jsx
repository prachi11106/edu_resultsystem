import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileEdit,
  Sparkles,
  BarChart3,
  BookOpen,
  Settings as SettingsIcon,
  LogOut,
  X,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Marks Entry', path: '/marks-entry', icon: FileEdit },
    { name: 'Result', path: '/results', icon: FileCheck2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Analysis', path: '/result-analysis', icon: Sparkles },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#001D3D] text-white border-r border-[#00264D] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print shadow-xl`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-white/10 bg-[#00264D]/50">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center p-1 shadow-md border border-white/20 shrink-0">
              <img
                src="/logo.jpg"
                alt="AnkSetu Logo"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white block leading-none">
                ANK<span className="text-[#FF7F00]">SETU</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-300 mt-1 block">
                Result & AI Portal
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info Quick Badge */}
        <div className="p-3 mx-3 my-3 rounded-2xl bg-white/5 border border-white/10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#FF7F00] text-white font-extrabold flex items-center justify-center text-sm shadow-xs border border-white/20 shrink-0">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Teacher'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF7F00] animate-pulse"></span>
                <span className="text-[10px] uppercase font-semibold text-slate-300 tracking-wider">
                  {user?.role || 'teacher'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/results' && location.pathname.startsWith('/results'));
            return (
              <NavLink
                key={`${item.path}-${idx}`}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF7F00] text-white shadow-md shadow-[#FF7F00]/25'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sign Out */}
        <div className="p-3 border-t border-white/10 bg-[#001D3D]">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-[#FF7F00] transition-all shadow-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
