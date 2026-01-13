import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';
import { Activity, AlertTriangle, CheckCircle, Wrench, Calendar } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/charts.css';

const MaintenancePage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/maintenance/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-spinner">Analyzing engine health...</div>;

    // Pie Chart Data Calculation
    const total = (stats?.vehiclesCritical || 0) + (stats?.vehiclesDueSoon || 0) + (stats?.vehiclesHealthy || 0);
    const criticalDeg = (stats?.vehiclesCritical / total) * 360 || 0;
    const dueDeg = (stats?.vehiclesDueSoon / total) * 360 || 0;
    // Conic Gradient: Critical (Red) -> Due (Orange) -> Healthy (Green)
    const pieStyle = {
        background: `conic-gradient(
            var(--error) 0deg ${criticalDeg}deg,
            var(--warning) ${criticalDeg}deg ${criticalDeg + dueDeg}deg,
            var(--success) ${criticalDeg + dueDeg}deg 360deg
        )`
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Predictive Maintenance</h1>
                        <p>AI-Driven Health Analytics to prevent breakdowns</p>
                    </div>
                    <div className="health-score-badge">
                        <Activity size={20} />
                        <span>Fleet Health: <strong>{stats?.fleetHealthScore}%</strong></span>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Pie Chart Section */}
                    <div className="dashboard-card">
                        <h3 className="card-title">Fleet Status Distribution</h3>
                        <div style={{ padding: '2rem 0' }}>
                            <div className="pie-chart" style={pieStyle}>
                                <div className="pie-center">
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{total}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vehicles</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 10, height: 10, background: 'var(--error)', borderRadius: '50%' }} /> Critical</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 10, height: 10, background: 'var(--warning)', borderRadius: '50%' }} /> Due Soon</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 10, height: 10, background: 'var(--success)', borderRadius: '50%' }} /> Healthy</div>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart Section */}
                    <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
                        <h3 className="card-title">Health Trend (Last 5 Months)</h3>
                        <div className="chart-container">
                            {stats?.trendData.map((data, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', height: '100%', justifyContent: 'flex-end' }}>
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${data.averageHealth}%`,
                                            background: 'var(--primary)',
                                            opacity: 0.7 + (idx * 0.1)
                                        }}
                                        data-value={`${data.averageHealth}%`}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <h2 style={{ margin: '2rem 0 1rem' }}>AI Fault Predictions</h2>
                <div className="fault-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {stats?.predictedFaults.length === 0 ? (
                        <div className="dashboard-card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--success)' }}>
                            <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                            <h3>No Critical Faults Predicted</h3>
                            <p>All systems running within optimal parameters.</p>
                        </div>
                    ) : (
                        stats?.predictedFaults.map((fault, idx) => (
                            <div key={idx} className="prediction-card animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--error)' }}>{fault.vehicleName}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                        <Wrench size={16} /> {fault.component}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <Calendar size={16} /> Expected: {fault.predictedDate}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--error)' }}>
                                        {fault.probability}%
                                    </div>
                                    <span style={{ fontSize: '0.75rem' }}>Probability</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
