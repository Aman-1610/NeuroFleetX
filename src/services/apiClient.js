import axios from 'axios';
import { getToken } from '../utils/authUtils';

const apiClient = axios.create({
    baseURL: 'http://localhost:8081/api', // Adjust as needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle token expiration
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Token invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            // 403 just means forbidden (e.g. role mismatch), do not logout
        }
        return Promise.reject(error);
    }
);

export default apiClient;
