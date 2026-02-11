import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';
import { Activity, AlertTriangle, CheckCircle, Wrench, Calendar } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/charts.css';

const MaintenancePage = () => {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, alertsRes] = await Promise.all([
                apiClient.get('/maintenance/stats'),
                apiClient.get('/alerts')
            ]);
            setStats(statsRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error("Error fetching maintenance data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleResolve = async (id) => {
        try {
            await apiClient.put(`/alerts/${id}/resolve`);
            // Optimistic update
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
            alert("Alert resolved successfully!");
        } catch (error) {
            console.error("Failed to resolve alert", error);
            alert("Failed to resolve alert.");
        }
    };

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

                <h2 style={{ margin: '2rem 0 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle color="var(--error)" /> Active Mechanical Alerts
                </h2>
                <div className="dashboard-card" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem' }}>Vehicle</th>
                                <th style={{ padding: '1rem' }}>Issue</th>
                                <th style={{ padding: '1rem' }}>Severity</th>
                                <th style={{ padding: '1rem' }}>Time</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts?.filter(a => a.status !== 'RESOLVED').length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No active alerts. Fleet is healthy.
                                    </td>
                                </tr>
                            ) : (
                                alerts?.filter(a => a.status !== 'RESOLVED').map(alert => (
                                    <tr key={alert.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{alert.vehicle?.name}</td>
                                        <td style={{ padding: '1rem' }}>{alert.message}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`status-chip ${alert.severity === 'Critical' ? 'status-service' : 'status-warning'}`}
                                                style={{ background: alert.severity === 'Critical' ? 'var(--error)' : 'var(--warning)', color: 'white' }}>
                                                {alert.severity}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                className="btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success)' }}
                                                onClick={() => handleResolve(alert.id)}
                                            >
                                                <CheckCircle size={14} style={{ marginRight: '5px' }} /> Resolve
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default MaintenancePage;
