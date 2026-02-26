import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Extract initials from user email
  const getInitials = (email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = getInitials(user?.email);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border-light bg-surface-light dark:bg-background-dark flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="max-w-xl w-full relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
            search
          </span>
          <input
            className="w-full bg-search-bg dark:bg-slate-800 border-none rounded-search py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            placeholder="Search users, departments, or teams..."
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-text-secondary transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-text-secondary transition-colors">
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>
        
        <div className="h-6 w-[1px] bg-border-light dark:bg-slate-800 mx-1"></div>
        
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl py-1.5 px-3 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {initials}
            </div>
            <span className="text-sm font-medium text-text-primary hidden lg:block">{displayName}</span>
            <span className="material-symbols-outlined text-text-secondary text-[18px] hidden lg:block">
              {showUserMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          
          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-border-light dark:border-slate-700 py-2 z-50">
              <div className="px-4 py-3 border-b border-border-light dark:border-slate-700">
                <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[20px] text-text-secondary">settings</span>
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/');
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[20px] text-text-secondary">account_circle</span>
                <span>Profile</span>
              </button>
              
              <div className="border-t border-border-light dark:border-slate-700 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
