import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/users', icon: 'group', label: 'Users' },
    { path: '/departments', icon: 'corporate_fare', label: 'Departments' },
    { path: '/teams', icon: 'groups', label: 'Teams' },
    { path: '/insights', icon: 'monitoring', label: 'Insights' },
    { path: '/logs', icon: 'receipt_long', label: 'Logs' },
  ];

  return (
    <aside className="w-64 border-r border-border-light bg-surface-light dark:bg-background-dark flex flex-col sticky top-0 h-screen">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-border-light">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-[20px]">chrome_reader_mode</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-text-primary leading-tight">Chrome Admin</h1>
          <p className="text-xs text-text-secondary">Enterprise Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => {
              const baseClasses = 'flex items-center gap-3 px-3 py-2 transition-all duration-150 text-sm font-medium';
              const activeClasses = 'bg-sidebar-active text-primary rounded-pill-right';
              const inactiveClasses = 'text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl';
              return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
            }}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings at Bottom */}
      <div className="p-3 mt-auto border-t border-border-light">
        <NavLink
          to="/settings"
          className={({ isActive }) => {
            const baseClasses = 'flex items-center gap-3 px-3 py-2 transition-all duration-150 text-sm font-medium';
            const activeClasses = 'bg-sidebar-active text-primary rounded-pill-right';
            const inactiveClasses = 'text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl';
            return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
          }}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
