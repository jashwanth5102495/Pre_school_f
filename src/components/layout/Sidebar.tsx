import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  Repeat,
  CreditCard,
  Receipt,
  Users,
  Grid,
  Bell,
  BarChart3,
  LifeBuoy,
  ShieldCheck,
  Settings,
  Sparkles,
  LogOut,
  X,
  Network,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/auth.store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schools Directory', href: '/schools', icon: School },
  { name: 'Hierarchy Tree', href: '/tree', icon: Network },
  { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
  { name: 'Plans & Pricing', href: '/plans', icon: CreditCard },
  { name: 'Payments & Invoices', href: '/payments', icon: Receipt },
  { name: 'Platform Users', href: '/users', icon: Users },
  { name: 'Modules & Features', href: '/modules', icon: Grid },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Support', href: '/support', icon: LifeBuoy },
  { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <>
      {/* Brand & Organization */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-[#383838]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#eb4438] flex items-center justify-center text-white shadow-sm font-bold text-lg shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
              Smart Edu
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 tracking-tight truncate">
              By BluNet IT Services
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management & Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-colors',
                  isActive
                    ? 'bg-[#eb4438] text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#333333] hover:text-slate-900 dark:hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Direct Logout Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-[#383838] bg-slate-50/70 dark:bg-[#242424]">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.fullName || 'Super Administrator'}
            </div>
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
    </>
  );

  return (
    <>
      {/* ===================== DESKTOP SIDEBAR ===================== */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200/80 dark:border-[#383838] bg-white dark:bg-[#282828] flex-col shrink-0 h-screen sticky top-0 z-20 transition-colors duration-200">
        {navContent}
      </aside>

      {/* ===================== MOBILE DRAWER ===================== */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#282828] flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
