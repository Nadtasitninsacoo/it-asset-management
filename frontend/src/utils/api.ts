import axios from 'axios';

const PROD_URL = 'https://it-asset-management-ivory.vercel.app/api';

const baseURL = import.meta.env.MODE === 'production'
    ? PROD_URL
    : 'http://localhost:3000/api';

const api = axios.create({
    baseURL: baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;