import axios from 'axios';

// Configure your FastAPI backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok browser warning
  },
});

// Token management helpers
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('authToken'); // Legacy cleanup
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/app/auth/refresh`, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);
        
        processQueue(null, access_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  register: async (data) => {
    const response = await api.post('/api/app/auth/register', data);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/app/auth/login', {
      username: credentials.email || credentials.username,
      password: credentials.password,
      grant_type: 'password'
    });
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post('/api/app/auth/refresh', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/app/auth/logout');
    } finally {
      clearTokens();
    }
  },

  changePassword: async (data) => {
    const response = await api.post('/api/app/auth/change-password', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/app/domains');
    return response.data;
  },

  // Domains
  getDomain: async () => {
    const response = await api.get('/api/app/domains');
    return response.data;
  },

  updateDomain: async (data) => {
    const response = await api.put('/api/app/domains', data);
    return response.data;
  },

  deleteDomain: async () => {
    const response = await api.delete('/api/app/domains');
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/api/app/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/api/app/users/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await api.post('/api/app/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/api/app/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/app/users/${id}`);
    return response.data;
  },

  importUsers: async (users) => {
    const response = await api.post('/api/app/users/import', { users });
    return response.data;
  },

  assignUser: async (userId, data) => {
    const response = await api.post(`/api/app/users/${userId}/assign`, data);
    return response.data;
  },

  // Departments
  getDepartments: async (params = {}) => {
    const response = await api.get('/api/app/departments', { params });
    return response.data;
  },

  getDepartment: async (id) => {
    const response = await api.get(`/api/app/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post('/api/app/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/api/app/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/api/app/departments/${id}`);
    return response.data;
  },

  // Teams
  getTeams: async (params = {}) => {
    const response = await api.get('/api/app/teams', { params });
    return response.data;
  },

  getTeam: async (id) => {
    const response = await api.get(`/api/app/teams/${id}`);
    return response.data;
  },

  createTeam: async (data) => {
    const response = await api.post('/api/app/teams', data);
    return response.data;
  },

  updateTeam: async (id, data) => {
    const response = await api.put(`/api/app/teams/${id}`, data);
    return response.data;
  },

  deleteTeam: async (id) => {
    const response = await api.delete(`/api/app/teams/${id}`);
    return response.data;
  },

  // Insights
  getInsights: async (params = {}) => {
    const response = await api.get('/api/ai/user-insights', { params });
    return response.data;
  },
  getInsight: async (id) => {
    const response = await api.get(`/api/ai/user-insights/${id}`);
    return response.data;
  },
  getInsightsCount: async (params = {}) => {
    const response = await api.get('/api/ai/user-insights/count', { params });
    return response.data;
  },
  getInsightsAggregations: async (params = {}) => {
    // NOTE: Insights endpoint not available in ambient-backend
    return { total_users: 0, active_users: 0, departments: 0, teams: 0 };
  },

  getInsightsByUser: async (userId, params = {}) => {
    // NOTE: Insights endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },

  getInsightsByDepartment: async (deptId, params = {}) => {
    // NOTE: Insights endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },

  getInsightsByTeam: async (teamId, params = {}) => {
    // NOTE: Insights endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },

  // Logs
  getLogs: async (params = {}) => {
    // NOTE: Logs endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },
  
  // Google Reports - Activities
  getActivities: async (params) => {
    const response = await api.get('/api/google/reports/activities', { params });
    return response.data;
  },

  getLogsByUser: async (userId, params = {}) => {
    // NOTE: Logs endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },

  getLogsByDepartment: async (deptId, params = {}) => {
    // NOTE: Logs endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },

  getLogsByTeam: async (teamId, params = {}) => {
    // NOTE: Logs endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },

  // Dashboard - backward compatibility
  getDashboardStats: async () => {
    try {
      // Fetch real counts from backend
      const [usersCount, departmentsCount, teamsCount] = await Promise.all([
        api.get('/api/app/users/count'),
        api.get('/api/app/departments/count'),
        api.get('/api/app/teams/count'),
      ]);

      return {
        total_users: usersCount.data?.result || 0,
        active_users: usersCount.data?.result || 0, // Backend doesn't distinguish, use same
        departments: departmentsCount.data?.result || 0,
        teams: teamsCount.data?.result || 0,
        suspended_users: 0, // Not available in backend
        managed_devices: 0, // Not available in backend
        pending_updates: 0, // Not available in backend
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return zeros on error
      return { total_users: 0, active_users: 0, departments: 0, teams: 0, suspended_users: 0, managed_devices: 0, pending_updates: 0 };
    }
  },

  getRecentActivities: async () => {
    // NOTE: Logs endpoint not available in ambient-backend
    return { items: [], total: 0 };
  },

  // Settings - backward compatibility
  getSettings: async () => {
    const response = await api.get('/api/app/domains');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/api/app/domains', data);
    return response.data;
  },
};

export default api;
