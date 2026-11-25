import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  GraduationCap,
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Layers,
  FileCheck2,
  CalendarDays,
  LogOut,
  Sparkles,
  Menu,
  Network,
  Users,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const HeadMasterLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return localStorage.getItem('sidebar_expanded') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_expanded', String(next));
      return next;
    });
  };

  const isTreePage = location.pathname.includes('/tree');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Academic Dashboard', path: '/head-master/dashboard', icon: LayoutDashboard },
    { label: 'Hierarchy Tree', path: '/head-master/tree', icon: Network },
    { label: 'Teaching Faculty', path: '/head-master/staff', icon: Users },
    { label: 'Teacher Leaves Review', path: '/head-master/leaves', icon: CalendarDays },
    { label: 'Classes & Sections', path: '/head-master/classes', icon: Layers },
    { label: 'Teacher Allotments', path: '/head-master/allocations', icon: GraduationCap },
    { label: 'Timetable Scheduling', path: '/head-master/timetable', icon: Clock },
    { label: 'Attendance Supervision', path: '/head-master/attendance', icon: CalendarCheck },
    { label: 'Marks Moderation', path: '/head-master/marks-review', icon: FileCheck2 },
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
        <div
          className={cn(
            'h-16 flex items-center border-b border-[#2e2e2e] shrink-0',
            isSidebarOpen ? 'px-3 gap-3 justify-start' : 'justify-center'
          )}
        >
          <button
            onClick={toggleSidebar}
            className="w-11 h-11 flex items-center justify-center rounded-2xl text-slate-300 hover:text-white hover:bg-[#282828] transition-colors shrink-0 cursor-pointer active:scale-95"
            aria-label="Toggle Navigation"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
          {isSidebarOpen && (
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#eb4438] flex items-center justify-center text-white font-bold shadow-md shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate text-white leading-tight">
                  {user?.schoolName || 'Oakridge International'}
                </div>
                <div className="text-[11px] text-[#eb4438] font-medium">Head Master Portal</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          <div className={cn('flex flex-col', isSidebarOpen ? 'px-2 space-y-1' : 'px-2 space-y-2 items-center')}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={cn(
                    'flex items-center transition-all group relative',
                    isSidebarOpen
                      ? 'gap-3 px-3 py-2.5 rounded-xl text-xs font-medium w-full'
                      : 'w-11 h-11 rounded-2xl justify-center',
                    isActive
                      ? isSidebarOpen
                        ? 'bg-[#eb4438] text-white font-bold shadow-md shadow-[#eb4438]/20'
                        : 'bg-[#eb4438] text-white font-bold shadow-lg shadow-[#eb4438]/30'
                      : 'text-slate-400 hover:bg-[#252525] hover:text-white'
                  )}
                >
                  <Icon className={cn('shrink-0 transition-transform', isSidebarOpen ? 'w-4 h-4' : 'w-5 h-5')} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  {!isSidebarOpen && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#222222] text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#383838] shadow-2xl">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div
          className={cn(
            'border-t border-[#2e2e2e] bg-[#161616]',
            isSidebarOpen ? 'p-4' : 'p-2 flex flex-col items-center gap-2'
          )}
        >
          {isSidebarOpen ? (
            <>
              <div className="flex items-center gap-2 mb-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#eb4438]/20 text-[#eb4438] border border-[#eb4438]/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {user?.fullName?.charAt(0) || 'H'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Head Master'}</div>
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
            <Sparkles className="w-5 h-5 text-[#eb4438] shrink-0 hidden sm:block" />
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate">
              <span className="text-slate-400 font-normal hidden md:inline">
                Academic Direction &middot;{' '}
              </span>
              {currentItem.label}
            </h1>
          </div>

          {/* Right Header */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">{user?.fullName}</div>
              <div className="text-[10px] text-slate-400 leading-tight">Head Master &middot; Academics</div>
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
        <main
          className={cn(
            'flex-1 overflow-x-hidden transition-all',
            isTreePage
              ? 'p-0 overflow-hidden bg-[#141414]'
              : 'p-4 sm:p-6 overflow-y-auto bg-[#f8fafc] dark:bg-[#212121]'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HeadMasterLayout;
