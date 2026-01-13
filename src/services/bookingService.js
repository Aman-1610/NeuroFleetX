import apiClient from './apiClient';

export const bookingService = {
    getRecommendations: async (searchParams) => {
        return await apiClient.post('/bookings/recommend', searchParams);
    },

    createBooking: async (bookingData) => {
        return await apiClient.post('/bookings', bookingData);
    },

    getMyBookings: async () => {
        return await apiClient.get('/bookings/my');
    }
};
