import apiClient from './apiClient';

// Helper to simulate movement locally for smoother animation if needed
// Or we can just trust the DB. 
// For "connected with databases", we should update the DB.

// To avoid hammering the DB with 30 requests per second for simulation,
// we can update local state for animation and save to DB periodically,
// OR just fetch from DB if the backend was doing the simulation.
// Since the backend is just CRUD, the frontend must remain the source of "simulation" logic
// but persist it.

const jitter = (val) => val + (Math.random() - 0.5) * 0.001;
const fluctuate = (val, max) => Math.min(max, Math.max(0, val + (Math.random() - 0.5) * 5));

export const vehicleService = {
    // GET all vehicles from DB
    getVehicles: async () => {
        try {
            const response = await apiClient.get('/vehicles');
            return response.data;
        } catch (error) {
            console.error("Fetch vehicles failed", error);
            return [];
        }
    },

    // POST new vehicle to DB
    addVehicle: async (vehicle) => {
        try {
            // Ensure defaults for simulation
            const payload = {
                ...vehicle,
                battery: 100,
                speed: 0,
                latitude: 20.5937,
                longitude: 78.9629,
                // map 'location' object to flat lat/lng for backend if needed
                // but backend expects flat lat/lng. 
                // We will adjust format in frontend mostly.
            };
            const response = await apiClient.post('/vehicles', payload);
            return response.data;
        } catch (error) {
            console.error("Add vehicle failed", error);
            throw error;
        }
    },

    // PUT update vehicle in DB
    updateVehicle: async (id, data) => {
        try {
            const response = await apiClient.put(`/vehicles/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Update vehicle failed", error);
            throw error;
        }
    },

    // DELETE vehicle from DB
    deleteVehicle: async (id) => {
        try {
            await apiClient.delete(`/vehicles/${id}`);
            return true;
        } catch (error) {
            console.error("Delete vehicle failed", error);
            throw error;
        }
    },

    assignDriver: async (vehicleId, driverId) => {
        try {
            const response = await apiClient.post(`/vehicles/${vehicleId}/assign/${driverId}`);
            return response.data;
        } catch (error) {
            console.error("Assign driver failed", error);
            throw error;
        }
    },

    getMyVehicle: async () => {
        try {
            const response = await apiClient.get('/vehicles/my-vehicle');
            return response.data;
        } catch (error) {
            // It's okay if not found initially
            return null;
        }
    },

    // Simulation logic:
    // Since the backend doesn't have a physics engine, we calculate next state here.
    // OPTION 1: Just return calculated state for UI (Client-Side Simulation)
    // OPTION 2: Save calculated state to DB (Server-Side Persistence)
    // We will do Option 1 for smoothness, but occasionally save? 
    // User asked to "connect to database".
    // Let's make "simulateTelemetry" return valid objects compatible with the UI.
    // AND NOT SAVE every tick (too slow).
    // But we will use the local state.

    simulateTelemetry: (currentVehicles) => {
        return currentVehicles.map(v => {
            if (v.status === 'In Use') {
                const newSpeed = fluctuate(v.speed, 80);
                const newBattery = Math.max(0, v.battery - 0.1);
                const newLat = jitter(v.latitude || v.location?.lat || 20.5937);
                const newLng = jitter(v.longitude || v.location?.lng || 78.9629);

                return {
                    ...v,
                    speed: newSpeed,
                    battery: newBattery,
                    latitude: newLat,
                    longitude: newLng,
                    // Maintain compatibility with UI expecting nested location object if strictly needed
                    // But UI should probably adapt to flat lat/lng or we map it here.
                    location: { lat: newLat, lng: newLng }
                };
            }
            // Ensure idle vehicles also have location object
            return {
                ...v,
                location: {
                    lat: v.latitude || v.location?.lat || 20.5937,
                    lng: v.longitude || v.location?.lng || 78.9629
                }
            };
        });
    }
};
