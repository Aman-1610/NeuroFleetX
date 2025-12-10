import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Truck, BrainCircuit, Activity, MapPin, Users, IndianRupee } from 'lucide-react';
import { dashboardService } from '../services/services';
import '../styles/dashboard.css';

const FleetManagerDashboard = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await dashboardService.getFleetManagerMetrics();
                setMetrics(response.data);
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
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
            path: '/routes',
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

                <h2 style={{ marginBottom: '1.5rem' }}>Modules</h2>
                <div className="dashboard-grid">
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
        </div>
    );
};

export default FleetManagerDashboard;
