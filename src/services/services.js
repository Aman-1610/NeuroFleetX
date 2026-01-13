import apiClient from './apiClient';

// Auth Services
export const authService = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => {
        return apiClient.post('/auth/register', userData);
    },
    logout: () => {
        // Client-side logout is handled by clearing tokens, 
        // but we can call backend if needed for blacklist/analytics
        return Promise.resolve();
    }
};

// Dashboard Services
export const dashboardService = {
    getAdminMetrics: () => apiClient.get('/dashboard/admin/metrics'),
    getFleetManagerMetrics: () => apiClient.get('/dashboard/fleet-manager/metrics'),
    getDriverMetrics: () => apiClient.get('/dashboard/driver/metrics'),
    getCustomerMetrics: () => apiClient.get('/dashboard/customer/metrics'),
    getAdminUsers: () => apiClient.get('/dashboard/admin/users'),
    getAdminBookings: () => apiClient.get('/dashboard/admin/bookings')
};

export const userService = {
    updateProfile: (data) => apiClient.put('/users/profile', data),
    getProfile: () => apiClient.get('/users/me'),
    getDrivers: () => apiClient.get('/users/drivers')
};

export const alertService = {
    getAllAlerts: () => apiClient.get('/alerts'),
    getVehicleAlerts: (vehicleId) => apiClient.get(`/alerts/vehicle/${vehicleId}`)
};

// Legacy exports for compatibility if needed (can be removed if all refs updated)
export const loginUser = authService.login;
export const registerUser = authService.register;
