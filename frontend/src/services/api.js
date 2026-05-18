import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Request to ${config.url} with token: ${token.substring(0, 20)}...`);
    } else {
      console.log(`⚠️ Request to ${config.url} WITHOUT token`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if it's a 401 and NOT the login endpoint
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  getManagers: () => api.get('/api/auth/managers'),
};

// Goal APIs
export const goalAPI = {
  getMyGoals: () => api.get('/api/goals/my-goals'),
  getGoal: (id) => api.get(`/api/goals/${id}`),
  createGoal: (data) => api.post('/api/goals', data),
  updateGoal: (id, data) => api.put(`/api/goals/${id}`, data),
  submitGoal: (id) => api.post(`/api/goals/${id}/submit`),
  deleteGoal: (id) => api.delete(`/api/goals/${id}`),
  checkValidation: () => api.get('/api/goals/validation/check'),
};

// Manager APIs
export const managerAPI = {
  getPendingApprovals: () => api.get('/api/manager/pending-approvals'),
  getTeamGoals: () => api.get('/api/manager/team-goals'),
  inlineEdit: (id, data) => api.put(`/api/manager/goals/${id}/inline-edit`, data),
  approveGoal: (id) => api.post(`/api/manager/goals/${id}/approve`),
  rejectGoal: (id, reason) => api.post(`/api/manager/goals/${id}/reject`, null, { params: { rejection_reason: reason } }),
  approveAll: (employeeId) => api.post(`/api/manager/approve-all/${employeeId}`),
};

// Admin APIs
export const adminAPI = {
  getAllGoals: () => api.get('/api/admin/all-goals'),
  unlockGoal: (id) => api.post(`/api/admin/goals/${id}/unlock`),
  approveGoal: (id) => api.post(`/api/admin/goals/${id}/approve`),
  createSharedGoal: (data) => api.post('/api/admin/shared-goals', data),
  getAllUsers: () => api.get('/api/admin/users'),
  getStats: () => api.get('/api/admin/stats'),
  // Escalation Module
  getEscalationStatus: (quarter) => api.get('/api/admin/escalation/status', { params: { quarter } }),
  sendEscalationReminders: (quarter) => api.post('/api/admin/escalation/send-reminders', null, { params: { quarter } }),
};

// Check-in APIs
export const checkinAPI = {
  getMyCheckins: (quarter) => api.get('/api/checkins/my-checkins', { params: { quarter } }),
  getCheckin: (id) => api.get(`/api/checkins/${id}`),
  createCheckin: (data) => api.post('/api/checkins', data),
  updateCheckin: (id, data) => api.put(`/api/checkins/${id}`, data),
  getTeamCheckins: (quarter) => api.get('/api/checkins/manager/team-checkins', { params: { quarter } }),
};

// Report APIs
export const reportAPI = {
  getAchievementReport: (quarter) => api.get('/api/reports/achievement-report', { params: { quarter } }),
  exportAchievementReport: (quarter) => api.get('/api/reports/achievement-report/export', { 
    params: { quarter },
    responseType: 'blob'
  }),
  getCompletionDashboard: (quarter) => api.get('/api/reports/completion-dashboard', { params: { quarter } }),
  getAuditLogs: (params) => api.get('/api/reports/audit-logs', { params }),
  getGoalDistribution: () => api.get('/api/reports/analytics/goal-distribution'),
  getStatusOverview: () => api.get('/api/reports/analytics/status-overview'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (unreadOnly = false) => api.get('/api/notifications', { params: { unread_only: unreadOnly } }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/mark-all-read'),
};

// AI APIs
export const aiAPI = {
  suggestGoals: (data) => api.post('/api/ai/suggest-goals', null, { params: data }),
  improveDescription: (data) => api.post('/api/ai/improve-description', null, { params: data }),
};

// Template APIs
export const templateAPI = {
  getTemplates: (params) => api.get('/api/templates', { params }),
};

// Thrust Area APIs
export const thrustAreaAPI = {
  getThrustAreas: () => api.get('/api/thrust-areas/'),
};

export default api;
