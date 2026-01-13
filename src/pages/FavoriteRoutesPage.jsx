import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Heart, MapPin, ArrowRight } from 'lucide-react';
import apiClient from '../services/apiClient';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';

const FavoriteRoutesPage = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await apiClient.get('/bookings/my');
                // Group by Start -> Drop to find unique routes
                const routeMap = {};
                response.data.forEach(b => {
                    const key = `${b.startLocation}|${b.dropLocation}`;
                    if (!routeMap[key]) {
                        routeMap[key] = {
                            id: key,
                            start: b.startLocation,
                            drop: b.dropLocation,
                            count: 0,
                            lastTaken: b.startTime
                        };
                    }
                    routeMap[key].count++;
                    if (new Date(b.startTime) > new Date(routeMap[key].lastTaken)) {
                        routeMap[key].lastTaken = b.startTime;
                    }
                });

                // Convert to array and sort by count
                setRoutes(Object.values(routeMap).sort((a, b) => b.count - a.count));
            } catch (error) {
                console.error("Failed to fetch routes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    const handleBookAgain = (route) => {
        // Navigate to booking page with pre-filled details (simulate by passing query params or state)
        // For now just go to booking
        navigate('/booking');
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 className="module3-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        <Heart className="text-accent" size={32} /> Favorite Routes
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Your most frequented paths.</p>
                </header>

                {loading ? (
                    <div className="flex-center" style={{ height: '300px' }}><div className="spinner"></div></div>
                ) : routes.length === 0 ? (
                    <div className="glass-panel flex-center flex-col" style={{ padding: '4rem', textAlign: 'center' }}>
                        <MapPin size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <h3>No routes yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Your frequent trips will appear here.</p>
                    </div>
                ) : (
                    <div className="trip-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {routes.map((r, i) => (
                            <div key={i} className="glass-panel animate-slide-up" style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                    {r.count} Trips
                                </div>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Route #{i + 1}</h3>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '0.5rem' }}>
                                        <MapPin size={16} color="var(--success)" />
                                        <span style={{ fontSize: '0.9rem' }}>{r.start}</span>
                                    </div>
                                    <div style={{ marginLeft: '7px', borderLeft: '2px dashed #444', height: '15px', marginBottom: '0.5rem' }}></div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <MapPin size={16} color="var(--error)" />
                                        <span style={{ fontSize: '0.9rem' }}>{r.drop}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={() => handleBookAgain(r)}
                                >
                                    Book This Route Again
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteRoutesPage;
