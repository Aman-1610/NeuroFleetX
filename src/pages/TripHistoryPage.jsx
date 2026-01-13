import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Package, MapPin, Calendar, Clock, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';
import '../styles/dashboard.css';

const TripHistoryPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await apiClient.get('/bookings/my');
                // Sort by date desc
                const sorted = response.data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
                setBookings(sorted);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={18} color="var(--success)" />;
            case 'CANCELLED': return <XCircle size={18} color="var(--error)" />;
            case 'CONFIRMED': return <Clock size={18} color="var(--primary)" />;
            case 'IN_PROGRESS': return <Package size={18} color="var(--warning)" />;
            default: return <AlertCircle size={18} color="var(--text-secondary)" />;
        }
    };

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
                        <Package className="text-accent" size={32} /> Your Journeys
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track your active shipments and view past trip history.</p>
                </header>

                {loading ? (
                    <div className="flex-center" style={{ height: '300px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="glass-panel flex-center flex-col" style={{ padding: '4rem', textAlign: 'center' }}>
                        <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <h3>No trips yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Book your first ride to get started!</p>
                    </div>
                ) : (
                    <div className="trip-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {bookings.map(b => (
                            <div key={b.id} className="glass-panel trip-card animate-slide-up" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'transform 0.2s', position: 'relative' }}>
                                {/* Status Strip */}
                                <div style={{
                                    height: '4px',
                                    width: '100%',
                                    background: b.status === 'COMPLETED' ? 'var(--success)' :
                                        b.status === 'CANCELLED' ? 'var(--error)' :
                                            b.status === 'IN_PROGRESS' ? 'var(--warning)' : 'var(--primary)'
                                }}></div>

                                <div style={{ padding: '1.5rem' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '48px', height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '1px solid var(--glass-border)'
                                            }}>
                                                {/* Simple vehicle icon based on name/type or default */}
                                                <Package size={24} color="var(--text-primary)" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{b.vehicle?.name || 'Standard Ride'}</h3>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: #{b.id}</span>
                                            </div>
                                        </div>
                                        <div className={`status-badge status-${b.status.toLowerCase()}`} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                                            {b.status}
                                        </div>
                                    </div>

                                    {/* Route Timeline */}
                                    <div style={{ position: 'relative', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
                                        {/* Connecting Line */}
                                        <div style={{
                                            position: 'absolute', left: '19px', top: '8px', bottom: '24px',
                                            width: '2px', background: 'linear-gradient(to bottom, var(--success), var(--error))', opacity: 0.3
                                        }}></div>

                                        {/* Pickup */}
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', marginTop: '6px', boxShadow: '0 0 10px var(--success)' }}></div>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Pickup</label>
                                                <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{b.startLocation}</div>
                                            </div>
                                        </div>

                                        {/* Drop */}
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)', marginTop: '6px', boxShadow: '0 0 10px var(--error)' }}></div>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Drop-off</label>
                                                <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{b.dropLocation}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{
                                        borderTop: '1px solid var(--glass-border)',
                                        margin: '0 -1.5rem -1.5rem -1.5rem',
                                        padding: '1rem 1.5rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            <Calendar size={14} />
                                            {formatDate(b.startTime)}
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                            ₹{b.price}
                                        </div>
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

export default TripHistoryPage;
