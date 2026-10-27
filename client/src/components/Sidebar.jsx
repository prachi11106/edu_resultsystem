import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileEdit,
  Sparkles,
  History,
  BarChart3,
  BookOpen,
  Settings as SettingsIcon,
  GraduationCap,
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
    { name: 'Results', path: '/results', icon: FileCheck2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Analysis', path: '/result-analysis', icon: Sparkles },
    { name: 'Result History', path: '/results', icon: History },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#332F35]/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#C5B3D3] text-[#332F35] border-r border-[#F5CBCB] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print shadow-md`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#332F35]/10">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#F5CBCB] flex items-center justify-center text-[#332F35] shadow-xs border border-white">
              <Sparkles className="h-5 w-5 text-[#332F35]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-[#332F35] block leading-none">
                ANK<span className="text-[#625B64]">SETU</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#332F35]/70 mt-1 block">
                Result & AI Portal
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#332F35]/70 hover:text-[#332F35] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info Quick Badge */}
        <div className="p-3.5 mx-3 my-3 rounded-2xl bg-[#FFFFFF]/60 border border-[#F5CBCB]/60 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#F5CBCB] text-[#332F35] font-extrabold flex items-center justify-center text-sm border border-white">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-[#332F35] truncate">
                {user?.name || 'Teacher'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#F5CBCB]"></span>
                <span className="text-[10px] uppercase font-bold text-[#625B64] tracking-wider">
                  {user?.role || 'teacher'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={`${item.path}-${idx}`}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F5CBCB] text-[#332F35] shadow-xs'
                    : 'text-[#332F35] hover:bg-[#FFE2E2] hover:text-[#332F35]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#332F35]' : 'text-[#625B64]'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sign Out */}
        <div className="p-3 border-t border-[#332F35]/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold text-[#332F35] bg-[#F5CBCB] hover:bg-[#FFE2E2] transition-colors shadow-xs"
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
