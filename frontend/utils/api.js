import axios from 'axios';

const BASE_URL = 'https://mitwpu-tc-demo.onrender.com/api';

const getToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// Applications
export const submitApplication = (data) =>
  api.post('/applications', data);

export const getMyApplications = () =>
  api.get('/applications/my');

export const getDepartmentApplications = () =>
  api.get('/applications/department');

// Approvals
export const actionApproval = (id, status, remarks) =>
  api.patch(`/approvals/${id}`, { status, remarks });