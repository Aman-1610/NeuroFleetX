
// Simulated vehicle data
let vehicles = [
    {
        id: 1,
        name: 'Truck A-101',
        type: 'Truck',
        status: 'In Use', // Idle, In Use, Needs Service
        battery: 85, // or fuel level
        speed: 45, // km/h
        location: { lat: 28.6139, lng: 77.2090 }, // New Delhi example
        lastUpdate: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Van B-202',
        type: 'Van',
        status: 'Idle',
        battery: 92,
        speed: 0,
        location: { lat: 19.0760, lng: 72.8777 }, // Mumbai example
        lastUpdate: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Scooter C-303',
        type: 'Scooter',
        status: 'Needs Service',
        battery: 15,
        speed: 0,
        location: { lat: 12.9716, lng: 77.5946 }, // Bangalore example
        lastUpdate: new Date().toISOString()
    },
    {
        id: 4,
        name: 'Truck A-105',
        type: 'Truck',
        status: 'In Use',
        battery: 60,
        speed: 55,
        location: { lat: 13.0827, lng: 80.2707 }, // Chennai example
        lastUpdate: new Date().toISOString()
    }
];

// Helper to simulate movement
const jitter = (val) => val + (Math.random() - 0.5) * 0.001;
const fluctuate = (val, max) => Math.min(max, Math.max(0, val + (Math.random() - 0.5) * 5));

export const vehicleService = {
    getVehicles: async () => {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => resolve([...vehicles]), 500);
        });
    },

    addVehicle: async (vehicle) => {
        return new Promise((resolve) => {
            const newVehicle = {
                ...vehicle,
                id: vehicles.length + 1,
                battery: 100,
                speed: 0,
                location: { lat: 20.5937, lng: 78.9629 }, // Default India center
                lastUpdate: new Date().toISOString()
            };
            vehicles.push(newVehicle);
            setTimeout(() => resolve(newVehicle), 500);
        });
    },

    updateVehicle: async (id, data) => {
        return new Promise((resolve) => {
            vehicles = vehicles.map(v => v.id === id ? { ...v, ...data } : v);
            setTimeout(() => resolve(vehicles.find(v => v.id === id)), 300);
        });
    },

    deleteVehicle: async (id) => {
        return new Promise((resolve) => {
            vehicles = vehicles.filter(v => v.id !== id);
            setTimeout(() => resolve(true), 300);
        });
    },

    // Simulate telemetry changes
    simulateTelemetry: () => {
        vehicles = vehicles.map(v => {
            if (v.status === 'In Use') {
                return {
                    ...v,
                    speed: fluctuate(v.speed, 80),
                    battery: Math.max(0, v.battery - 0.1), // Drain battery
                    location: {
                        lat: jitter(v.location.lat),
                        lng: jitter(v.location.lng)
                    },
                    lastUpdate: new Date().toISOString()
                };
            } else if (v.status === 'Needs Service') {
                // Maybe drain battery slower if idle but broken?
                return v;
            }
            return v;
        });
        return [...vehicles];
    }
};
