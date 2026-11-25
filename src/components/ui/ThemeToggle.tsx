import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/theme.store';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
        isDark
          ? 'bg-[#2b2b2b] text-amber-400 hover:bg-[#333333] border border-[#3d3d3d] shadow-sm'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-xs'
      } ${className}`}
      aria-label="Toggle Theme"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme (#212121)'}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
