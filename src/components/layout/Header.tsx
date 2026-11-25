import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Shield, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  unreadNotificationsCount?: number;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadNotificationsCount = 0,
  onOpenMobileMenu,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Generate breadcrumb from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0 ? pathParts[0].replace('-', ' ') : 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-[#383838] bg-white dark:bg-[#282828] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Mobile Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-xl min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors shrink-0 cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 capitalize font-medium truncate">
          <span className="hidden sm:inline">Platform</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-slate-900 dark:text-white font-semibold">{breadcrumb}</span>
        </div>

        <div className="relative flex-1 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search schools, subscriptions, invoices, or users..."
            className="w-full bg-slate-50 dark:bg-[#212121] border border-slate-200 dark:border-[#383838] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#262626] focus:outline-none focus:ring-1 focus:ring-[#eb4438] focus:border-[#eb4438] transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Theme Toggle, Notifications, Profile & Direct Logout Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Switching Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#333333] hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#eb4438] ring-2 ring-white dark:ring-[#282828]" />
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#333333] transition-colors focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#eb4438]/10 text-[#eb4438] border border-[#eb4438]/20 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none truncate">
                {user?.fullName || 'Super Admin'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 leading-none flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-[#eb4438]" />
                {user?.role || 'SUPER_ADMIN'}
              </div>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#282828] p-2 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-[#383838] mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#333333] hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Platform Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-1.5 text-xs text-[#eb4438] hover:bg-[#eb4438]/10 rounded-lg flex items-center gap-2 mt-1 transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Direct, Visible Header Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-[#eb4438] hover:text-white hover:bg-[#eb4438] border border-[#eb4438]/40 transition-colors cursor-pointer"
          title="Sign Out of Platform"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
