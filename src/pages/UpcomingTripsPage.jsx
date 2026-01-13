import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Clock, MapPin, Calendar, Package, ArrowRight } from 'lucide-react';
import apiClient from '../services/apiClient';
import '../styles/dashboard.css';

const UpcomingTripsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await apiClient.get('/bookings/my');
                // Filter: Status is PENDING or CONFIRMED or IN_PROGRESS
                const upcoming = response.data.filter(b =>
                    ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
                ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                setBookings(upcoming);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 className="module3-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        <Clock className="text-accent" size={32} /> Upcoming Trips
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Your scheduled journeys.</p>
                </header>

                {loading ? (
                    <div className="flex-center" style={{ height: '300px' }}><div className="spinner"></div></div>
                ) : bookings.length === 0 ? (
                    <div className="glass-panel flex-center flex-col" style={{ padding: '4rem', textAlign: 'center' }}>
                        <Clock size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <h3>No upcoming trips</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>You are all caught up!</p>
                    </div>
                ) : (
                    <div className="trip-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {bookings.map(b => (
                            <div key={b.id} className="glass-panel trip-card animate-slide-up" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                <div style={{ height: '4px', width: '100%', background: 'var(--warning)' }}></div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                                <Package size={24} color="var(--warning)" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{b.vehicle?.name || 'Scheduled Ride'}</h3>
                                                <span className="status-badge status-confirmed">{b.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ position: 'relative', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ position: 'absolute', left: '19px', top: '8px', bottom: '24px', width: '2px', background: 'var(--warning)', opacity: 0.3 }}></div>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', marginTop: '6px' }}></div>
                                            <div><label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PICKUP</label><div>{b.startLocation}</div></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', marginTop: '6px' }}></div>
                                            <div><label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DROP</label><div>{b.dropLocation}</div></div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0 -1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Calendar size={14} /> {formatDate(b.startTime)}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{b.price}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingTripsPage;
