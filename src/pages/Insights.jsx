import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Insights = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [expandedInsightId, setExpandedInsightId] = useState(null);
  const [expandedFilter, setExpandedFilter] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    riskLevels: [],
    eventTypes: [],
    appNames: [],
    categories: [],
    dateRange: { start: '', end: '' }
  });
  
  // Load insights when filters or page changes
  useEffect(() => {
    loadInsights();
  }, [currentPage, filters]);
  
  // Build API filters from UI filter state
  const buildApiFilters = () => {
    const apiFilters = {};
    
    // Risk levels filter - convert to OR condition
    if (filters.riskLevels.length > 0) {
      // Backend expects exact match, so we'll need to call API multiple times or use __in operator if available
      // For now, filter by first selected risk level (backend limitation)
      apiFilters.risk_level = filters.riskLevels[0]; // TODO: Support multiple risk levels
    }
    
    // Event types filter
    if (filters.eventTypes.length > 0) {
      apiFilters.event_type = filters.eventTypes[0]; // TODO: Support multiple event types
    }
    
    // App names filter
    if (filters.appNames.length > 0) {
      apiFilters.app_name = filters.appNames[0]; // TODO: Support multiple app names
    }
    
    // Insight categories filter
    if (filters.categories.length > 0) {
      apiFilters.insight_category = filters.categories[0]; // TODO: Support multiple categories
    }
    
    // Date range filter
    if (filters.dateRange.start) {
      apiFilters['generated_at__gte'] = filters.dateRange.start;
    }
    if (filters.dateRange.end) {
      apiFilters['generated_at__lte'] = filters.dateRange.end;
    }
    
    return apiFilters;
  };

  const loadInsights = async () => {
    try {
      // Show appropriate loading state
      if (insights?.aiInsights?.length > 0) {
        setDataLoading(true);  // Subsequent loads - only results area
      } else {
        setInitialLoading(true);  // First load - full page
      }
      
      // Build query parameters
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: 'risk_level',
        sort_order: 'asc',
        filters: JSON.stringify(buildApiFilters()),
        filters_type: 'json'
      };
      
      const data = await apiService.getInsights(params);
      
      // Handle paginated API response
      if (data?.result) {
        const { items, total_count, total_pages } = data.result;
        
        setInsights({
          aiInsights: items || []
        });
        
        setTotalCount(total_count || 0);
        setTotalPages(total_pages || 1);
      } else {
        // Fallback if API response is unexpected
        setInsights({
          aiInsights: []
        });
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights({
        aiInsights: []
      });
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setInitialLoading(false);
      setDataLoading(false);
    }
  };

  const toggleRiskLevel = (level) => {
    setCurrentPage(1); // Reset to first page when filter changes
    setFilters(prev => ({
      ...prev,
      riskLevels: prev.riskLevels.includes(level)
        ? prev.riskLevels.filter(l => l !== level)
        : [...prev.riskLevels, level]
    }));
  };

  const toggleEventType = (type) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter(t => t !== type)
        : [...prev.eventTypes, type]
    }));
  };

  const toggleAppName = (name) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      appNames: prev.appNames.includes(name)
        ? prev.appNames.filter(n => n !== name)
        : [...prev.appNames, name]
    }));
  };

  const toggleCategory = (category) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({
      riskLevels: [],
      eventTypes: [],
      appNames: [],
      categories: [],
      dateRange: { start: '', end: '' }
    });
  };

  const getUniqueEventTypes = () => {
    if (!insights?.aiInsights) return [];
    return [...new Set(insights.aiInsights.map(i => i.event_type).filter(Boolean))];
  };

  const getUniqueAppNames = () => {
    if (!insights?.aiInsights) return [];
    return [...new Set(insights.aiInsights.map(i => i.app_name).filter(Boolean))];
  };

  if (initialLoading) {
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
      
      {/* Filters Section - Independent Dropdowns */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        
        {/* Risk Level Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'risk' ? null : 'risk')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">Risk Level</span>
            {filters.riskLevels.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {filters.riskLevels.length}
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'risk' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'risk' && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 py-2">
              {['low', 'medium', 'high', 'critical'].map(level => (
                <label key={level} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.riskLevels.includes(level)}
                    onChange={() => toggleRiskLevel(level)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-text-secondary dark:text-dark-secondary capitalize">
                    {level}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Event Type Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'event' ? null : 'event')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">Event Type</span>
            {filters.eventTypes.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {filters.eventTypes.length}
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'event' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'event' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
              {getUniqueEventTypes().length > 0 ? (
                getUniqueEventTypes().map(type => (
                  <label key={type} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.eventTypes.includes(type)}
                      onChange={() => toggleEventType(type)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-text-secondary dark:text-dark-secondary">
                      {type}
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-text-muted dark:text-dark-muted">No event types available</p>
              )}
            </div>
          )}
        </div>

        {/* App Name Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'app' ? null : 'app')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">App Name</span>
            {filters.appNames.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {filters.appNames.length}
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'app' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'app' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
              {getUniqueAppNames().length > 0 ? (
                getUniqueAppNames().map(name => (
                  <label key={name} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.appNames.includes(name)}
                      onChange={() => toggleAppName(name)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-text-secondary dark:text-dark-secondary">
                      {name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-text-muted dark:text-dark-muted">No apps available</p>
              )}
            </div>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'category' ? null : 'category')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">Category</span>
            {filters.categories.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {filters.categories.length}
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'category' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'category' && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 py-2">
              {['communication', 'hr', 'security'].map(category => (
                <label key={category} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-text-secondary dark:text-dark-secondary capitalize">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'date' ? null : 'date')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">Date Range</span>
            {filters.dateRange.start && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                1
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'date' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'date' && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary dark:text-dark-secondary mb-1 block">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-search-bg-dark text-text-primary dark:text-dark-primary border border-slate-300 dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary dark:text-dark-secondary mb-1 block">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-search-bg-dark text-text-primary dark:text-dark-primary border border-slate-300 dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear All Button - Only show when filters are active */}
        {(filters.riskLevels.length > 0 || filters.eventTypes.length > 0 || filters.appNames.length > 0 || filters.categories.length > 0 || filters.dateRange.start) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-error/30 text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              filter_list_off
            </span>
            <span className="text-sm font-medium">Clear All</span>
            <span className="px-1.5 py-0.5 bg-error/10 text-error text-xs font-medium rounded-full">
              {filters.riskLevels.length + filters.eventTypes.length + filters.appNames.length + filters.categories.length + (filters.dateRange.start ? 1 : 0)}
            </span>
          </button>
        )}
        
      </div>
      {/* AI-Generated Insights */}
      {insights?.aiInsights && insights.aiInsights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[20px] font-semibold text-text-primary dark:text-dark-primary">AI-Generated Insights</h3>
            <p className="text-sm text-text-muted dark:text-dark-muted">
              Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalCount)} of {totalCount} insights
            </p>
          </div>
          
          {/* Loading State for Subsequent Data Loads */}
          {dataLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Insights List with Reduced Opacity During Loading */}
          {insights?.aiInsights && insights.aiInsights.length > 0 ? (
            <div className={`space-y-4 transition-opacity ${dataLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              {insights.aiInsights.map((insight, index) => {
                const riskColors = {
                  'low': 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50',
                  'medium': 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50',
                  'high': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50',
                  'critical': 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700/50'
                };
                const riskTextColors = {
                  'low': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
                  'medium': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
                  'high': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
                  'critical': 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                };
                const riskLevel = insight.risk_level?.toLowerCase() || 'low';
                const isExpanded = expandedInsightId === insight.id;
                
                return (
                  <div 
                    key={`${insight.id}-${index}`}
                    onClick={() => setExpandedInsightId(isExpanded ? null : insight.id)}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${riskColors[riskLevel] || riskColors['low']}`}>
                    {/* Collapsed View - Essential Info Only */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-[18px] font-semibold text-text-primary dark:text-dark-primary">
                            {insight.title}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap ${riskTextColors[riskLevel] || riskTextColors['low']}`}>
                            {insight.risk_level}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap text-sm text-text-secondary dark:text-dark-secondary">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log('Username clicked! User ID:', insight.user?.user_id);
                              console.log('Full user object:', insight.user);
                              if (insight.user?.user_id) {
                                navigate(`/users/${insight.user.user_id}`);
                              } else {
                                alert('User ID not found in insight data');
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-500/20 hover:text-blue-400 hover:underline transition-colors cursor-pointer border border-transparent hover:border-blue-400"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">person</span>
                            <span>{insight.user?.name || insight.user?.username || 'Unknown'}</span>
                          </button>
                          {insight.event_type && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">event</span>
                              <span>{insight.event_type}</span>
                            </div>
                          )}
                          {insight.app_name && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">apps</span>
                              <span>{insight.app_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {insight.confidence_score && (
                          <div className="text-right">
                            <p className="text-xs text-text-muted dark:text-dark-muted">Confidence</p>
                            <p className="text-lg font-bold text-text-primary dark:text-dark-primary">
                              {(insight.confidence_score * 100).toFixed(0)}%
                            </p>
                          </div>
                        )}
                        <span className={`material-symbols-outlined text-[24px] text-text-secondary dark:text-dark-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </div>
                    </div>
                    
                    {/* Expanded View - Full Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-border-subtle dark:border-border-dark space-y-6 animate-fadeIn">
                        
                        {/* Summary */}
                        {insight.summary && (
                          <div>
                            <h5 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">description</span>
                              Summary
                            </h5>
                            <p className="text-sm text-text-secondary dark:text-dark-secondary leading-relaxed">
                              {insight.summary}
                            </p>
                          </div>
                        )}
                        
                        {/* Key Findings */}
                        {insight.key_findings && insight.key_findings.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">search</span>
                              Key Findings
                            </h5>
                            <ul className="space-y-2">
                              {insight.key_findings.map((finding, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary dark:text-dark-secondary">
                                  <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check_circle</span>
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Recommendations */}
                        {insight.recommendations && insight.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                              Recommendations
                            </h5>
                            <ul className="space-y-2">
                              {insight.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary dark:text-dark-secondary">
                                  <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400 mt-0.5">arrow_forward</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Related Events */}
                        {insight.related_events && insight.related_events.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">link</span>
                              Related Events
                            </h5>
                            <div className="space-y-2">
                              {insight.related_events.map((event, idx) => (
                                <div key={idx} className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg text-sm">
                                  <div className="flex items-center gap-2 text-text-primary dark:text-dark-primary font-medium mb-1">
                                    <span className="material-symbols-outlined text-[16px]">event</span>
                                    <span>{event.event_type || 'Event'}</span>
                                  </div>
                                  <p className="text-text-secondary dark:text-dark-secondary text-xs">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="pt-4 border-t border-border-subtle dark:border-border-dark">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-text-muted dark:text-dark-muted mb-1">Generated</p>
                              <p className="text-text-primary dark:text-dark-primary font-medium">
                                {new Date(insight.generated_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-text-muted dark:text-dark-muted mb-1">User</p>
                              <p className="text-text-primary dark:text-dark-primary font-medium">
                                {insight.user?.name || insight.user?.username || 'Unknown'}
                              </p>
                            </div>
                            {insight.event_type && (
                              <div>
                                <p className="text-text-muted dark:text-dark-muted mb-1">Event Type</p>
                                <p className="text-text-primary dark:text-dark-primary font-medium">
                                  {insight.event_type}
                                </p>
                              </div>
                            )}
                            {insight.app_name && (
                              <div>
                                <p className="text-text-muted dark:text-dark-muted mb-1">Application</p>
                                <p className="text-text-primary dark:text-dark-primary font-medium">
                                  {insight.app_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-text-muted dark:text-dark-muted mb-4 block">
                filter_list_off
              </span>
              <h4 className="text-lg font-semibold text-text-primary dark:text-dark-primary mb-2">No insights match your filters</h4>
              <p className="text-sm text-text-secondary dark:text-dark-secondary mb-4">Try adjusting your filter criteria</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {insights?.aiInsights && insights.aiInsights.length > 0 && totalPages > 1 && (
        <div className="mb-8 flex items-center justify-between bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-4">
          <div className="text-sm text-text-secondary dark:text-dark-secondary">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-primary dark:text-dark-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              <span>Previous</span>
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${ 
                      pageNum === currentPage 
                        ? 'bg-primary text-white' 
                        : 'text-text-primary dark:text-dark-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-primary dark:text-dark-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
