import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import Navbar from '../../components/Navbar';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Truck, Navigation, Activity, MapPin } from 'lucide-react';
import '../../styles/module3.css';
import '../../styles/dashboard.css';
import apiClient from '../../services/apiClient';

// Markers configuration
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons Generator
const getVehicleIcon = (type) => {
    let url = 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png'; // Default Car

    if (type) {
        const t = type.toLowerCase();
        if (t.includes('bike') || t.includes('scooter')) url = 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png';
        else if (t.includes('auto') || t.includes('rickshaw')) url = 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png';
        else if (t.includes('truck')) url = 'https://cdn-icons-png.flaticon.com/512/2554/2554936.png';
    }

    return new L.Icon({
        iconUrl: url,
        iconSize: [48, 48], // Slightly larger for visibility
        iconAnchor: [24, 24],
        popupAnchor: [0, -24],
        className: 'vehicle-marker-icon'
    });
};

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LiveTrackingPage = () => {
    const [bookings, setBookings] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulatedPositions, setSimulatedPositions] = useState({});

    const handleCancel = async (id) => {
        if (window.confirm("Are you sure you want to cancel this ride?")) {
            try {
                await apiClient.delete(`/bookings/${id}/cancel`);
                setBookings(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                console.error("Failed to cancel", error);
                alert("Failed to cancel booking");
            }
        }
    };

    const handleSimulate = (booking) => {
        if (!booking.routeGeometry || booking.routeGeometry.length < 2) {
            alert("Waiting for route data...");
            return;
        }

        // Combine paths: Current/PickupGeo -> RouteGeo
        // Visual path: Vehicle -> Pickup -> Drop
        let fullPath = [];
        if (booking.pickupGeometry) {
            fullPath = [...booking.pickupGeometry];
        } else {
            // Fallback if no pickup geo, start at pickup (not ideal but works)
            fullPath = [[booking.startLat, booking.startLng]];
        }
        // Connect end of pickup to start of route
        fullPath = [...fullPath, ...booking.routeGeometry];

        let index = 0;
        // speed: adjust duration (ms) between frames. Lower is faster.
        const FRAME_DELAY_MS = 100; // 100ms per point = smooth slow movement

        const animate = () => {
            if (index >= fullPath.length) {
                // Completed
                apiClient.put(`/bookings/${booking.id}/complete`)
                    .then(() => {
                        alert("Ride Completed!");
                        fetchBookings();
                        setSimulatedPositions(prev => {
                            const next = { ...prev };
                            delete next[booking.id];
                            return next;
                        });
                    })
                    .catch(e => {
                        console.error("Complete ride failed", e);
                        alert("Failed to complete ride: " + (e.response?.status || e.message));
                    });
                return;
            }

            setSimulatedPositions(prev => ({
                ...prev,
                [booking.id]: fullPath[index]
            }));

            // Move 1 point at a time for smoothness
            index += 1;

            // Use setTimeout to control speed, instead of requestAnimationFrame loop directly
            setTimeout(() => {
                requestAnimationFrame(animate);
            }, FRAME_DELAY_MS);
        };
        requestAnimationFrame(animate);
    };

    const fetchBookings = async () => {
        try {
            const response = await apiClient.get('/bookings/my');
            const active = response.data.filter(b => b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "IN_PROGRESS");

            const enrichedBookings = await Promise.all(active.map(async (b) => {
                const existing = bookings.find(ex => ex.id === b.id);

                // --- 1. Main Route (Pickup -> Drop) ---
                let routeGeo = existing?.routeGeometry;
                if (!routeGeo && b.startLat && b.startLng && b.dropLat && b.dropLng) {
                    try {
                        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${b.startLng},${b.startLat};${b.dropLng},${b.dropLat}?overview=full&geometries=geojson&alternatives=true`;
                        const res = await fetch(osrmUrl);
                        const data = await res.json();
                        if (data.routes && data.routes.length > 0) {
                            const shortest = data.routes.sort((a, b) => a.distance - b.distance)[0];
                            routeGeo = shortest.geometry.coordinates.map(c => [c[1], c[0]]);
                        } else { throw new Error("No route"); }
                    } catch (err) {
                        console.warn("Route routing failed, using straight line", err);
                        routeGeo = [[b.startLat, b.startLng], [b.dropLat, b.dropLng]];
                    }
                }

                // --- 2. Approach Route (Vehicle -> Pickup) ---
                // Only fetch if missing to avoid OSRM bans. 
                let pickupGeo = existing?.pickupGeometry;

                if (!pickupGeo && b.vehicle && b.startLat) {
                    try {
                        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${b.vehicle.longitude},${b.vehicle.latitude};${b.startLng},${b.startLat}?overview=full&geometries=geojson&alternatives=true`;
                        const res = await fetch(osrmUrl);
                        const data = await res.json();
                        if (data.routes && data.routes.length > 0) {
                            const shortest = data.routes.sort((a, b) => a.distance - b.distance)[0];
                            pickupGeo = shortest.geometry.coordinates.map(c => [c[1], c[0]]);
                        } else { throw new Error("No route"); }
                    } catch (err) {
                        console.warn("Pickup routing failed, using straight line", err);
                        pickupGeo = [[b.vehicle.latitude, b.vehicle.longitude], [b.startLat, b.startLng]];
                    }
                }

                return { ...b, routeGeometry: routeGeo, pickupGeometry: pickupGeo };
            }));

            setBookings(enrichedBookings);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    };

    useEffect(() => {
        fetchBookings();
        const fetchFleet = async () => {
            try {
                const res = await apiClient.get('/vehicles');
                setAllVehicles(res.data);
            } catch (e) {
                console.error("Failed to fetch fleet", e);
            }
        };
        fetchFleet();

        const interval = setInterval(() => {
            fetchBookings();
            fetchFleet();
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="module3-title" style={{ fontSize: '2rem' }}>
                        <Navigation className="text-accent" /> Live Shipment Tracking
                    </h1>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span className="route-tag tag-eco" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Activity size={14} /> {bookings.length} Active Shipments
                        </span>
                    </div>
                </div>

                <div className="module3-container">
                    {/* Shipment List */}
                    <div className="task-list custom-scrollbar" style={{ maxHeight: '600px' }}>
                        {bookings.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No active shipments found.</div>
                        )}
                        {bookings.map(b => (
                            <div key={b.id} className="module3-card" style={{ padding: '1rem', marginBottom: '0', borderLeft: '3px solid var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{b.vehicle?.name || "Unassigned"}</h3>
                                    <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>
                                        {b.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '5px', marginBottom: '4px' }}>
                                        <MapPin size={14} color="green" /> <span>Pickup: {b.startLocation}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <MapPin size={14} color="red" /> <span>Drop: {b.dropLocation}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleCancel(b.id)}
                                            style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSimulate(b)}
                                            style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            Simulate
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                        {b.vehicle?.speed?.toFixed(0) || 0} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>km/h</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Map */}
                    <div style={{ height: '600px', gridColumn: 'span 2', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
                        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />

                            {/* Render Active Shipments (Vehicle + Routes) */}
                            {bookings.map(b => {
                                let vehiclePos = [b.vehicle?.latitude || 22.7196, b.vehicle?.longitude || 75.8577];
                                if (simulatedPositions[b.id]) {
                                    vehiclePos = simulatedPositions[b.id];
                                }
                                const startPos = b.startLat && b.startLng ? [b.startLat, b.startLng] : null;
                                const dropPos = b.dropLat && b.dropLng ? [b.dropLat, b.dropLng] : null;

                                return (
                                    <React.Fragment key={b.id}>
                                        <Marker position={vehiclePos} icon={getVehicleIcon(b.vehicle?.type)}>
                                            <Tooltip permanent direction="bottom" offset={[0, 10]} className="vehicle-name-tooltip">
                                                {/* Use vehicle name + User for demo context */}
                                                <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                                    {b.vehicle?.name}<br />
                                                    <span style={{ color: '#666' }}>({b.user?.firstName || "Customer"})</span>
                                                </div>
                                            </Tooltip>
                                            <Popup>
                                                <strong>{b.vehicle?.name}</strong><br />
                                                Type: {b.vehicle?.type}<br />
                                                Status: {b.status}<br />
                                                Speed: {b.vehicle?.speed?.toFixed(0) || 0} km/h
                                            </Popup>
                                        </Marker>
                                        {startPos && <Marker position={startPos} icon={pickupIcon}><Popup>Pickup</Popup></Marker>}
                                        {dropPos && <Marker position={dropPos} icon={dropIcon}><Popup>Drop</Popup></Marker>}

                                        {b.routeGeometry && (
                                            <>
                                                <Polyline positions={b.routeGeometry} pathOptions={{ color: 'green', weight: 4, opacity: 0.8 }} />
                                                {startPos && <Polyline positions={[startPos, b.routeGeometry[0]]} pathOptions={{ color: '#666', dashArray: '5, 10', weight: 2, opacity: 0.8 }} />}
                                                {dropPos && <Polyline positions={[b.routeGeometry[b.routeGeometry.length - 1], dropPos]} pathOptions={{ color: '#666', dashArray: '5, 10', weight: 2, opacity: 0.8 }} />}
                                            </>
                                        )}
                                        {b.pickupGeometry && (
                                            <>
                                                <Polyline positions={b.pickupGeometry} pathOptions={{ color: 'blue', dashArray: '10, 10', weight: 3, opacity: 0.6 }} />
                                                {startPos && <Polyline positions={[b.pickupGeometry[b.pickupGeometry.length - 1], startPos]} pathOptions={{ color: '#666', dashArray: '5, 10', weight: 2, opacity: 0.8 }} />}
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {/* Render Idle Vehicles (Not in active bookings) */}
                            {allVehicles
                                .filter(v => !bookings.some(b => b.vehicle?.id === v.id))
                                .map(v => (
                                    <Marker
                                        key={v.id}
                                        position={[v.latitude || 22.7196, v.longitude || 75.8577]}
                                        icon={getVehicleIcon(v.type)}
                                        opacity={0.7}
                                    >
                                        <Popup>
                                            <strong>{v.name}</strong><br />
                                            Status: {v.status}<br />
                                            Speed: {v.speed?.toFixed(0) || 0} km/h
                                        </Popup>
                                    </Marker>
                                ))
                            }
                        </MapContainer>

                        {/* Legend */}
                        <div style={{
                            position: 'absolute', bottom: '2rem', right: '1rem',
                            background: 'rgba(255,255,255,0.9)', color: '#333',
                            padding: '1rem', borderRadius: '8px',
                            zIndex: 1000, fontSize: '0.8rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><span style={{ width: 10, height: 10, background: 'blue', borderRadius: '50%' }}></span> Vehicle</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><span style={{ width: 10, height: 10, background: 'green', borderRadius: '50%' }}></span> Pickup</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, background: 'red', borderRadius: '50%' }}></span> Drop-off</div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default LiveTrackingPage;
