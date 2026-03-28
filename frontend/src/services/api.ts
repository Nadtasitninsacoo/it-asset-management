import axios from 'axios';

// 🛡️ ใช้ความระมัดระวังสูงสุด: ตรวจสอบว่าไม่มีช่องว่างในชื่อตัวแปร
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('📡 Current API BaseURL:', baseURL); // 🔍 เพิ่มบรรทัดนี้เพื่อเช็คพิกัดใน Console

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