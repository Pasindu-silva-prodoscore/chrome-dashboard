import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // User info state
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Criticality counts state
  const [criticalityCounts, setCriticalityCounts] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  
  // Insights list state
  const [insights, setInsights] = useState([]);
  const [expandedInsightId, setExpandedInsightId] = useState(null);
  
  // Filter state
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [filters, setFilters] = useState({
    riskLevels: [],
    eventTypes: [],
    appNames: [],
    categories: [],
    dateRange: { start: '', end: '' }
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(10);
  
  // Build API filters from UI state
  const buildApiFilters = () => {
    const apiFilters = {};
    
    // User filter (always applied)
    apiFilters.user_id = user?.user_id;
    
    // Risk level filter
    if (filters.riskLevels.length > 0) {
      apiFilters.risk_level = filters.riskLevels[0]; // Backend limitation: only single value
    }
    
    // Event type filter
    if (filters.eventTypes.length > 0) {
      apiFilters.event_type = filters.eventTypes[0];
    }
    
    // App name filter
    if (filters.appNames.length > 0) {
      apiFilters.app_name = filters.appNames[0];
    }
    
    // Insight categories filter
    if (filters.categories.length > 0) {
      apiFilters.insight_category = filters.categories[0]; // TODO: Support multiple categories
    }
    
    // Date range filter
    if (filters.dateRange.start) {
      apiFilters.generated_at__gte = filters.dateRange.start;
    }
    if (filters.dateRange.end) {
      apiFilters.generated_at__lte = filters.dateRange.end;
    }
    
    return apiFilters;
  };
  
  // Load user info
  const loadUser = async () => {
    try {
      console.log('Loading user:', userId);
      const data = await apiService.getUser(userId);
      console.log('User data received:', data);
      if (data?.result) {
        setUser(data.result);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };
  
  // Load criticality counts for this user
  const loadCriticalityCounts = async () => {
    try {
      // Count critical insights
      const criticalData = await apiService.getInsightsCount({
        filters: JSON.stringify({ user_id: user.user_id, risk_level: 'critical' }),
        filters_type: 'json'
      });
      
      // Count high insights
      const highData = await apiService.getInsightsCount({
        filters: JSON.stringify({ user_id: user.user_id, risk_level: 'high' }),
        filters_type: 'json'
      });
      
      // Count medium insights
      const mediumData = await apiService.getInsightsCount({
        filters: JSON.stringify({ user_id: user.user_id, risk_level: 'medium' }),
        filters_type: 'json'
      });
      
      // Count low insights
      const lowData = await apiService.getInsightsCount({
        filters: JSON.stringify({ user_id: user.user_id, risk_level: 'low' }),
        filters_type: 'json'
      });
      
      setCriticalityCounts({
        critical: criticalData?.result || 0,
        high: highData?.result || 0,
        medium: mediumData?.result || 0,
        low: lowData?.result || 0
      });
    } catch (error) {
      console.error('Error loading criticality counts:', error);
    }
  };
  
  // Load insights for this user (with filters and pagination)
  const loadInsights = async () => {
    try {
      // Show appropriate loading state
      if (insights.length > 0) {
        setDataLoading(true);  // Subsequent loads - only results area
      } else {
        setInitialLoading(true);  // First load - full page
      }
      
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: 'generated_at',
        sort_order: 'desc',
        filters: JSON.stringify(buildApiFilters()),
        filters_type: 'json'
      };
      
      const data = await apiService.getInsights(params);
      
      if (data?.result) {
        const { items, total_count, total_pages } = data.result;
        setInsights(items || []);
        setTotalCount(total_count || 0);
        setTotalPages(total_pages || 1);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setInitialLoading(false);
      setDataLoading(false);
    }
  };
  
  // Load all data on mount and when filters/page change
  useEffect(() => {
    loadUser();
  }, [userId]);
  
  useEffect(() => {
    if (user?.user_id) {
      loadCriticalityCounts();
      loadInsights();
    }
  }, [user?.user_id, currentPage, filters]);
  
  // Filter toggle functions
  const toggleRiskLevel = (level) => {
    setFilters(prev => ({
      ...prev,
      riskLevels: prev.riskLevels.includes(level)
        ? prev.riskLevels.filter(l => l !== level)
        : [...prev.riskLevels, level]
    }));
    setCurrentPage(1);
  };
  
  const toggleEventType = (type) => {
    setFilters(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter(t => t !== type)
        : [...prev.eventTypes, type]
    }));
    setCurrentPage(1);
  };
  
  const toggleAppName = (name) => {
    setFilters(prev => ({
      ...prev,
      appNames: prev.appNames.includes(name)
        ? prev.appNames.filter(n => n !== name)
        : [...prev.appNames, name]
    }));
    setCurrentPage(1);
  };

  const toggleCategory = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      riskLevels: [],
      eventTypes: [],
      appNames: [],
      categories: [],
      dateRange: { start: '', end: '' }
    });
    setCurrentPage(1);
  };
  
  // Get unique values from current page results
  const getUniqueEventTypes = () => {
    if (!insights || insights.length === 0) return [];
    return [...new Set(insights.map(i => i.event_type))];
  };
  
  const getUniqueAppNames = () => {
    if (!insights || insights.length === 0) return [];
    return [...new Set(insights.map(i => i.app_name))];
  };
  
  const getRiskLevelColor = (level) => {
    const colors = {
      critical: 'text-red-700 bg-red-50 border-red-200',
      high: 'text-orange-700 bg-orange-50 border-orange-200',
      medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      low: 'text-blue-700 bg-blue-50 border-blue-200'
    };
    return colors[level] || colors.low;
  };
  
  const activeFilterCount = 
    filters.riskLevels.length + 
    filters.eventTypes.length + 
    filters.appNames.length + 
    filters.categories.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);
  
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light">
        <div className="text-text-primary">Loading user details...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-lg bg-white border border-border-light text-text-primary hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {user?.name || user?.username || 'User Details'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {user?.primary_email || user?.user_id}
          </p>
        </div>
      </div>
      
      {/* Criticality Count Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border-light rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Critical</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{criticalityCounts.critical}</p>
            </div>
            <span className="material-symbols-outlined text-red-600 text-4xl">error</span>
          </div>
        </div>
        
        <div className="bg-white border border-border-light rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">High</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{criticalityCounts.high}</p>
            </div>
            <span className="material-symbols-outlined text-orange-600 text-4xl">warning</span>
          </div>
        </div>
        
        <div className="bg-white border border-border-light rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Medium</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{criticalityCounts.medium}</p>
            </div>
            <span className="material-symbols-outlined text-yellow-600 text-4xl">info</span>
          </div>
        </div>
        
        <div className="bg-white border border-border-light rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Low</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{criticalityCounts.low}</p>
            </div>
            <span className="material-symbols-outlined text-blue-600 text-4xl">check_circle</span>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="bg-white border border-border-light rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-text-primary">tune</span>
            <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <span
              onClick={clearFilters}
              className="text-sm text-text-secondary hover:text-text-primary cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">filter_list_off</span>
              Clear All
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Risk Level Filter */}
          <div className="relative">
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'risk' ? null : 'risk')}
              className="w-full flex items-center justify-between p-3 bg-search-bg-light border border-border-light rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-medium">Risk Level</span>
                {filters.riskLevels.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                    {filters.riskLevels.length}
                  </span>
                )}
              </div>
              <span className={`material-symbols-outlined text-text-secondary transition-transform ${expandedFilter === 'risk' ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {expandedFilter === 'risk' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {['critical', 'high', 'medium', 'low'].map((level) => (
                  <div
                    key={level}
                    onClick={() => toggleRiskLevel(level)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      filters.riskLevels.includes(level)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-border-light'
                    }`}>
                      {filters.riskLevels.includes(level) && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded border capitalize ${getRiskLevelColor(level)}`}>
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Event Type Filter */}
          <div className="relative">
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'event' ? null : 'event')}
              className="w-full flex items-center justify-between p-3 bg-search-bg-light border border-border-light rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-medium">Event Type</span>
                {filters.eventTypes.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                    {filters.eventTypes.length}
                  </span>
                )}
              </div>
              <span className={`material-symbols-outlined text-text-secondary transition-transform ${expandedFilter === 'event' ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {expandedFilter === 'event' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {getUniqueEventTypes().map((type) => (
                  <div
                    key={type}
                    onClick={() => toggleEventType(type)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      filters.eventTypes.includes(type)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-border-light'
                    }`}>
                      {filters.eventTypes.includes(type) && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className="text-text-primary text-sm">{type}</span>
                  </div>
                ))}
                {getUniqueEventTypes().length === 0 && (
                  <div className="p-3 text-text-secondary text-sm text-center">
                    No event types available
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* App Name Filter */}
          <div className="relative">
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'app' ? null : 'app')}
              className="w-full flex items-center justify-between p-3 bg-search-bg-light border border-border-light rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-medium">App Name</span>
                {filters.appNames.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                    {filters.appNames.length}
                  </span>
                )}
              </div>
              <span className={`material-symbols-outlined text-text-secondary transition-transform ${expandedFilter === 'app' ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {expandedFilter === 'app' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {getUniqueAppNames().map((name) => (
                  <div
                    key={name}
                    onClick={() => toggleAppName(name)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      filters.appNames.includes(name)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-border-light'
                    }`}>
                      {filters.appNames.includes(name) && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className="text-text-primary text-sm">{name}</span>
                  </div>
                ))}
                {getUniqueAppNames().length === 0 && (
                  <div className="p-3 text-text-secondary text-sm text-center">
                    No app names available
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'category' ? null : 'category')}
              className="w-full flex items-center justify-between p-3 bg-search-bg-light border border-border-light rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-medium">Category</span>
                {filters.categories.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                    {filters.categories.length}
                  </span>
                )}
              </div>
              <span className={`material-symbols-outlined text-text-secondary transition-transform ${expandedFilter === 'category' ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {expandedFilter === 'category' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-lg shadow-lg z-10">
                {['communication', 'hr', 'security'].map((category) => (
                  <div
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      filters.categories.includes(category)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-border-light'
                    }`}>
                      {filters.categories.includes(category) && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className="text-text-primary text-sm capitalize">{category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Date Range Filter */}
          <div className="relative">
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'date' ? null : 'date')}
              className="w-full flex items-center justify-between p-3 bg-search-bg-light border border-border-light rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-medium">Date Range</span>
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                    1
                  </span>
                )}
              </div>
              <span className={`material-symbols-outlined text-text-secondary transition-transform ${expandedFilter === 'date' ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {expandedFilter === 'date' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-lg shadow-lg z-10 p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }));
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded text-text-primary text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }));
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded text-text-primary text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Insights List */}
      <div className="space-y-4">
        
        {/* Loading State for Subsequent Data Loads */}
        {dataLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Insights with Reduced Opacity During Loading */}
        <div className={`space-y-4 transition-opacity ${dataLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {insights.length === 0 ? (
          <div className="bg-white border border-border-light rounded-lg p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-text-secondary text-5xl mb-4">search_off</span>
            <p className="text-text-primary text-lg mb-2 font-semibold">No insights found</p>
            <p className="text-text-secondary text-sm">
              {activeFilterCount > 0
                ? 'Try adjusting your filters to see more results'
                : 'No insights have been generated for this user yet'}
            </p>
          </div>
        ) : (
          insights.map((insight) => {
            const isExpanded = expandedInsightId === insight.id;
            
            return (
              <div
                key={insight.id}
                className="bg-white border border-border-light rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors shadow-sm"
              >
                {/* Collapsed View - Always Visible */}
                <div
                  onClick={() => setExpandedInsightId(isExpanded ? null : insight.id)}
                  className="p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Title and Risk Badge */}
                      <div className="flex items-start gap-3">
                        <h3 className="text-lg font-semibold text-text-primary flex-1">
                          {insight.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded border capitalize whitespace-nowrap ${getRiskLevelColor(insight.risk_level)}`}>
                          {insight.risk_level}
                        </span>
                      </div>
                      
                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span>{insight.user?.username || insight.user?.name || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">speed</span>
                          <span>{Math.round(insight.confidence_score * 100)}% confidence</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">event</span>
                          <span>{insight.event_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">apps</span>
                          <span>{insight.app_name}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <span className={`material-symbols-outlined text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </div>
                
                {/* Expanded View - Show When Clicked */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6 border-t border-border-light pt-6">
                    {/* Summary */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">description</span>
                        Summary
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {insight.summary}
                      </p>
                    </div>
                    
                    {/* Key Findings */}
                    {insight.key_findings && insight.key_findings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">search</span>
                          Key Findings
                        </h4>
                        <ul className="space-y-2">
                          {insight.key_findings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-text-secondary text-sm">
                              <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">lightbulb</span>
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {insight.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-text-secondary text-sm">
                              <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">arrow_forward</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border-light">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Generated</p>
                        <p className="text-sm text-text-primary">
                          {new Date(insight.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">User</p>
                        <p className="text-sm text-text-primary">
                          {insight.user?.username || insight.user?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Event Type</p>
                        <p className="text-sm text-text-primary">{insight.event_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Application</p>
                        <p className="text-sm text-text-primary">{insight.app_name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-border-light rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
              <span className="ml-4">
                Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalCount)} of {totalCount} insights
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border-light text-text-primary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg border transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-border-light text-text-primary hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border-light text-text-primary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
