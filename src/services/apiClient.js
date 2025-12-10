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
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
