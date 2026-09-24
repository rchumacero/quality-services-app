import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Building2,
  MessageSquareReply,
  ClipboardCheck,
  HelpCircle,
  Sliders,
  LogOut,
  Search,
  ChevronDown,
  Bell,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout, switchUser, testUsers, isMenuAllowed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItemClass = (isActive: boolean) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  const getRoleLabel = (role?: string) => {
    if (role === 'specialist') return 'Specialist';
    if (role === 'team_lead') return 'Team Lead';
    if (role === 'admin') return 'Administrator';
    return role || 'User';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-800 antialiased selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30">
        <div>
          {/* Brand Logo Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">Quality Service</div>
                <div className="text-[11px] text-slate-400 font-medium">Ops Console</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1">
            {/* 1. Dashboard Item (Always at top, selected on login) */}
            {isMenuAllowed('Dashboard') && (
              <div
                id="nav-dashboard"
                onClick={() => navigate('/dashboard')}
                className={navItemClass(location.pathname === '/dashboard' || location.pathname === '/')}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </div>
            )}

            {/* 2. Admin Accordion (Users & Brands) - Only visible if granted by backend role */}
            {isMenuAllowed('Admin') && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Admin</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isAdminOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>

                {isAdminOpen && (
                  <div className="mt-1 space-y-1 pl-2">
                    {isMenuAllowed('Users') && (
                      <div
                        id="nav-users"
                        onClick={() => navigate('/users')}
                        className={navItemClass(location.pathname === '/users')}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4" />
                          <span>Users</span>
                        </div>
                      </div>
                    )}

                    {isMenuAllowed('Brands') && (
                      <div
                        id="nav-brands"
                        onClick={() => navigate('/brands')}
                        className={navItemClass(location.pathname === '/brands')}
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4" />
                          <span>Brands</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Replies Item - Visible for specialist, team_lead, and admin */}
            {isMenuAllowed('Replies') && (
              <div
                id="nav-replies"
                onClick={() => navigate('/replies')}
                className={navItemClass(location.pathname === '/replies')}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquareReply className="w-4 h-4" />
                  <span>Replies</span>
                </div>
              </div>
            )}

            {/* 4. Evaluations Item - Only visible if granted (e.g. admin) */}
            {isMenuAllowed('Evaluations') && (
              <div
                id="nav-evaluations"
                onClick={() => navigate('/evaluations')}
                className={navItemClass(location.pathname === '/evaluations')}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Evaluations</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help Center</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Quick Settings</span>
          </button>

          {/* User Profile Card */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {getRoleLabel(user?.role)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 gap-4">
          {/* Left: Search bar */}
          <div className="w-64 lg:w-72 relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (Ctrl+K)"
              className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-200/70 border border-slate-300 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Middle: User Selector for RLS Testing */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-blue-900 font-semibold shrink-0">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Active User:</span>
            </div>
            <div className="relative">
              <select
                id="header-user-select"
                value={user?.email || 'juan@qualityservice.com'}
                onChange={(e) => switchUser(e.target.value)}
                className="pl-2 pr-7 py-1 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
              >
                {testUsers.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.email} ({u.name} • {getRoleLabel(u.role)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                user?.role === 'specialist'
                  ? 'bg-blue-100 text-blue-700'
                  : user?.role === 'team_lead'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {getRoleLabel(user?.role)}
            </span>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm shadow-blue-500/20 cursor-pointer">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
