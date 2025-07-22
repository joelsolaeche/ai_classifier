import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API Service
export const apiService = {
  // Authentication
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async register(userData: { email: string; name?: string; password: string }) {
    const response = await api.post('/user/', userData);
    return response.data;
  },

  // Image prediction
  async predict(imageFile: File) {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await api.post('/model/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Feedback
  async sendFeedback(feedbackData: {
    prediction: string;
    score: number;
    image_file_name: string;
    feedback: string;
  }) {
    const response = await api.post('/feedback/', feedbackData);
    return response.data;
  },
};

export default apiService; 