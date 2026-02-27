import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function DepartmentDetail() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  
  // Department info state
  const [department, setDepartment] = useState(null);
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
    
    // Department filter (always applied)
    apiFilters.department_id = department?.id;
    
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
      apiFilters.insight_category = filters.categories[0];
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
  
  // Load department info
  const loadDepartment = async () => {
    try {
      console.log('Loading department:', departmentId);
      const data = await apiService.getDepartment(departmentId);
      console.log('Department data received:', data);
      if (data?.result) {
        setDepartment(data.result);
      }
    } catch (error) {
      console.error('Error loading department:', error);
    }
  };
  
  // Load criticality counts for this department
  const loadCriticalityCounts = async () => {
    try {
      // Count critical insights
      const criticalData = await apiService.getInsightsCount({
        filters: JSON.stringify({ department_id: department.id, risk_level: 'critical' }),
        filters_type: 'json'
      });
      
      // Count high insights
      const highData = await apiService.getInsightsCount({
        filters: JSON.stringify({ department_id: department.id, risk_level: 'high' }),
        filters_type: 'json'
      });
      
      // Count medium insights
      const mediumData = await apiService.getInsightsCount({
        filters: JSON.stringify({ department_id: department.id, risk_level: 'medium' }),
        filters_type: 'json'
      });
      
      // Count low insights
      const lowData = await apiService.getInsightsCount({
        filters: JSON.stringify({ department_id: department.id, risk_level: 'low' }),
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
  
  // Load insights for this department (with filters and pagination)
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
      
      console.log('Fetching insights with params:', params);
      const data = await apiService.getInsights(params);
      console.log('Insights data received:', data);
      
      // Handle paginated response
      const insightsData = data?.result?.items || data?.items || [];
      const total = data?.result?.total_count || data?.total_count || 0;
      const pages = data?.result?.total_pages || data?.total_pages || 1;
      
      setInsights(insightsData);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights([]);
    } finally {
      setInitialLoading(false);
      setDataLoading(false);
    }
  };
  
  // Initial load: fetch department first
  useEffect(() => {
    loadDepartment();
  }, [departmentId]);
  
  // Load insights and counts after department is loaded
  useEffect(() => {
    if (department) {
      loadCriticalityCounts();
      loadInsights();
    }
  }, [department, currentPage, filters]);
  
  // Filter toggle handlers
  const toggleFilter = (filterType) => {
    setExpandedFilter(expandedFilter === filterType ? null : filterType);
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handleDateRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [type]: value }
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
  
  // Risk level badge color
  const getRiskBadgeColor = (riskLevel) => {
    const colors = {
      critical: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      high: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
      medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
      low: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
    };
    return colors[riskLevel?.toLowerCase()] || colors.low;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Toggle insight expansion
  const toggleInsightExpansion = (insightId) => {
    setExpandedInsightId(expandedInsightId === insightId ? null : insightId);
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // Calculate active filter count
  const activeFilterCount = 
    filters.riskLevels.length + 
    filters.eventTypes.length + 
    filters.appNames.length + 
    filters.categories.length + 
    (filters.dateRange.start ? 1 : 0) + 
    (filters.dateRange.end ? 1 : 0);
  
  if (initialLoading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!department) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
        <div className="text-center py-12">
          <p className="text-text-secondary dark:text-dark-secondary">Department not found</p>
          <button 
            onClick={() => navigate('/departments')}
            className="mt-4 text-primary hover:text-primary-hover"
          >
            Back to Departments
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header with back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/departments')}
          className="flex items-center text-text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-primary transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[20px] mr-1">arrow_back</span>
          Back to Departments
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-xl text-primary flex items-center justify-center mr-4">
              <span className="material-symbols-outlined text-[32px]">corporate_fare</span>
            </div>
            <div>
              <h2 className="text-[28px] font-bold text-text-primary dark:text-dark-primary mb-1">
                {department.name}
              </h2>
              <p className="text-text-secondary dark:text-dark-secondary text-sm">
                {department.description || 'No description'} • {department.userCount || 0} users • {department.teamCount || 0} teams
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Criticality Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-xs font-medium uppercase tracking-wider mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{criticalityCounts.critical}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">error</span>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-xs font-medium uppercase tracking-wider mb-1">High</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{criticalityCounts.high}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-[20px]">warning</span>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-xs font-medium uppercase tracking-wider mb-1">Medium</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{criticalityCounts.medium}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-[20px]">info</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-wider mb-1">Low</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{criticalityCounts.low}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">check_circle</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary dark:text-dark-primary flex items-center">
            <span className="material-symbols-outlined text-[18px] mr-2">filter_list</span>
            Filters {activeFilterCount > 0 && `(${activeFilterCount} active)`}
          </h3>
          {activeFilterCount > 0 && (
            <button 
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary-hover font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Risk Level Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleFilter('riskLevels')}
              className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg hover:border-primary transition-colors flex items-center justify-between"
            >
              <span className="text-text-primary dark:text-dark-primary">Risk Level {filters.riskLevels.length > 0 && `(${filters.riskLevels.length})`}</span>
              <span className="material-symbols-outlined text-[16px]">
                {expandedFilter === 'riskLevels' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedFilter === 'riskLevels' && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg shadow-lg p-2">
                {['critical', 'high', 'medium', 'low'].map(level => (
                  <label key={level} className="flex items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-[#3c4043] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.riskLevels.includes(level)}
                      onChange={() => handleFilterChange('riskLevels', level)}
                      className="mr-2 accent-primary"
                    />
                    <span className="text-sm text-text-primary dark:text-dark-primary capitalize">{level}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Event Type Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleFilter('eventTypes')}
              className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg hover:border-primary transition-colors flex items-center justify-between"
            >
              <span className="text-text-primary dark:text-dark-primary">Event Type {filters.eventTypes.length > 0 && `(${filters.eventTypes.length})`}</span>
              <span className="material-symbols-outlined text-[16px]">
                {expandedFilter === 'eventTypes' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedFilter === 'eventTypes' && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg shadow-lg p-2">
                {['login', 'download', 'create', 'delete', 'share', 'edit'].map(type => (
                  <label key={type} className="flex items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-[#3c4043] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.eventTypes.includes(type)}
                      onChange={() => handleFilterChange('eventTypes', type)}
                      className="mr-2 accent-primary"
                    />
                    <span className="text-sm text-text-primary dark:text-dark-primary capitalize">{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* App Name Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleFilter('appNames')}
              className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg hover:border-primary transition-colors flex items-center justify-between"
            >
              <span className="text-text-primary dark:text-dark-primary">App {filters.appNames.length > 0 && `(${filters.appNames.length})`}</span>
              <span className="material-symbols-outlined text-[16px]">
                {expandedFilter === 'appNames' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedFilter === 'appNames' && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg shadow-lg p-2">
                {['drive', 'gmail', 'calendar', 'meet', 'docs', 'sheets'].map(app => (
                  <label key={app} className="flex items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-[#3c4043] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.appNames.includes(app)}
                      onChange={() => handleFilterChange('appNames', app)}
                      className="mr-2 accent-primary"
                    />
                    <span className="text-sm text-text-primary dark:text-dark-primary capitalize">{app}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleFilter('categories')}
              className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg hover:border-primary transition-colors flex items-center justify-between"
            >
              <span className="text-text-primary dark:text-dark-primary">Category {filters.categories.length > 0 && `(${filters.categories.length})`}</span>
              <span className="material-symbols-outlined text-[16px]">
                {expandedFilter === 'categories' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedFilter === 'categories' && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto">
                {['security', 'compliance', 'productivity', 'collaboration', 'access'].map(category => (
                  <label key={category} className="flex items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-[#3c4043] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleFilterChange('categories', category)}
                      className="mr-2 accent-primary"
                    />
                    <span className="text-sm text-text-primary dark:text-dark-primary capitalize">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Date Range Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleFilter('dateRange')}
              className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg hover:border-primary transition-colors flex items-center justify-between"
            >
              <span className="text-text-primary dark:text-dark-primary">Date Range</span>
              <span className="material-symbols-outlined text-[16px]">
                {expandedFilter === 'dateRange' ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedFilter === 'dateRange' && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#2d2e30] border border-border-light dark:border-border-dark rounded-lg shadow-lg p-3">
                <div className="mb-2">
                  <label className="block text-xs text-text-secondary dark:text-dark-secondary mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border-light dark:border-border-dark rounded bg-white dark:bg-[#2d2e30] text-text-primary dark:text-dark-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary dark:text-dark-secondary mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border-light dark:border-border-dark rounded bg-white dark:bg-[#2d2e30] text-text-primary dark:text-dark-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Insights List */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-primary">
            Department Insights ({totalCount})
          </h3>
        </div>
        
        {dataLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : insights.length === 0 ? (
          <div className="px-6 py-12 text-center text-text-secondary dark:text-dark-secondary">
            No insights found for this department.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle dark:divide-border-dark">
            {insights.map((insight) => (
              <div key={insight.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#3c4043] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRiskBadgeColor(insight.risk_level)}`}>
                        {insight.risk_level?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      {insight.insight_category && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {insight.insight_category}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-text-primary dark:text-dark-primary mb-1">
                      {insight.insight_title || 'Untitled Insight'}
                    </h4>
                    <p className="text-sm text-text-secondary dark:text-dark-secondary line-clamp-2">
                      {insight.insight_summary || 'No summary available'}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleInsightExpansion(insight.id)}
                    className="ml-4 text-primary hover:text-primary-hover transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {expandedInsightId === insight.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>
                
                {expandedInsightId === insight.id && (
                  <div className="mt-3 pt-3 border-t border-border-subtle dark:border-border-dark">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-text-muted dark:text-dark-muted text-xs mb-1">Event Type</p>
                        <p className="text-text-primary dark:text-dark-primary font-medium">{insight.event_type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-text-muted dark:text-dark-muted text-xs mb-1">App</p>
                        <p className="text-text-primary dark:text-dark-primary font-medium">{insight.app_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-text-muted dark:text-dark-muted text-xs mb-1">Generated</p>
                        <p className="text-text-primary dark:text-dark-primary font-medium">{formatDate(insight.generated_at)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted dark:text-dark-muted text-xs mb-1">Confidence</p>
                        <p className="text-text-primary dark:text-dark-primary font-medium">{insight.confidence_score ? `${(insight.confidence_score * 100).toFixed(0)}%` : 'N/A'}</p>
                      </div>
                    </div>
                    {insight.insight_details && (
                      <div className="bg-gray-50 dark:bg-[#2d2e30] rounded-lg p-3">
                        <p className="text-sm text-text-primary dark:text-dark-primary whitespace-pre-wrap">
                          {insight.insight_details}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex items-center text-xs text-text-muted dark:text-dark-muted">
                  <span className="material-symbols-outlined text-[14px] mr-1">schedule</span>
                  {formatDate(insight.generated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border-subtle dark:border-border-dark flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-dark-secondary">
              Showing page {currentPage} of {totalPages} ({totalCount} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-[#3c4043] disabled:opacity-50 disabled:cursor-not-allowed text-text-primary dark:text-dark-primary transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-[#3c4043] disabled:opacity-50 disabled:cursor-not-allowed text-text-primary dark:text-dark-primary transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
