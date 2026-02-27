import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalTeams: 0,
    totalInsights: 0,
    highRiskInsights: 0,
    mediumRiskInsights: 0,
    lowRiskInsights: 0,
  });
  
  const [recentInsights, setRecentInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all counts in parallel
      const [
        usersCount,
        departmentsCount,
        teamsCount,
        totalInsightsCount,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        insightsData
      ] = await Promise.all([
        apiService.getUsers({ page: 1, per_page: 1 }).then(r => r?.result?.total_count || 0).catch(() => 0),
        apiService.getDepartments({ page: 1, per_page: 1 }).then(r => r?.result?.total_count || 0).catch(() => 0),
        apiService.getTeams({ page: 1, per_page: 1 }).then(r => r?.result?.total_count || 0).catch(() => 0),
        apiService.getInsightsCount().then(r => r?.result || 0).catch(() => 0),
        apiService.getInsightsCount({ 
          filters: JSON.stringify({ risk_level: 'high' }),
          filters_type: 'json'
        }).then(r => r?.result || 0).catch(() => 0),
        apiService.getInsightsCount({ 
          filters: JSON.stringify({ risk_level: 'medium' }),
          filters_type: 'json'
        }).then(r => r?.result || 0).catch(() => 0),
        apiService.getInsightsCount({ 
          filters: JSON.stringify({ risk_level: 'low' }),
          filters_type: 'json'
        }).then(r => r?.result || 0).catch(() => 0),
        apiService.getInsights({ 
          page: 1, 
          per_page: 5,
          order_by: '-created_at'
        }).then(r => r?.result?.items || []).catch(() => [])
      ]);
      
      setStats({
        totalUsers: usersCount,
        totalDepartments: departmentsCount,
        totalTeams: teamsCount,
        totalInsights: totalInsightsCount,
        highRiskInsights: highRiskCount,
        mediumRiskInsights: mediumRiskCount,
        lowRiskInsights: lowRiskCount,
      });
      
      setRecentInsights(insightsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: 'groups',
      color: 'primary',
      description: 'Active user accounts',
      link: '/users'
    },
    {
      title: 'Departments',
      value: (stats.totalDepartments || 0).toLocaleString(),
      icon: 'corporate_fare',
      color: 'indigo',
      description: 'Organizational units',
      link: '/departments'
    },
    {
      title: 'Teams',
      value: (stats.totalTeams || 0).toLocaleString(),
      icon: 'diversity_3',
      color: 'purple',
      description: 'Active teams',
      link: '/teams'
    },
    {
      title: 'Total Insights',
      value: (stats.totalInsights || 0).toLocaleString(),
      icon: 'psychology',
      color: 'emerald',
      description: 'AI-generated insights',
      link: '/insights'
    },
  ];

  const riskCards = [
    {
      title: 'High Risk',
      value: stats.highRiskInsights,
      icon: 'error',
      color: 'error',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      percentage: stats.totalInsights > 0 ? ((stats.highRiskInsights / stats.totalInsights) * 100).toFixed(1) : 0
    },
    {
      title: 'Medium Risk',
      value: stats.mediumRiskInsights,
      icon: 'warning',
      color: 'warning',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      percentage: stats.totalInsights > 0 ? ((stats.mediumRiskInsights / stats.totalInsights) * 100).toFixed(1) : 0
    },
    {
      title: 'Low Risk',
      value: stats.lowRiskInsights,
      icon: 'check_circle',
      color: 'success',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      percentage: stats.totalInsights > 0 ? ((stats.lowRiskInsights / stats.totalInsights) * 100).toFixed(1) : 0
    },
  ];

  const getCardColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600',
      error: 'bg-red-100 dark:bg-red-900/20 text-red-600',
      warning: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600',
      success: 'bg-green-100 dark:bg-green-900/20 text-green-600',
    };
    return colors[color] || colors.primary;
  };

  const getRiskBadgeColor = (riskLevel) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[riskLevel?.toLowerCase()] || colors.low;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto w-full">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
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
        <h2 className="text-[2rem] font-extrabold text-[#222b45] dark:text-dark-primary mb-1 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-[#7b8190] dark:text-dark-secondary text-base">
          Real-time insights and analytics for your organization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            onClick={() => card.link && navigate(card.link)}
            className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-[#e5eaf2] dark:border-border-dark shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCardColorClasses(card.color)} group-hover:scale-110 transition-transform`}> 
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
            </div>
            <h3 className="text-[2rem] font-extrabold text-[#222b45] dark:text-dark-primary leading-none mb-2">
              {card.value}
            </h3>
            <p className="text-[#7b8190] dark:text-dark-secondary text-[14px] font-medium">
              {card.title}
            </p>
            <p className="text-[#a4abb8] dark:text-dark-secondary text-[12px] mt-1">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Risk Analysis Section */}
      <div className="mb-8">
        <h3 className="text-[1.5rem] font-bold text-[#222b45] dark:text-dark-primary mb-4">
          Insights Risk Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {riskCards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} p-6 rounded-2xl border border-${card.color}/20 dark:border-${card.color}/30`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`material-symbols-outlined text-[28px] ${card.textColor}`}>
                  {card.icon}
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${card.textColor} bg-white dark:bg-gray-800`}>
                  {card.percentage}%
                </span>
              </div>
              <h4 className="text-[2rem] font-extrabold mb-1" style={{ color: card.textColor.split(' ')[0].replace('text-', '#') }}>
                {card.value}
              </h4>
              <p className={`text-[14px] font-medium ${card.textColor}`}>
                {card.title} Insights
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Insights Section */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl border border-[#e5eaf2] dark:border-border-dark overflow-hidden shadow-sm">
          <div className="px-7 py-5 border-b border-[#e5eaf2] dark:border-border-dark flex items-center justify-between">
            <h4 className="font-semibold text-[18px] text-[#222b45] dark:text-dark-primary">
              Recent Insights
            </h4>
            <button 
              onClick={() => navigate('/insights')}
              className="text-primary text-sm font-medium hover:underline transition-all"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-[#e5eaf2] dark:divide-border-dark">
            {recentInsights.length === 0 ? (
              <div className="px-7 py-12 text-center text-[#7b8190] dark:text-dark-secondary">
                <span className="material-symbols-outlined text-[48px] mb-2 opacity-30">
                  psychology
                </span>
                <p>No insights available yet</p>
              </div>
            ) : (
              recentInsights.map((insight) => (
                <div 
                  key={insight.id} 
                  className="px-7 py-4 hover:bg-[#f4f7fa] dark:hover:bg-[#3c4043] transition-colors cursor-pointer"
                  onClick={() => navigate('/insights')}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h5 className="text-[15px] font-semibold text-[#222b45] dark:text-dark-primary line-clamp-1">
                      {insight.title || 'Untitled Insight'}
                    </h5>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getRiskBadgeColor(insight.risk_level)}`}>
                      {insight.risk_level || 'N/A'}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#7b8190] dark:text-dark-secondary line-clamp-2 mb-2">
                    {insight.summary || 'No summary available'}
                  </p>
                  <div className="flex items-center gap-4 text-[12px] text-[#a4abb8] dark:text-dark-secondary">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {formatDate(insight.created_at)}
                    </span>
                    {insight.confidence_score && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">analytics</span>
                        {(insight.confidence_score * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Insights Distribution */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-[#e5eaf2] dark:border-border-dark shadow-sm">
            <h4 className="font-semibold text-[18px] text-[#222b45] dark:text-dark-primary mb-4">
              Insights Distribution
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#7b8190] dark:text-dark-secondary">High Risk</span>
                  <span className="font-semibold text-red-600">{stats.highRiskInsights}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${stats.totalInsights > 0 ? (stats.highRiskInsights / stats.totalInsights) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#7b8190] dark:text-dark-secondary">Medium Risk</span>
                  <span className="font-semibold text-amber-600">{stats.mediumRiskInsights}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${stats.totalInsights > 0 ? (stats.mediumRiskInsights / stats.totalInsights) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#7b8190] dark:text-dark-secondary">Low Risk</span>
                  <span className="font-semibold text-green-600">{stats.lowRiskInsights}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${stats.totalInsights > 0 ? (stats.lowRiskInsights / stats.totalInsights) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-[#e5eaf2] dark:border-border-dark shadow-sm">
            <h4 className="font-semibold text-[18px] text-[#222b45] dark:text-dark-primary mb-4">
              Quick Actions
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/users')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#e5eaf2] dark:border-border-dark hover:bg-[#f4f7fa] dark:hover:bg-[#3c4043] hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
                <span className="text-[14px] font-medium text-[#222b45] dark:text-dark-primary">Manage Users</span>
              </button>
              <button
                onClick={() => navigate('/departments')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#e5eaf2] dark:border-border-dark hover:bg-[#f4f7fa] dark:hover:bg-[#3c4043] hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-indigo-600 text-[22px]">corporate_fare</span>
                <span className="text-[14px] font-medium text-[#222b45] dark:text-dark-primary">View Departments</span>
              </button>
              <button
                onClick={() => navigate('/teams')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#e5eaf2] dark:border-border-dark hover:bg-[#f4f7fa] dark:hover:bg-[#3c4043] hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-purple-600 text-[22px]">diversity_3</span>
                <span className="text-[14px] font-medium text-[#222b45] dark:text-dark-primary">View Teams</span>
              </button>
              <button
                onClick={() => navigate('/insights')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#e5eaf2] dark:border-border-dark hover:bg-[#f4f7fa] dark:hover:bg-[#3c4043] hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">psychology</span>
                <span className="text-[14px] font-medium text-[#222b45] dark:text-dark-primary">View All Insights</span>
              </button>
            </div>
          </div>

          {/* Alert Card */}
          {stats.highRiskInsights > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-red-600 text-[24px]">error</span>
                <div>
                  <h4 className="font-semibold text-[16px] text-red-900 dark:text-red-400 mb-1">
                    High Risk Alerts
                  </h4>
                  <p className="text-[14px] text-red-800 dark:text-red-300 leading-relaxed">
                    You have {stats.highRiskInsights} high-risk insight{stats.highRiskInsights !== 1 ? 's' : ''} requiring immediate attention.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/insights')}
                className="w-full bg-red-600 text-white text-[14px] font-semibold py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Review Insights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
