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
import { cn } from '../utils/cn';

export const SchoolAdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1e1e] transition-colors duration-200">
      {/* ===================== COLLAPSIBLE SIDEBAR ===================== */}
      <aside
        className={cn(
          'flex flex-col h-screen sticky top-0 z-30 shrink-0',
          'bg-[#1a1a1a] border-r border-[#2e2e2e]',
          'transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Hamburger + Brand */}
        <div className="h-16 flex items-center border-b border-[#2e2e2e] px-3 gap-3 shrink-0">
          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-[#333333] transition-colors shrink-0 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {isSidebarOpen && (
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#eb4438] flex items-center justify-center text-white font-bold shadow-md shrink-0">
                <School className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate text-white leading-tight">
                  {user?.schoolName || 'Oakridge International'}
                </div>
                <div className="text-[11px] text-[#eb4438] font-medium">School Admin Portal</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          <div className={cn('flex flex-col', isSidebarOpen ? 'px-2 space-y-0.5' : 'px-2 space-y-1 items-center')}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl transition-colors group relative',
                    isSidebarOpen
                      ? 'gap-3 px-3 py-2.5 text-xs font-medium w-full'
                      : 'w-10 h-10 justify-center',
                    isActive
                      ? 'bg-[#eb4438] text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:bg-[#2a2a2a] hover:text-white'
                  )}
                >
                  {!isSidebarOpen && isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#eb4438] rounded-r-full" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  {!isSidebarOpen && (
                    <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-[#2a2a2a] text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#3a3a3a] shadow-lg">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={cn('border-t border-[#2e2e2e] bg-[#161616]', isSidebarOpen ? 'p-4' : 'p-2 flex flex-col items-center gap-2')}>
          {isSidebarOpen ? (
            <>
              <div className="flex items-center gap-2 mb-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#eb4438]/20 text-[#eb4438] border border-[#eb4438]/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Principal Admin'}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-[#eb4438]/10 hover:bg-[#eb4438]/20 text-[#eb4438] border border-[#eb4438]/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[#eb4438] hover:bg-[#eb4438]/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#1a1a1a] border-b border-[#2e2e2e] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <Building2 className="w-5 h-5 text-[#eb4438] shrink-0 hidden sm:block" />
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate">
              <span className="text-slate-400 font-normal hidden md:inline">
                {user?.schoolName || 'School Administration'} &middot;{' '}
              </span>
              {currentItem.label}
            </h1>
          </div>

          {/* Right Header */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">{user?.fullName}</div>
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

        {/* Scrollable Page Body - Full Width */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f8fafc] dark:bg-[#212121]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolAdminLayout;
