import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Map, Calendar, Clock, MapPin, CheckCircle, Navigation } from 'lucide-react';
import apiClient from '../../services/apiClient';
import '../../styles/dashboard.css';

// Reusing style concepts from module 3
const DriverTripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [filter, setFilter] = useState('ALL'); // ALL, TODAY, COMPLETED

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await apiClient.get('/dashboard/driver/trips');
                // Map API response to UI model if needed, or use directly
                // API returns: { id, startLocation, dropLocation, startTime, status, price }
                const mapped = res.data.map(d => ({
                    id: d.id,
                    start: d.startLocation,
                    end: d.dropLocation,
                    status: d.status,
                    date: d.startTime,
                    fare: d.price,
                    distance: d.distance || 0
                }));
                setTrips(mapped);
            } catch (error) {
                console.error("Failed to fetch driver trips", error);
            }
        };
        fetchTrips();
    }, []);

    const filteredTrips = trips.filter(t => {
        if (filter === 'TODAY') {
            return new Date(t.date).toDateString() === new Date().toDateString();
        }
        return true;
    });

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="gradient-text">Trip History</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
                        <button className={`filter-btn ${filter === 'TODAY' ? 'active' : ''}`} onClick={() => setFilter('TODAY')}>Today</button>
                    </div>
                </div>

                <div className="module3-container">
                    {filteredTrips.map(trip => (
                        <div key={trip.id} className="module3-card animate-slide-up">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Trip #{trip.id}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(trip.date).toLocaleString()}</div>
                                </div>
                                <span className={`status-badge status-${trip.status.toLowerCase()}`}>{trip.status}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                                    <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>{trip.start}</div>
                                    <div>{trip.end}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Navigation size={16} /> {trip.distance} km
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--success)' }}>
                                    ₹{trip.fare}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DriverTripsPage;
