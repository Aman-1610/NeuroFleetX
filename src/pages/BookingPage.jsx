import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { bookingService } from '../services/bookingService';
import { Search, MapPin, Calendar, Users, Zap, Truck, Car, CheckCircle, Map as MapIcon, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/booking.css';
import '../styles/dashboard.css';
import '../styles/picker.css';

// Fix Leaflet Icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ onSelect, onClose }) => {
    const [position, setPosition] = useState(null);

    const MapEvents = () => {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                // Reverse Geocode
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    onSelect(data.display_name, lat, lng);
                } catch (err) {
                    console.error("Geocoding failed", err);
                    onSelect(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng);
                }
            },
        });
        return null;
    };

    return (
        <div className="picker-modal-overlay">
            <div className="picker-modal">
                <div className="picker-header">
                    <h3>Pick Location</h3>
                    <button onClick={onClose} className="icon-btn"><X size={20} /></button>
                </div>
                <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer center={[22.7196, 75.8577]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEvents />
                        {position && <Marker position={position} />}
                    </MapContainer>
                </div>
                <p style={{ padding: '10px', fontSize: '0.9rem', color: '#666' }}>Click on the map to select address.</p>
            </div>
        </div>
    );
};

// ... (Previous imports)
import { Polyline, Popup } from 'react-leaflet';
import axios from 'axios';

// ... (LocationPicker remains same)

