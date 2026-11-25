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
  Network,
  Menu,
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
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 z-30 shrink-0',
        'bg-[#1a1a1a] border-r border-[#2e2e2e]',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Top: Hamburger + Brand */}
      <div className="h-16 flex items-center border-b border-[#2e2e2e] px-3 gap-3 shrink-0">
        {/* Hamburger always visible */}
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-[#333333] transition-colors shrink-0 cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand — only shown when expanded */}
        {isOpen && (
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#eb4438] flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                Smart Edu
              </span>
              <span className="text-[10px] text-slate-400 tracking-tight truncate">
                By BluNet IT Services
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {isOpen && (
          <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Management
          </div>
        )}
        <div className={cn('flex flex-col', isOpen ? 'px-2 space-y-0.5' : 'px-2 space-y-1 items-center')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                title={!isOpen ? item.name : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-xl transition-colors group relative',
                    isOpen
                      ? 'gap-3 px-3 py-2.5 text-xs font-medium w-full'
                      : 'w-10 h-10 justify-center',
                    isActive
                      ? 'bg-[#eb4438] text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:bg-[#2a2a2a] hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator dot when collapsed */}
                    {!isOpen && isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#eb4438] rounded-r-full" />
                    )}
                    <Icon className="w-5 h-5 shrink-0" />
                    {isOpen && <span className="truncate">{item.name}</span>}

                    {/* Tooltip on collapsed */}
                    {!isOpen && (
                      <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-[#2a2a2a] text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#3a3a3a] shadow-lg">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer: User & Logout */}
      <div className={cn('border-t border-[#2e2e2e] bg-[#161616]', isOpen ? 'p-4' : 'p-2 flex flex-col items-center gap-2')}>
        {isOpen ? (
          <>
            <div className="flex items-center gap-2 mb-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#eb4438]/20 text-[#eb4438] border border-[#eb4438]/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.fullName || 'Super Administrator'}
                </div>
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
  );
};

export default Sidebar;
