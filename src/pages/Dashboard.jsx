import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    suspendedUsers: 0,
    managedDevices: 0,
    pendingUpdates: 0,
  });
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data from Django backend
      const [statsData, activitiesData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentActivities(),
      ]);
      
      setStats({
        activeUsers: statsData.active_users || statsData.activeUsers || 0,
        suspendedUsers: statsData.suspended_users || statsData.suspendedUsers || 0,
        managedDevices: statsData.managed_devices || statsData.managedDevices || 0,
        pendingUpdates: statsData.pending_updates || statsData.pendingUpdates || 0,
      });
      setActivities(activitiesData.items || activitiesData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use default values if API fails
      setStats({
        activeUsers: 12842,
        suspendedUsers: 428,
        managedDevices: 8215,
        pendingUpdates: 94,
      });
      
      setActivities([
        {
          id: 1,
          type: 'user_add',
          title: 'New user added',
          description: 'to Marketing department.',
          timestamp: '2 minutes ago',
          user: 'Sarah Johnson',
          icon: 'person_add',
          color: 'blue',
        },
        {
          id: 2,
          type: 'security',
          title: 'Security policy updated',
          description: 'for Global Teams.',
          timestamp: '45 minutes ago',
          user: 'System Automated',
          icon: 'security',
          color: 'amber',
        },
        {
          id: 3,
          type: 'device',
          title: '50 new ChromeOS devices',
          description: 'enrolled successfully.',
          timestamp: '3 hours ago',
          user: 'Tech Support',
          icon: 'devices',
          color: 'emerald',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      title: 'Active Users',
      value: (stats.activeUsers || 0).toLocaleString(),
      change: '+5.2%',
      changeType: 'positive',
      icon: 'person_check',
      color: 'primary',
      progress: 78,
    },
    {
      title: 'Suspended Users',
      value: (stats.suspendedUsers || 0).toLocaleString(),
      change: '-1.4%',
      changeType: 'negative',
      icon: 'person_off',
      color: 'amber',
      progress: 12,
    },
    {
      title: 'Managed Devices',
      value: (stats.managedDevices || 0).toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: 'laptop_mac',
      color: 'indigo',
      progress: 64,
    },
    {
      title: 'Pending Updates',
      value: (stats.pendingUpdates || 0).toLocaleString(),
      change: 'Stable',
      changeType: 'neutral',
      icon: 'system_update',
      color: 'slate',
      progress: 45,
    },
  ];

  const quickActions = [
    { icon: 'person_add', label: 'Add User', action: () => console.log('Add User') },
    { icon: 'add_to_home_screen', label: 'Enroll Device', action: () => console.log('Enroll Device') },
    { icon: 'policy', label: 'Edit Policy', action: () => console.log('Edit Policy') },
    { icon: 'bar_chart', label: 'Report', action: () => console.log('Report') },
  ];

  const getActivityColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
      amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    };
    return colors[color] || colors.blue;
  };

  const getCardColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary',
      amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
      slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600',
    };
    return colors[color] || colors.primary;
  };

  const getProgressColorClass = (color) => {
    const colors = {
      primary: 'bg-primary',
      amber: 'bg-amber-500',
      indigo: 'bg-indigo-600',
      slate: 'bg-slate-400',
    };
    return colors[color] || colors.primary;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto w-full bg-[#f7f9fb] dark:bg-background-dark min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-[2rem] font-extrabold text-[#222b45] dark:text-dark-primary mb-1 tracking-tight">Dashboard Overview</h2>
        <p className="text-[#7b8190] dark:text-dark-secondary text-base">Real-time enterprise environment status and analytics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-8">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-surface-dark p-7 rounded-2xl border border-[#e5eaf2] dark:border-border-dark shadow-sm flex flex-col min-h-[170px]"
            style={{ boxShadow: '0 2px 8px 0 rgba(16,30,54,0.04)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCardColorClasses(card.color)}`}> 
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  card.changeType === 'positive'
                    ? 'text-success bg-success/10'
                    : card.changeType === 'negative'
                    ? 'text-error bg-error/10'
                    : 'text-text-secondary bg-gray-100 dark:bg-slate-800'
                }`}
              >
                {card.change}
              </span>
            </div>
            <p className="text-[#7b8190] dark:text-dark-secondary text-[14px] font-medium mb-1">{card.title}</p>
            <h3 className="text-[2rem] font-extrabold text-[#222b45] dark:text-dark-primary leading-none">{card.value}</h3>
            <div className="mt-4 h-2 w-full bg-[#e5eaf2] dark:bg-[#3c4043] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColorClass(card.color)}`}
                style={{ width: `${card.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl border border-[#e5eaf2] dark:border-border-dark overflow-hidden shadow-sm">
          <div className="px-7 py-5 border-b border-[#e5eaf2] dark:border-border-dark flex items-center justify-between">
            <h4 className="font-semibold text-[18px] text-[#222b45] dark:text-dark-primary">Recent Activity</h4>
            <button className="text-primary text-sm font-medium hover:underline transition-all">View all</button>
          </div>
          <div className="divide-y divide-[#e5eaf2] dark:divide-border-dark">
            {activities.map((activity) => (
              <div key={activity.id} className="px-7 py-4 flex items-start gap-4 hover:bg-[#f4f7fa] dark:hover:bg-[#3c4043] transition-colors">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColorClasses(
                    activity.color
                  )}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{activity.icon}</span>
                </div>
                <div>
                  <p className="text-[15px] text-[#222b45] dark:text-dark-primary">
                    <span className="font-semibold">{activity.title}</span> {activity.description}
                  </p>
                  <p className="text-[13px] text-[#7b8190] dark:text-dark-secondary mt-1">
                    {activity.timestamp} • by {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-7">
          <div className="bg-white dark:bg-surface-dark p-7 rounded-2xl border border-[#e5eaf2] dark:border-border-dark shadow-sm">
            <h4 className="font-semibold text-[18px] text-[#222b45] dark:text-dark-primary mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-[#e5eaf2] dark:border-border-dark hover:bg-[#f4f7fa] dark:hover:bg-[#3c4043] hover:border-primary/30 transition-all group bg-white dark:bg-surface-dark"
                >
                  <span className="material-symbols-outlined text-primary mb-2 text-[26px] group-hover:scale-110 transition-transform">
                    {action.icon}
                  </span>
                  <span className="text-[14px] font-medium text-[#222b45] dark:text-dark-primary">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#eaf3fc] dark:bg-primary/20 rounded-2xl p-7 border border-primary/20 dark:border-primary/30">
            <h4 className="font-semibold text-[18px] text-primary mb-2">Enterprise Insights</h4>
            <p className="text-[14px] text-[#3b4863] dark:text-dark-secondary mb-4 leading-relaxed">
              You have 12 devices running an outdated version of ChromeOS. We recommend scheduling an update for the weekend.
            </p>
            <button className="bg-primary text-white text-[14px] font-semibold py-2.5 px-6 rounded-full hover:bg-primary-hover transition-colors shadow-sm">
              Review Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