const BookingPage = () => {
    const [searchParams, setSearchParams] = useState({
        startLocation: '', startLat: null, startLng: null,
        dropLocation: '', dropLat: null, dropLng: null,
        type: '', seats: 4, isEv: null, startTime: ''
    });

    const [showMap, setShowMap] = useState(null);
    const [bookingStep, setBookingStep] = useState('INPUT'); // INPUT -> ROUTES -> ANALYTICS -> VEHICLES
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [searching, setSearching] = useState(false);

    // Fetch OSRM Route
    // Fetch OSRM Route with forced alternatives
    const fetchRoutes = async () => {
        if (!searchParams.startLat || !searchParams.dropLat) {
            alert("Please select start and drop locations on map.");
            return;
        }
        setSearching(true);
        try {
            // 1. Get Primary Route (and potential alternatives)
            const baseUrl = `https://router.project-osrm.org/route/v1/driving/${searchParams.startLng},${searchParams.startLat};${searchParams.dropLng},${searchParams.dropLat}`;
            const primaryRes = await axios.get(`${baseUrl}?overview=full&geometries=geojson&alternatives=true`);

            let fetchedRoutes = primaryRes.data.routes || [];

            // 2. If fewer than 3 routes, force finding "via" routes by calculating mid-points
            if (fetchedRoutes.length < 3) {
                const start = { lat: searchParams.startLat, lng: searchParams.startLng };
                const end = { lat: searchParams.dropLat, lng: searchParams.dropLng };

                // Calculate vector
                const dLat = end.lat - start.lat;
                const dLng = end.lng - start.lng;

                // Calculate different "Via" points (shifts perpendicular to path)
                // Offset factor: roughly 30% of trip length outwards
                const via1 = { lat: (start.lat + end.lat) / 2 - dLng * 0.3, lng: (start.lng + end.lng) / 2 + dLat * 0.3 };
                const via2 = { lat: (start.lat + end.lat) / 2 + dLng * 0.3, lng: (start.lng + end.lng) / 2 - dLat * 0.3 };

                // Fetch Alternative 1 (Detour Left)
                try {
                    const alt1Res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${via1.lng},${via1.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
                    if (alt1Res.data.routes[0]) fetchedRoutes.push(alt1Res.data.routes[0]);
                } catch (e) { console.warn("Alt 1 failed", e); }

                // Fetch Alternative 2 (Detour Right)
                try {
                    const alt2Res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${via2.lng},${via2.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
                    if (alt2Res.data.routes[0]) fetchedRoutes.push(alt2Res.data.routes[0]);
                } catch (e) { console.warn("Alt 2 failed", e); }
            }

            // 3. Process and Format
            const finalRoutes = fetchedRoutes.slice(0, 3).map((r, i) => ({
                id: i === 0 ? 'fastest' : (i === 1 ? 'traffic' : 'eco'),
                type: i === 0 ? 'Fastest Route' : (i === 1 ? 'Alternative Route' : 'Scenic Route'),
                color: i === 0 ? '#10b981' : (i === 1 ? '#f59e0b' : '#3b82f6'),
                distance: (r.distance / 1000).toFixed(1),
                duration: (r.duration / 60).toFixed(0),
                energy: i === 0 ? 'High' : (i === 1 ? 'Medium' : 'Low'),
                geometry: r.geometry.coordinates.map(c => [c[1], c[0]])
            }));

            // Fallback if somehow still 0 (network error handled in catch)
            if (finalRoutes.length > 0) {
                setRoutes(finalRoutes);
                setBookingStep('ROUTES');
            } else {
                alert("No routes found.");
            }

        } catch (e) {
            console.error(e);
            alert("Failed to fetch routes. Please try again.");
        } finally {
            setSearching(false);
        }
    };

    const handleRouteSelect = (route) => {
        setSelectedRoute(route);
        setBookingStep('ANALYTICS');
    };

    const handleProceedToVehicles = async () => {
        setBookingStep('VEHICLES');
        // Fetch vehicles
        try {
            const response = await bookingService.getRecommendations({
                ...searchParams,
                startTime: searchParams.startTime ? new Date(searchParams.startTime).toISOString() : null
            });
            setRecommendations(response.data);
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    const handleBook = async (vehicle, price) => {
        if (!window.confirm(`Confirm booking for ${vehicle.name} at ₹${price}?`)) return;
        try {
            await bookingService.createBooking({
                vehicleId: vehicle.id,
                startLocation: searchParams.startLocation,
                startLat: searchParams.startLat,
                startLng: searchParams.startLng,
                dropLocation: searchParams.dropLocation,
                dropLat: searchParams.dropLat,
                dropLng: searchParams.dropLng,
                startTime: searchParams.startTime ? new Date(searchParams.startTime).toISOString() : null,
                estimatedPrice: price
            });
            alert("Booking Confirmed!");
            window.location.href = '/customer-dashboard';
        } catch (error) {
            alert("Booking failed! Vehicle might be busy.");
        }
    };

    const handleLocationSelect = (address, lat, lng) => {
        if (showMap === 'start') {
            setSearchParams(prev => ({ ...prev, startLocation: address, startLat: lat, startLng: lng }));
        } else {
            setSearchParams(prev => ({ ...prev, dropLocation: address, dropLat: lat, dropLng: lng }));
        }
        setShowMap(null);
    };

    return (
        <div className="dashboard-layout booking-page">
            <Navbar />
            <div className="dashboard-container">
                {/* Header */}
                <div className="booking-header-section">
                    <h1 className="gradient-text">Smart Journey Planning</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {bookingStep === 'INPUT' && "Plan your trip with AI"}
                        {bookingStep === 'ROUTES' && "Select your preferred path"}
                        {bookingStep === 'ANALYTICS' && "Review route analytics"}
                        {bookingStep === 'VEHICLES' && "Choose your ride"}
                    </p>
                </div>

                {showMap && <LocationPicker onSelect={handleLocationSelect} onClose={() => setShowMap(null)} />}

                {/* Step 1: Input */}
                {bookingStep === 'INPUT' && (
                    <div className="glass-panel animate-fade-in">
                        <form onSubmit={(e) => { e.preventDefault(); fetchRoutes(); }} className="booking-form">
                            <div className="input-group">
                                <label><MapPin size={16} /> Pickup</label>
                                <div className="input-with-icon">
                                    <input type="text" className="input-field" placeholder="Enter pickup or use map"
                                        value={searchParams.startLocation}
                                        onChange={e => setSearchParams({ ...searchParams, startLocation: e.target.value })} required />
                                    <button type="button" className="map-btn" onClick={() => setShowMap('start')}><MapIcon size={18} /></button>
                                </div>
                            </div>
                            <div className="input-group">
                                <label><MapPin size={16} /> Drop-off</label>
                                <div className="input-with-icon">
                                    <input type="text" className="input-field" placeholder="Enter drop or use map"
                                        value={searchParams.dropLocation}
                                        onChange={e => setSearchParams({ ...searchParams, dropLocation: e.target.value })} required />
                                    <button type="button" className="map-btn" onClick={() => setShowMap('drop')}><MapIcon size={18} /></button>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={searching} style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                                {searching ? 'Analyzing Routes...' : 'Analyze Routes'} <Search size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Route Selection */}
                {bookingStep === 'ROUTES' && (
                    <div className="animate-slide-up">
                        <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                            <MapContainer center={[searchParams.startLat, searchParams.startLng]} zoom={11} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[searchParams.startLat, searchParams.startLng]} icon={DefaultIcon} />
                                <Marker position={[searchParams.dropLat, searchParams.dropLng]} icon={DefaultIcon} />
                                {routes.map(r => (
                                    <Polyline key={r.id} positions={r.geometry} pathOptions={{ color: r.color, weight: 6, opacity: 0.8 }} />
                                ))}
                            </MapContainer>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {routes.map(r => (
                                <div key={r.id} className="glass-panel" style={{ textAlign: 'center', borderTop: `4px solid ${r.color}` }}>
                                    <h3 style={{ margin: '0.5rem 0' }}>{r.type}</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>{r.duration} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>mins</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        <span>{r.distance} km</span>
                                        <span>Fuel: {r.energy}</span>
                                    </div>
                                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleRouteSelect(r)}>Select Route</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Analytics */}
                {bookingStep === 'ANALYTICS' && selectedRoute && (
                    <div className="animate-slide-up">
                        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2>Traffic & Congestion Analytics</h2>
                                <span className="status-badge status-confirmed" style={{ background: selectedRoute.color }}>{selectedRoute.type}</span>
                            </div>

                            <div style={{ height: '350px', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                <MapContainer center={[searchParams.startLat, searchParams.startLng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                                    />
                                    {/* Main Route Path */}
                                    <Polyline positions={selectedRoute.geometry} pathOptions={{ color: '#333', weight: 8, opacity: 0.5 }} />

                                    {/* Simulated Traffic Segments (Overlay) */}
                                    {/* We act as if the whole route is 'smooth' (green) with some 'slow' (yellow) parts if it is traffic mode */}
                                    <Polyline positions={selectedRoute.geometry} pathOptions={{
                                        color: selectedRoute.id === 'traffic' ? '#10b981' : (selectedRoute.id === 'fastest' ? '#10b981' : '#3b82f6'),
                                        weight: 4,
                                        opacity: 0.8
                                    }} />

                                    {/* Add some dummy 'Traffic Blobs' along the route if it's the Traffic Route */}
                                    {selectedRoute.id === 'traffic' && (
                                        <>
                                            <Polyline positions={selectedRoute.geometry.slice(Math.floor(selectedRoute.geometry.length * 0.4), Math.floor(selectedRoute.geometry.length * 0.5))}
                                                pathOptions={{ color: 'red', weight: 4 }} />
                                            <Popup position={selectedRoute.geometry[Math.floor(selectedRoute.geometry.length * 0.45)]}>
                                                <div style={{ color: 'black' }}>Congestion Detected<br />Delay: +2 mins</div>
                                            </Popup>
                                        </>
                                    )}

                                    <Marker position={[searchParams.startLat, searchParams.startLng]} icon={DefaultIcon} />
                                    <Marker position={[searchParams.dropLat, searchParams.dropLng]} icon={DefaultIcon} />
                                </MapContainer>

                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: 'white', zIndex: 999 }}>
                                    Live Traffic Data
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live ETA</label>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedRoute.duration} mins</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Traffic Status</label>
                                    <div style={{ fontSize: '1.1rem', color: selectedRoute.id === 'traffic' ? '#fbbf24' : '#34d399' }}>
                                        {selectedRoute.id === 'traffic' ? 'Moderate Congestion' : 'Smooth Flow'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Peak Hour Analysis</label>
                                    <div style={{ fontSize: '1.1rem' }}>Off-peak</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Road Blocks</label>
                                    <div style={{ fontSize: '1.1rem' }}>None</div>
                                </div>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }} onClick={handleProceedToVehicles}>
                                Proceed to Booking
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Vehicle Selection */}
                {bookingStep === 'VEHICLES' && (
                    <div className="animate-slide-up">
                        <div className="vehicle-results-grid">
                            {recommendations.map((vehicle, index) => {
                                const price = 250 + (index * 50);
                                return (
                                    <div key={vehicle.id} className="vehicle-card">
                                        <div className="vehicle-details">
                                            <h3 className="vehicle-name">{vehicle.name}</h3>
                                            <div className="vehicle-meta">
                                                <span>{vehicle.type}</span> • <span>{vehicle.seats} Seats</span>
                                            </div>
                                            <div className="vehicle-price">₹{price} <span style={{ fontSize: '0.9rem' }}>/ trip</span></div>
                                            <button className="book-btn" onClick={() => handleBook(vehicle, price)}>Book Now</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const VehicleIconSelector = () => <><Car size={16} /> Type</>;
const getVehicleIcon = (type) => {
    switch (type) {
        case 'Truck': return <Truck size={64} />;
        case 'Scooter': return <Zap size={64} />;
        default: return <Car size={64} />;
    }
};

export default BookingPage;
