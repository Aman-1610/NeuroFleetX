import React, { useState } from 'react';
import apiClient from '../../services/apiClient'; // Updated import
import RouteMap from '../../components/RouteMap';
import { Navigation, Clock, Zap, MapPin, Search, ArrowRight } from 'lucide-react';
import '../../styles/module3.css';

const LOCATIONS = {
    'Connaught Place': [28.6277, 77.2181],
    'Noida Sector 62': [28.6200, 77.3700],
    'India Gate': [28.6129, 77.2295],
    'IGI Airport': [28.5562, 77.1000],
    'Gurgaon Cyber Hub': [28.4950, 77.0895],
    'Akshardham': [28.6127, 77.2773]
};

const RoutePlanningPage = () => {
    // Default: CP -> Noida
    const [start, setStart] = useState([28.6277, 77.2181]);
    const [end, setEnd] = useState([28.6200, 77.3700]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const handlePlanRoute = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/routes/plan', {
                startLat: start[0], startLng: start[1],
                endLat: end[0], endLng: end[1],
                preference: 'TIME',
                vehicleType: 'CAR'
            });
            setRoutes(response.data);
            if (response.data.length > 0) setSelectedRoute(response.data[0]);
        } catch (error) {
            console.error("Error planning route", error);
        }
        setLoading(false);
    };

    const setPreset = (loc, isStart) => {
        if (isStart) setStart(LOCATIONS[loc]);
        else setEnd(LOCATIONS[loc]);
    };

    return (
        <div className="module3-page">
            <div className="module3-header">
                <h1 className="module3-title">
                    <Navigation className="text-secondary" /> AI Route Planner
                </h1>
                <p className="module3-subtitle">Intelligent routing engine with Dijkstra Algorithm and Traffic Prediction.</p>
            </div>

            <div className="module3-container">
                {/* Controls */}
                <div className="module3-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={20} className="text-accent" /> Trip Details
                    </h2>

                    <div className="control-panel">
                        {/* Start Location */}
                        <div className="input-group">
                            <label>Start Location</label>
                            <div className="preset-chips">
                                {Object.keys(LOCATIONS).slice(0, 3).map(loc => (
                                    <span key={loc} onClick={() => setPreset(loc, true)} className="chip">{loc}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <input type="number" value={start[0]} step="0.0001" onChange={(e) => setStart([parseFloat(e.target.value), start[1]])}
                                    className="input-field" placeholder="Lat" />
                                <input type="number" value={start[1]} step="0.0001" onChange={(e) => setStart([start[0], parseFloat(e.target.value)])}
                                    className="input-field" placeholder="Lng" />
                            </div>
                        </div>

                        {/* End Location */}
                        <div className="input-group">
                            <label>Destination</label>
                            <div className="preset-chips">
                                {Object.keys(LOCATIONS).slice(1, 4).map(loc => (
                                    <span key={loc} onClick={() => setPreset(loc, false)} className="chip">{loc}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <input type="number" value={end[0]} step="0.0001" onChange={(e) => setEnd([parseFloat(e.target.value), end[1]])}
                                    className="input-field" placeholder="Lat" />
                                <input type="number" value={end[1]} step="0.0001" onChange={(e) => setEnd([end[0], parseFloat(e.target.value)])}
                                    className="input-field" placeholder="Lng" />
                            </div>
                        </div>

                        <button
                            onClick={handlePlanRoute}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? 'Optimizing Graph...' : <><Navigation size={18} /> Find Routes (Dijkstra)</>}
                        </button>
                    </div>

                    {/* Route Options */}
                    {routes.length > 0 && (
                        <div className="route-options-list animate-fade-in">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Suggestions</h3>
                            {routes.map(route => (
                                <div
                                    key={route.id}
                                    onClick={() => setSelectedRoute(route)}
                                    className={`route-option-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                                >
                                    <div className="route-option-header">
                                        <span className={`route-tag ${route.type.includes('Eco') ? 'tag-eco' :
                                            route.type.includes('Fast') ? 'tag-fast' : 'tag-short'}`
                                        }>
                                            {route.type}
                                        </span>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {route.eta}
                                        </div>
                                    </div>
                                    <div className="route-stats">
                                        <div className="stat-item"><MapPin size={14} /> {route.distance}</div>
                                        <div className="stat-item"><Zap size={14} /> {route.energyUsage?.toFixed(1)} kWh</div>
                                        <div className="stat-item" style={{ gridColumn: 'span 2' }}>
                                            Traffic: <span style={{
                                                color: route.trafficCondition === 'Heavy' ? 'var(--error)' :
                                                    route.trafficCondition === 'Moderate' ? 'var(--warning)' : 'var(--success)'
                                            }}>{route.trafficCondition}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map */}
                <div className="map-container-wrapper">
                    <RouteMap routes={selectedRoute ? [selectedRoute, ...routes.filter(r => r.id !== selectedRoute.id).map(r => ({ ...r, color: '#333', opacity: 0.3 }))] : []} start={start} end={end} height="100%" />
                </div>
            </div>
        </div>
    );
};

export default RoutePlanningPage;
