import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Users, Truck, Activity, Settings, IndianRupee, CheckCircle, BarChart2, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { dashboardService } from '../services/services';
import '../styles/dashboard.css';
import '../styles/charts.css';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await dashboardService.getAdminMetrics();
                setMetrics(response.data);
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="dashboard-layout"><div className="dashboard-container">Loading...</div></div>;

    const stats = [
        { title: 'Total Users', value: metrics?.totalUsers, icon: <Users size={24} />, color: 'var(--primary)', link: '/admin/users' },
        { title: 'Total Fleets', value: metrics?.totalFleets, icon: <Truck size={24} />, color: 'var(--secondary)', link: '/fleet' },
        { title: 'Total Bookings', value: metrics?.totalBookings, icon: <Activity size={24} />, color: 'var(--accent)', link: '/admin/bookings' },
        { title: 'Active Users', value: metrics?.activeUsers, icon: <Users size={24} />, color: 'var(--success)', link: '/admin/users' },
        { title: 'Completed Trips', value: metrics?.completedTrips, icon: <CheckCircle size={24} />, color: 'var(--warning)', link: '/admin/bookings' },
        { title: 'Total Revenue', value: metrics?.totalRevenue, icon: <IndianRupee size={24} />, color: 'var(--error)', link: '/admin/revenue' },
    ];

    const handleReset = async () => {
        if (window.confirm("ARE YOU SURE? This will wipe all users, bookings, and fleets. You will be logged out.")) {
            try {
                await apiClient.delete('/dashboard/admin/reset');
                alert("Database cleared. Redirecting to login...");
                window.location.href = '/login';
            } catch (e) {
                console.error("Reset failed", e);
                alert("Reset failed: " + e.message);
            }
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Admin Dashboard</h1>
                        <p>System overview and management</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" style={{ background: 'var(--error)' }} onClick={handleReset}>
                            <Trash2 size={18} /> Reset DB
                        </button>
                        <button className="btn-primary" onClick={() => window.open('http://localhost:8081/api/analytics/export/csv', '_blank')}>
                            <BarChart2 size={18} /> Export Report
                        </button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {stats.map((stat, index) => (
                        <div key={index}
                            className="dashboard-card animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                            onClick={() => window.location.href = stat.link}
                        >
                            <div className="card-accent" style={{ background: stat.color }} />
                            <div className="card-icon" style={{ color: stat.color }}>{stat.icon}</div>
                            <h3 className="card-title">{stat.title}</h3>
                            <p className="card-desc">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics Section */}
                <h2 style={{ margin: '3rem 0 1.5rem' }}>Urban Mobility Insights</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>

                    {/* Hourly Activity Chart */}
                    <div className="dashboard-card">
                        <h3 className="card-title">Hourly Rental Activity</h3>
                        <div className="chart-container" style={{ padding: '20px 0' }}>
                            {(() => {
                                const data = metrics?.hourlyActivity || [0, 0, 0, 0, 0, 0, 0];
                                const max = Math.max(...data, 1); // Avoid div by zero
                                return data.map((val, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', flex: 1 }}>
                                        <div
                                            className="bar"
                                            style={{
                                                height: `${(val / max) * 80 + 5}%`, // Scale to 85% max
                                                width: '60%',
                                                background: 'linear-gradient(to top, var(--primary), var(--secondary))'
                                            }}
                                            title={`${val} Trips`}
                                        />
                                        <span style={{ fontSize: '0.8rem', marginTop: 5 }}>{10 + (i * 2)}:00</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Trip Density Heatmap (Static Image/Placeholder or Map) */}
                    <div className="dashboard-card">
                        <h3 className="card-title">Trip Density Heatmap (Delhi NCR)</h3>
                        <div style={{
                            height: '300px',
                            borderRadius: '12px',
                            background: '#1e293b',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Real Heatmap Visualization */}
                            <MapContainer center={[28.6139, 77.2090]} zoom={10} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                                />
                                {metrics?.heatMapPoints?.map((point, idx) => {
                                    const [lat, lng, sentiment] = point.split(',').map(Number);
                                    if (!lat || !lng) return null;
                                    return (
                                        <CircleMarker
                                            key={idx}
                                            center={[lat, lng]}
                                            pathOptions={{
                                                color: sentiment > 0.5 ? '#ef4444' : '#f59e0b',
                                                fillColor: sentiment > 0.5 ? '#ef4444' : '#f59e0b',
                                                fillOpacity: 0.6,
                                                weight: 0
                                            }}
                                            radius={8}
                                        >
                                            <Popup>
                                                <strong>Demand Spot</strong><br />
                                                Intensity: {sentiment}
                                            </Popup>
                                        </CircleMarker>
                                    );
                                })}
                            </MapContainer>
                            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: 'white', zIndex: 999 }}>
                                🔴 Live Demand Spots: {metrics?.heatMapPoints?.length || 0}
                            </div>                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
