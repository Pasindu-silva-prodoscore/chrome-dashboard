import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
      // Mock data for demo
      setLogs([
        { id: 1, type: 'user', action: 'User login', user: 'john@example.com', timestamp: '2024-02-25 14:32:15', status: 'success' },
        { id: 2, type: 'system', action: 'Policy updated', user: 'System', timestamp: '2024-02-25 14:15:42', status: 'success' },
        { id: 3, type: 'security', action: 'Failed login attempt', user: 'unknown@example.com', timestamp: '2024-02-25 13:58:30', status: 'error' },
        { id: 4, type: 'device', action: 'Device enrolled', user: 'admin@example.com', timestamp: '2024-02-25 13:45:18', status: 'success' },
        { id: 5, type: 'user', action: 'Password changed', user: 'jane@example.com', timestamp: '2024-02-25 13:22:05', status: 'success' },
        { id: 6, type: 'system', action: 'Backup completed', user: 'System', timestamp: '2024-02-25 12:00:00', status: 'success' },
        { id: 7, type: 'security', action: 'Permission denied', user: 'bob@example.com', timestamp: '2024-02-25 11:45:33', status: 'warning' },
        { id: 8, type: 'device', action: 'Device sync failed', user: 'alice@example.com', timestamp: '2024-02-25 11:30:12', status: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filterType === 'all' 
    ? logs 
    : logs.filter(log => log.type === filterType);

  const getLogIcon = (type) => {
    const icons = {
      user: 'person',
      system: 'settings',
      security: 'security',
      device: 'devices',
    };
    return icons[type] || 'info';
  };

  const getLogColor = (type) => {
    const colors = {
      user: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      system: 'bg-slate-100 dark:bg-slate-800 text-slate-600',
      security: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600',
      device: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
    };
    return colors[type] || colors.system;
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
      error: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400',
      warning: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return colors[status] || colors.success;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-text-primary mb-1">Activity Logs</h2>
        <p className="text-text-secondary text-sm">Monitor system and user activities.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          All Logs
        </button>
        <button
          onClick={() => setFilterType('user')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            filterType === 'user'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          User
        </button>
        <button
          onClick={() => setFilterType('system')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            filterType === 'system'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          System
        </button>
        <button
          onClick={() => setFilterType('security')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            filterType === 'security'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setFilterType('device')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            filterType === 'device'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          Device
        </button>
      </div>

      {/* Logs List */}
      <div className="bg-surface-light dark:bg-slate-900 rounded-card border border-border-light dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-border-subtle dark:divide-slate-800">
          {loading ? (
            <div className="p-12 text-center text-text-secondary">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">No logs found</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getLogColor(log.type)}`}>
                  <span className="material-symbols-outlined text-[20px]">{getLogIcon(log.type)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{log.action}</p>
                      <p className="text-[13px] text-text-secondary mt-1">
                        {log.user} • {log.timestamp}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
