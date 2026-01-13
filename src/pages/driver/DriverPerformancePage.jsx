import React from 'react';
import Navbar from '../../components/Navbar';
import { Star, Shield, Award, ThumbsUp, Activity } from 'lucide-react';

const DriverPerformancePage = () => {
    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <h1 className="gradient-text" style={{ marginBottom: '2rem' }}>Performance Metrics</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Rating Card */}
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 1rem', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={40} color="#eab308" fill="#eab308" />
                        </div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>4.9</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Average customer rating</p>

                        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Feedback Highlights</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span className="status-badge status-confirmed">Safe Driver</span>
                                <span className="status-badge status-confirmed">Polite</span>
                                <span className="status-badge status-confirmed">Clean Vehicle</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                                <ThumbsUp size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>98% Acceptance Rate</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You accept most rides offered to you.</p>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>4.2 km Total Distance</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Kilometers driven today.</p>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
                                <Award size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>Silver Tier</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Complete 20 more trips to reach Gold.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DriverPerformancePage;
