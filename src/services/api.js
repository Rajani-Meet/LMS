import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my/courses'),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
};

// Assignments API
export const assignmentsAPI = {
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (assignmentData) => api.post('/assignments', assignmentData),
  submit: (id, submissionData) => api.post(`/assignments/${id}/submit`, submissionData),
  grade: (id, gradeData) => api.post(`/assignments/${id}/grade`, gradeData),
};

// Quizzes API
export const quizzesAPI = {
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (quizData) => api.post('/quizzes', quizData),
  startAttempt: (id) => api.post(`/quizzes/${id}/start`),
  submitAttempt: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
};

// Upload API
export const uploadAPI = {
  single: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  multiple: (files, type) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', type);
    return api.post('/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (filename, type) => api.delete(`/uploads/${filename}?type=${type}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getCourseAnalytics: (courseId) => api.get(`/analytics/course/${courseId}`),
  exportUsersCSV: () => api.get('/analytics/export/users/csv'),
  exportUsersExcel: () => api.get('/analytics/export/users/excel'),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
};

// Lectures API
export const lecturesAPI = {
  getByCourse: (courseId) => api.get(`/lectures/course/${courseId}`),
  getById: (id) => api.get(`/lectures/${id}`),
  create: (lectureData) => api.post('/lectures', lectureData),
  update: (id, lectureData) => api.put(`/lectures/${id}`, lectureData),
  delete: (id) => api.delete(`/lectures/${id}`),
};

// Submissions API
export const submissionsAPI = {
  getByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getMy: () => api.get('/submissions/my'),
  submit: (submissionData) => api.post('/submissions', submissionData),
  grade: (id, gradeData) => api.post(`/submissions/${id}/grade`, gradeData),
};

// Audit API
export const auditAPI = {
  getLogs: (params) => api.get('/audit', { params }),
};

// Moderation API
export const moderationAPI = {
  getReports: (params) => api.get('/moderation/reports', { params }),
  handleReport: (id, data) => api.post(`/moderation/reports/${id}/handle`, data),
  createReport: (data) => api.post('/moderation/reports', data),
};

// Enhanced Analytics API
export const enhancedAnalyticsAPI = {
  ...analyticsAPI,
  exportPDF: (params) => api.get('/analytics/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params) => api.get('/analytics/export/excel', { params, responseType: 'blob' }),
  getCourseProgress: (courseId) => api.get(`/analytics/course/${courseId}/progress`),
  getUserProgress: (userId) => api.get(`/analytics/user/${userId}/progress`),
};

// Update existing APIs to use enhanced versions
export const analyticsAPI = {
  getDashboardStats: (params) => api.get('/analytics/dashboard', { params }),
  getCourseAnalytics: (courseId) => api.get(`/analytics/course/${courseId}`),
  exportUsersCSV: () => api.get('/analytics/export/users/csv', { responseType: 'blob' }),
  exportUsersExcel: () => api.get('/analytics/export/users/excel', { responseType: 'blob' }),
  exportPDF: (params) => api.get('/analytics/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params) => api.get('/analytics/export/excel', { params, responseType: 'blob' }),
  getUserProgress: (userId) => api.get(`/analytics/user/${userId}/progress`),
};

// Update audit API
export const auditAPI = {
  getLogs: (params) => api.get('/audit', { params }),
  exportLogs: (params) => api.get('/audit/export', { params, responseType: 'blob' }),
};

// Update moderation API
export const moderationAPI = {
  getReports: (params) => api.get('/moderation/reports', { params }),
  handleReport: (id, data) => api.post(`/moderation/reports/${id}/handle`, data),
  createReport: (data) => api.post('/moderation/reports', data),
};

// Enhanced Auth API
export const enhancedAuthAPI = {
  ...authAPI,
  verifyPasswordToken: (token, email) => api.post('/auth/verify-token', { token, email }),
  setPassword: (data) => api.post('/auth/set-password', data),
  inviteUser: (data) => api.post('/auth/invite', data),
};

// AI API
export const aiAPI = {
  generateTranscript: (lectureId, audioFile) => {
    const formData = new FormData();
    if (audioFile) formData.append('audio', audioFile);
    return api.post(`/ai/transcript/${lectureId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  generateSummary: (lectureId) => api.post(`/ai/summary/${lectureId}`),
  chatWithAI: (lectureId, message, chatHistory) => api.post(`/ai/chat/${lectureId}`, { message, chatHistory }),
  searchTranscript: (lectureId, query) => api.post(`/ai/search/${lectureId}`, { query }),
  getTranscriptStatus: (lectureId) => api.get(`/ai/transcript/${lectureId}/status`),
};

export default api;