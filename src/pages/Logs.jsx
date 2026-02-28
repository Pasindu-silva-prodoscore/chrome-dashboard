import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Logs = () => {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [expandedFilter, setExpandedFilter] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(100);
  
  // Filter state
  const [filters, setFilters] = useState({
    applicationNames: [],
    eventNames: [],
    userEmails: []
  });
  
  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Load activities when filters or page changes
  useEffect(() => {
    loadActivities();
  }, [currentPage, filters]);
  
  const loadUsers = async () => {
    try {
      const data = await apiService.getUsers();
      if (data?.result) {
        setUsers(data.result || []);
      } else if (data?.users) {
        setUsers(data.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };
  
  const loadActivities = async () => {
    try {
      // Show appropriate loading state
      if (activities.length > 0) {
        setDataLoading(true);  // Subsequent loads - only results area
      } else {
        setInitialLoading(true);  // First load - full page
      }
      
      // Build query parameters
      const params = {
        limit: perPage,
        offset: (currentPage - 1) * perPage
      };
      
      // Add filters if selected
      if (filters.applicationNames.length > 0) {
        params.application_name = filters.applicationNames[0];
      }
      if (filters.eventNames.length > 0) {
        params.name = filters.eventNames[0];
      }
      if (filters.userEmails.length > 0) {
        params.user_key = filters.userEmails[0];
      }
      
      const data = await apiService.getActivities(params);
      
      if (data?.result) {
        setActivities(data.result || []);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setInitialLoading(false);
      setDataLoading(false);
    }
  };
  
  const toggleApplicationName = (name) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      applicationNames: prev.applicationNames.includes(name)
        ? prev.applicationNames.filter(n => n !== name)
        : [...prev.applicationNames, name]
    }));
  };
  
  const toggleEventName = (name) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      eventNames: prev.eventNames.includes(name)
        ? prev.eventNames.filter(n => n !== name)
        : [...prev.eventNames, name]
    }));
  };
  
  const toggleUserEmail = (email) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      userEmails: prev.userEmails.includes(email)
        ? prev.userEmails.filter(e => e !== email)
        : [...prev.userEmails, email]
    }));
  };
  
  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({
      applicationNames: [],
      eventNames: [],
      userEmails: []
    });
  };
  
  const getUniqueApplicationNames = () => {
    if (!activities || activities.length === 0) return [];
    return [...new Set(activities.map(a => a.id?.applicationName).filter(Boolean))];
  };
  
  const getUniqueEventNames = () => {
    if (!activities || activities.length === 0) return [];
    return [...new Set(activities.map(a => a.events?.[0]?.name).filter(Boolean))];
  };
  
  const getUniqueUserEmails = () => {
    // Combine users from API and activities
    const emailsFromActivities = activities.map(a => a.actor?.email).filter(Boolean);
    const uniqueEmails = [...new Set(emailsFromActivities)];
    
    // If we have users from API, use those; otherwise create objects from activity emails
    if (users.length > 0) {
      return users;
    } else {
      return uniqueEmails.map(email => ({ email, name: email }));
    }
  };
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
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
        <h2 className="text-[28px] font-bold text-text-primary mb-1">Activity Logs</h2>
        <p className="text-text-secondary text-sm">Monitor Google Workspace activities.</p>
      </div>
      
      {/* Filters Section - Independent Dropdowns */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        
        {/* Application Name Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'app' ? null : 'app')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">Application</span>
            {filters.applicationNames.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {filters.applicationNames.length}
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'app' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'app' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
              {getUniqueApplicationNames().length > 0 ? (
                getUniqueApplicationNames().map(name => (
                  <label key={name} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.applicationNames.includes(name)}
                      onChange={() => toggleApplicationName(name)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-text-secondary dark:text-dark-secondary">
                      {name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-text-muted dark:text-dark-muted">No applications available</p>
              )}
            </div>
          )}
        </div>

        {/* Event Name Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'event' ? null : 'event')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">Event Type</span>
            {filters.eventNames.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {filters.eventNames.length}
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'event' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'event' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
              {getUniqueEventNames().length > 0 ? (
                getUniqueEventNames().map(name => (
                  <label key={name} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.eventNames.includes(name)}
                      onChange={() => toggleEventName(name)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-text-secondary dark:text-dark-secondary">
                      {name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-text-muted dark:text-dark-muted">No event types available</p>
              )}
            </div>
          )}
        </div>

        {/* User Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === 'user' ? null : 'user')}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-text-primary dark:text-dark-primary">User</span>
            {filters.userEmails.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {filters.userEmails.length}
              </span>
            )}
            <span className={`material-symbols-outlined text-[18px] text-text-secondary dark:text-dark-secondary transition-transform ${expandedFilter === 'user' ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {expandedFilter === 'user' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
              {getUniqueUserEmails().length > 0 ? (
                getUniqueUserEmails().map(user => (
                  <label key={user.email} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.userEmails.includes(user.email)}
                      onChange={() => toggleUserEmail(user.email)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-text-secondary dark:text-dark-secondary truncate">
                      {user.name || user.email}
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-text-muted dark:text-dark-muted">No users available</p>
              )}
            </div>
          )}
        </div>

        {/* Clear All Button - Only show when filters are active */}
        {(filters.applicationNames.length > 0 || filters.eventNames.length > 0 || filters.userEmails.length > 0) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-white dark:bg-surface-dark border border-error/30 text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              filter_list_off
            </span>
            <span className="text-sm font-medium">Clear All</span>
            <span className="px-1.5 py-0.5 bg-error/10 text-error text-xs font-medium rounded-full">
              {filters.applicationNames.length + filters.eventNames.length + filters.userEmails.length}
            </span>
          </button>
        )}
        
      </div>
      
      {/* Activities List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[20px] font-semibold text-text-primary dark:text-dark-primary">Activity Events</h3>
          <p className="text-sm text-text-muted dark:text-dark-muted">
            Showing {activities.length} activities
          </p>
        </div>
        
        {/* Loading State for Subsequent Data Loads */}
        {dataLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Activities List with Reduced Opacity During Loading */}
        <div className={`transition-opacity ${dataLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {activities.length === 0 ? (
            <div className="bg-surface-light dark:bg-slate-900 rounded-card border border-border-light dark:border-slate-800 p-12 text-center">
              <span className="material-symbols-outlined text-text-secondary dark:text-dark-secondary text-5xl mb-4">search_off</span>
              <p className="text-text-primary dark:text-dark-primary text-lg mb-2">No activities found</p>
              <p className="text-text-secondary dark:text-dark-secondary text-sm">
                {(filters.applicationNames.length > 0 || filters.eventNames.length > 0 || filters.userEmails.length > 0)
                  ? 'Try adjusting your filters to see more results'
                  : 'No activities have been recorded yet'}
              </p>
            </div>
          ) : (
            <div className="bg-surface-light dark:bg-slate-900 rounded-card border border-border-light dark:border-slate-800 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-100 dark:bg-slate-800 border-b border-border-subtle dark:border-slate-700 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    {/* Event Type Header */}
                    <div className="flex-shrink-0 w-40">
                      <span className="text-xs font-semibold text-text-primary dark:text-dark-primary uppercase tracking-wider">
                        Event Type
                      </span>
                    </div>
                    
                    {/* Event Name Header */}
                    <div className="flex-1 min-w-0 max-w-xs">
                      <span className="text-xs font-semibold text-text-primary dark:text-dark-primary uppercase tracking-wider">
                        Event Name
                      </span>
                    </div>
                    
                    {/* User Header */}
                    <div className="flex-shrink-0 w-52">
                      <span className="text-xs font-semibold text-text-primary dark:text-dark-primary uppercase tracking-wider">
                        User
                      </span>
                    </div>
                    
                    {/* App Header */}
                    <div className="flex-shrink-0 w-36">
                      <span className="text-xs font-semibold text-text-primary dark:text-dark-primary uppercase tracking-wider">
                        Application
                      </span>
                    </div>
                    
                    {/* DateTime Header */}
                    <div className="flex-shrink-0 w-44">
                      <span className="text-xs font-semibold text-text-primary dark:text-dark-primary uppercase tracking-wider">
                        Date & Time
                      </span>
                    </div>
                  </div>
                  
                  {/* Expand Icon Placeholder */}
                  <div className="flex-shrink-0 w-5">
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-border-subtle dark:divide-slate-800">
                {activities.map((activity, index) => {
                  const event = activity.events?.[0];
                  const appName = activity.id?.applicationName || 'Unknown';
                  const eventType = event?.type || activity.id?.type || 'Unknown Type';
                  const eventName = event?.name || activity.id?.name || 'Unknown Event';
                  const actorEmail = activity.actor?.email || 'Unknown User';
                  const timestamp = activity.id?.time;
                  const activityId = activity.id?.uniqueQualifier || index;
                  const isExpanded = expandedActivity === activityId;
                  
                  return (
                    <div key={activityId} className="border-b border-border-subtle dark:border-slate-800 last:border-b-0">
                      {/* Collapsed View */}
                      <div 
                        onClick={() => setExpandedActivity(isExpanded ? null : activityId)}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            {/* Event Type */}
                            <div className="flex-shrink-0 w-40">
                              <span className="text-xs font-medium text-text-muted dark:text-dark-muted uppercase tracking-wide break-words">
                                {eventType}
                              </span>
                            </div>
                            
                            {/* Event Name */}
                            <div className="flex-1 min-w-0 max-w-xs">
                              <span className="text-sm font-medium text-text-primary dark:text-dark-primary truncate block">
                                {eventName}
                              </span>
                            </div>
                            
                            {/* User */}
                            <div className="flex-shrink-0 w-52">
                              <span className="text-sm text-text-secondary dark:text-dark-secondary truncate block">
                                {actorEmail}
                              </span>
                            </div>
                            
                            {/* App */}
                            <div className="flex-shrink-0 w-36">
                              <span className="text-sm text-text-secondary dark:text-dark-secondary capitalize truncate block">
                                {appName}
                              </span>
                            </div>
                            
                            {/* DateTime */}
                            <div className="flex-shrink-0 w-44">
                              <span className="text-sm text-text-muted dark:text-dark-muted">
                                {formatTimestamp(timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Expand Icon */}
                          <div className="flex-shrink-0">
                            <span className={`material-symbols-outlined text-[20px] text-text-secondary dark:text-dark-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded View - Full Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 bg-slate-50/50 dark:bg-slate-800/20">
                          <div className="space-y-3 text-sm">
                            {/* Actor Details */}
                            <div>
                              <span className="font-semibold text-text-primary dark:text-dark-primary">Actor:</span>
                              <div className="ml-4 mt-1 space-y-1">
                                <div><span className="text-text-muted dark:text-dark-muted">Email:</span> <span className="text-text-secondary dark:text-dark-secondary">{activity.actor?.email || 'N/A'}</span></div>
                                <div><span className="text-text-muted dark:text-dark-muted">Profile ID:</span> <span className="text-text-secondary dark:text-dark-secondary">{activity.actor?.profileId || 'N/A'}</span></div>
                              </div>
                            </div>
                            
                            {/* Event Details */}
                            <div>
                              <span className="font-semibold text-text-primary dark:text-dark-primary">Event Details:</span>
                              <div className="ml-4 mt-1 space-y-1">
                                <div><span className="text-text-muted dark:text-dark-muted">Application:</span> <span className="text-text-secondary dark:text-dark-secondary">{activity.id?.applicationName || 'N/A'}</span></div>
                                <div><span className="text-text-muted dark:text-dark-muted">Time:</span> <span className="text-text-secondary dark:text-dark-secondary">{formatTimestamp(activity.id?.time)}</span></div>
                                <div><span className="text-text-muted dark:text-dark-muted">Unique ID:</span> <span className="text-text-secondary dark:text-dark-secondary font-mono text-xs">{activity.id?.uniqueQualifier || 'N/A'}</span></div>
                              </div>
                            </div>
                            
                            {/* Event Parameters */}
                            {event?.parameters && event.parameters.length > 0 && (
                              <div>
                                <span className="font-semibold text-text-primary dark:text-dark-primary">Parameters:</span>
                                <div className="ml-4 mt-1 space-y-1">
                                  {event.parameters.map((param, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <span className="text-text-muted dark:text-dark-muted font-medium">{param.name}:</span>
                                      <span className="text-text-secondary dark:text-dark-secondary">
                                        {param.value || param.multiValue?.join(', ') || param.boolValue?.toString() || param.intValue?.toString() || 'N/A'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Raw JSON */}
                            <div>
                              <span className="font-semibold text-text-primary dark:text-dark-primary">Raw Data:</span>
                              <pre className="ml-4 mt-1 p-3 bg-slate-100 dark:bg-slate-900 rounded text-xs overflow-x-auto text-text-secondary dark:text-dark-secondary">
                                {JSON.stringify(activity, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-text-primary dark:text-dark-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">chevron_left</span>
          <span className="text-sm font-medium">Previous</span>
        </button>
        
        <span className="text-sm text-text-secondary dark:text-dark-secondary">
          Page {currentPage}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={activities.length < perPage}
          className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-text-primary dark:text-dark-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span className="text-sm font-medium">Next</span>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default Logs;
