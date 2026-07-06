import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// --- Auth API ---
export const authApi = {
  sendCode: (phone: string) => api.post('/auth/send-code', { phone }),
  login: (phone: string, code: string) => api.post('/auth/login', { phone, code }),
  me: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  },
}

// --- Exam API ---
export const examApi = {
  upload: (file: File, subject?: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('subject', subject || '通用')
    return api.post('/exams/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: () => api.get('/exams'),
  detail: (id: string) => api.get(`/exams/${id}`),
}

// --- Wrong Questions API ---
export const wrongQApi = {
  list: () => api.get('/wrong-questions'),
  detail: (id: string) => api.get(`/wrong-questions/${id}`),
  redo: (id: string, answer: string) =>
    api.post(`/wrong-questions/${id}/redo`, { answer }),
  stats: () => api.get('/wrong-questions/stats'),
}

// --- Knowledge Base API ---
export const knowledgeApi = {
  graph: () => api.get('/knowledge/graph'),
  pointDetail: (id: string) => api.get(`/knowledge/points/${id}`),
  search: (keyword: string) => api.get('/knowledge/search', { params: { q: keyword } }),
}

// --- Admin API ---
export const adminApi = {
  stats: () => api.get('/auth/admin/stats'),
}

export default api
