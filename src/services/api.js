import axios from 'axios';

// Configure your FastAPI backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
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
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
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
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/login', {
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
    const response = await api.post('/api/auth/refresh', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      clearTokens();
    }
  },

  changePassword: async (data) => {
    const response = await api.post('/api/auth/change-password', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/domains');
    return response.data;
  },

  // Domains
  getDomain: async () => {
    const response = await api.get('/api/domains');
    return response.data;
  },

  updateDomain: async (data) => {
    const response = await api.put('/api/domains', data);
    return response.data;
  },

  deleteDomain: async () => {
    const response = await api.delete('/api/domains');
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await api.post('/api/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  importUsers: async (users) => {
    const response = await api.post('/api/users/import', { users });
    return response.data;
  },

  assignUser: async (userId, data) => {
    const response = await api.post(`/api/users/${userId}/assign`, data);
    return response.data;
  },

  // Departments
  getDepartments: async (params = {}) => {
    const response = await api.get('/api/departments', { params });
    return response.data;
  },

  getDepartment: async (id) => {
    const response = await api.get(`/api/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post('/api/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/api/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/api/departments/${id}`);
    return response.data;
  },

  // Teams
  getTeams: async (params = {}) => {
    const response = await api.get('/api/teams', { params });
    return response.data;
  },

  getTeam: async (id) => {
    const response = await api.get(`/api/teams/${id}`);
    return response.data;
  },

  createTeam: async (data) => {
    const response = await api.post('/api/teams', data);
    return response.data;
  },

  updateTeam: async (id, data) => {
    const response = await api.put(`/api/teams/${id}`, data);
    return response.data;
  },

  deleteTeam: async (id) => {
    const response = await api.delete(`/api/teams/${id}`);
    return response.data;
  },

  // Insights
  getInsights: async (params = {}) => {
    const response = await api.get('/api/insights', { params });
    return response.data;
  },

  getInsight: async (id) => {
    const response = await api.get(`/api/insights/${id}`);
    return response.data;
  },

  getInsightsAggregations: async (params = {}) => {
    const response = await api.get('/api/insights/aggregations', { params });
    return response.data;
  },

  getInsightsByUser: async (userId, params = {}) => {
    const response = await api.get(`/api/insights/users/${userId}`, { params });
    return response.data;
  },

  getInsightsByDepartment: async (deptId, params = {}) => {
    const response = await api.get(`/api/insights/departments/${deptId}`, { params });
    return response.data;
  },

  getInsightsByTeam: async (teamId, params = {}) => {
    const response = await api.get(`/api/insights/teams/${teamId}`, { params });
    return response.data;
  },

  // Logs
  getLogs: async (params = {}) => {
    const response = await api.get('/api/logs', { params });
    return response.data;
  },

  getLog: async (id) => {
    const response = await api.get(`/api/logs/${id}`);
    return response.data;
  },

  getLogsByUser: async (userId, params = {}) => {
    const response = await api.get(`/api/logs/users/${userId}`, { params });
    return response.data;
  },

  getLogsByDepartment: async (deptId, params = {}) => {
    const response = await api.get(`/api/logs/departments/${deptId}`, { params });
    return response.data;
  },

  getLogsByTeam: async (teamId, params = {}) => {
    const response = await api.get(`/api/logs/teams/${teamId}`, { params });
    return response.data;
  },

  // Dashboard - backward compatibility
  getDashboardStats: async () => {
    const response = await api.get('/api/insights/aggregations');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/api/logs', { 
      params: { page: 1, size: 10, sort_by: 'timestamp', order: 'desc' }
    });
    return response.data;
  },

  // Settings - backward compatibility
  getSettings: async () => {
    const response = await api.get('/api/domains');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/api/domains', data);
    return response.data;
  },
};

export default api;
