import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  Building2,
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  CreditCard,
  CalendarCheck,
  Settings,
  LogOut,
  School,
  Menu,
  X,
  Network,
  BookOpen,
} from 'lucide-react';

export const SchoolAdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/school-admin/dashboard', icon: LayoutDashboard },
    { label: 'Hierarchy Tree', path: '/school-admin/tree', icon: Network },
    { label: 'Students', path: '/school-admin/students', icon: GraduationCap },
    { label: 'Staff & Teachers', path: '/school-admin/staff', icon: Users },
    { label: 'Classes & Sections', path: '/school-admin/classes', icon: Layers },
    { label: 'Faculty Allocations', path: '/school-admin/allocations', icon: BookOpen },
    { label: 'Fee Management', path: '/school-admin/fees', icon: CreditCard },
    { label: 'Attendance', path: '/school-admin/attendance', icon: CalendarCheck },
    { label: 'School Profile', path: '/school-admin/profile', icon: Settings },
  ];

  const currentItem = navItems.find((item) => location.pathname.startsWith(item.path)) || navItems[0];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#212121] transition-colors duration-200">
      {/* ===================== DESKTOP SIDEBAR ===================== */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shrink-0 border-r border-slate-800 h-screen sticky top-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#eb4438] flex items-center justify-center text-white font-bold shadow-md shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate text-white leading-tight">
              {user?.schoolName || 'Oakridge International'}
            </div>
            <div className="text-[11px] text-[#eb4438] font-medium">School Admin Portal</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#eb4438] text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Explicit Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold text-white truncate">{user?.fullName || 'Principal Admin'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-[#eb4438]/10 hover:bg-[#eb4438]/20 text-[#eb4438] border border-[#eb4438]/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ===================== MOBILE DRAWER MENU ===================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#eb4438] flex items-center justify-center text-white font-bold shrink-0">
                  <School className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-white leading-tight">
                    {user?.schoolName || 'Oakridge International'}
                  </div>
                  <div className="text-[10px] text-[#eb4438] font-medium">School Admin Portal</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#eb4438] text-white shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60">
              <div className="mb-3">
                <div className="text-xs font-semibold text-white truncate">{user?.fullName || 'Principal Admin'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-[#eb4438] hover:bg-[#d9382d] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#282828] border-b border-slate-200/80 dark:border-[#383838] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Building2 className="w-5 h-5 text-[#eb4438] shrink-0 hidden sm:block" />
            <h1 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate">
              <span className="text-slate-400 dark:text-slate-400 font-normal hidden md:inline">
                {user?.schoolName || 'School Administration'} &middot;{' '}
              </span>
              {currentItem.label}
            </h1>
          </div>

          {/* Right Header: Theme Toggle + User info & Direct Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user?.fullName}</div>
              <div className="text-[10px] text-slate-400 leading-tight">School Administrator</div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-[#eb4438] hover:text-white hover:bg-[#eb4438] border border-[#eb4438]/40 transition-colors cursor-pointer"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolAdminLayout;
