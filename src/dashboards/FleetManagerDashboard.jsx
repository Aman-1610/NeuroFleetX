import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Truck, BrainCircuit, Activity, MapPin, Users, IndianRupee } from 'lucide-react';
import { dashboardService, alertService } from '../services/services';
import '../styles/dashboard.css';

const FleetManagerDashboard = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsData, alertsData] = await Promise.all([
                    dashboardService.getFleetManagerMetrics(),
                    alertService.getAllAlerts()
                ]);
                setMetrics(metricsData.data);
                setAlerts(alertsData.data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Poll for alerts every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const modules = [
        {
            title: 'Fleet Inventory',
            description: 'Track vehicle status, availability, and telemetry.',
            icon: <Truck size={32} className="text-purple-400" />,
            path: '/fleet',
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'AI Route Optimization',
            description: 'Optimize routes and loads using AI.',
            icon: <BrainCircuit size={32} className="text-emerald-400" />,
            path: '/route-opt',
            color: 'from-emerald-500 to-teal-500'
        },
        {
            title: 'Predictive Maintenance',
            description: 'Monitor health and predict maintenance needs.',
            icon: <Activity size={32} className="text-orange-400" />,
            path: '/maintenance',
            color: 'from-orange-500 to-red-500'
        },
        {
            title: 'Live Tracking',
            description: 'Real-time GPS tracking of all vehicles.',
            icon: <MapPin size={32} className="text-blue-400" />,
            path: '/tracking',
            color: 'from-blue-500 to-cyan-500'
        }
    ];

    const stats = [
        { title: 'Active Vehicles', value: metrics?.activeVehicles, icon: <Truck size={20} /> },
        { title: 'Total Fleet', value: metrics?.totalFleetSize, icon: <Truck size={20} /> },
        { title: 'Active Trips', value: metrics?.activeTrips, icon: <MapPin size={20} /> },
        { title: 'Active Drivers', value: metrics?.activeDrivers, icon: <Users size={20} /> },
        { title: 'Weekly Revenue', value: metrics?.weeklyRevenue, icon: <IndianRupee size={20} /> },
    ];


    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Fleet Manager Dashboard</h1>
                        <p>Manage your fleet operations efficiently</p>
                    </div>
                </header>

                {/* Metrics Row */}
                <div className="dashboard-grid" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {!loading && stats.map((stat, index) => (
                        <div key={index} className="dashboard-card" style={{ padding: '1.5rem' }}>
                            <div className="card-accent" style={{ background: 'var(--primary)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{stat.title}</h3>
                                <div style={{ color: 'var(--primary)' }}>{stat.icon}</div>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                    {/* Modules Section */}
                    <div>
                        <h2 style={{ marginBottom: '1.5rem' }}>Modules</h2>
                        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            {modules.map((module, index) => (
                                <div key={index} className="dashboard-card" onClick={() => navigate(module.path)}>
                                    <div className="card-accent" style={{ background: `linear-gradient(to right, var(--primary), var(--secondary))` }} />
                                    <div className="card-icon">{module.icon}</div>
                                    <h3 className="card-title">{module.title}</h3>
                                    <p className="card-desc">{module.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Alerts Section */}
                    <div className="dashboard-card" style={{ height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} className="text-red" /> Live Alerts
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {alerts.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No active alerts.</p>
                            ) : (
                                alerts.slice(0, 10).map((alert, idx) => (
                                    <div key={idx} style={{
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderLeft: `4px solid ${alert.severity === 'Critical' ? 'var(--error)' : (alert.severity === 'High' ? 'orange' : 'var(--blue)')}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{alert.type}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>
                                            {alert.message}
                                        </p>
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                                            Vehicle: {alert.vehicle ? alert.vehicle.name : 'Unknown'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FleetManagerDashboard;
