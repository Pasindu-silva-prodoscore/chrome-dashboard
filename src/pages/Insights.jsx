import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
      // Mock data for demo
      setInsights({
        userGrowth: [
          { month: 'Jan', users: 8420 },
          { month: 'Feb', users: 9150 },
          { month: 'Mar', users: 10200 },
          { month: 'Apr', users: 11500 },
          { month: 'May', users: 12100 },
          { month: 'Jun', users: 12842 },
        ],
        deviceDistribution: [
          { type: 'ChromeOS', count: 4500, percentage: 55 },
          { type: 'Windows', count: 2400, percentage: 29 },
          { type: 'macOS', count: 1100, percentage: 13 },
          { type: 'Linux', count: 215, percentage: 3 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-text-primary mb-1">Insights & Analytics</h2>
        <p className="text-text-secondary text-sm">Monitor trends and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <h3 className="font-semibold text-[18px] text-text-primary mb-6">User Growth (6 Months)</h3>
          <div className="space-y-4">
            {insights?.userGrowth.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">{item.month}</span>
                  <span className="text-sm font-semibold text-text-primary">{item.users.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(item.users / 13000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <h3 className="font-semibold text-[18px] text-text-primary mb-6">Device Distribution</h3>
          <div className="space-y-4">
            {insights?.deviceDistribution.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-primary' :
                    index === 1 ? 'bg-indigo-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-slate-400'
                  }`}></div>
                  <span className="text-sm font-medium text-text-primary">{device.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">{device.count.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-text-primary w-12 text-right">{device.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-border-subtle dark:border-slate-800">
            <div className="flex h-4 rounded-full overflow-hidden">
              {insights?.deviceDistribution.map((device, index) => (
                <div
                  key={index}
                  className={`${
                    index === 0 ? 'bg-primary' :
                    index === 1 ? 'bg-indigo-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${device.percentage}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <h4 className="font-semibold text-text-primary">Active Sessions</h4>
          </div>
          <div className="text-[32px] font-bold text-text-primary mb-2">9,845</div>
          <div className="text-[13px] text-success font-medium">+12.5% from last week</div>
        </div>

        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <h4 className="font-semibold text-text-primary">Avg. Session Time</h4>
          </div>
          <div className="text-[32px] font-bold text-text-primary mb-2">4.5h</div>
          <div className="text-[13px] text-text-secondary font-medium">+0.3h from last week</div>
        </div>

        <div className="bg-surface-light dark:bg-slate-900 p-6 rounded-card border border-border-light dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
            <h4 className="font-semibold text-text-primary">Issues Reported</h4>
          </div>
          <div className="text-[32px] font-bold text-text-primary mb-2">23</div>
          <div className="text-[13px] text-error font-medium">-8 from last week</div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
