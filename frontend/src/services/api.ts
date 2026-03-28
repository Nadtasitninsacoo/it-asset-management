import axios from 'axios';

// 🛡️ ระบบจะดึงพิกัดจาก Vercel Settings (VITE_API_URL) หรือใช้ localhost ถ้าตรวจไม่เจอ
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;