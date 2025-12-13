import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Map, Calendar, CheckCircle, IndianRupee, Star, Navigation, Truck, MapPin } from 'lucide-react';
import { dashboardService } from '../services/services';
import { vehicleService } from '../services/vehicleService';
import '../styles/dashboard.css';

const DriverDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [myVehicle, setMyVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, vehicleRes] = await Promise.all([
                    dashboardService.getDriverMetrics(),
                    vehicleService.getMyVehicle()
                ]);
                setMetrics(metricsRes.data);
                setMyVehicle(vehicleRes); // might be null
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Poll for vehicle updates (telemetry)
        const interval = setInterval(async () => {
            const v = await vehicleService.getMyVehicle();
            if (v) setMyVehicle(v);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const stats = [
        { title: "Today's Trips", value: metrics?.todaysTrips, icon: <Map size={24} />, color: 'var(--primary)' },
        { title: "Today's Earnings", value: metrics?.todaysEarnings, icon: <IndianRupee size={24} />, color: 'var(--success)' },
        { title: "Distance Covered", value: `${metrics?.distanceCovered || 0} km`, icon: <Navigation size={24} />, color: 'var(--accent)' },
        { title: "Driver Rating", value: metrics?.driverRating, icon: <Star size={24} />, color: 'var(--warning)' },
        { title: "Completed Trips", value: metrics?.completedTrips, icon: <CheckCircle size={24} />, color: 'var(--secondary)' },
        { title: "Acceptance Rate", value: metrics?.acceptanceRate, icon: <CheckCircle size={24} />, color: 'var(--success)' },
    ];

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Driver Dashboard</h1>
                        <p>Your schedule and performance</p>
                    </div>
                </header>

                {/* Active Vehicle Card */}
                {myVehicle && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>My Assigned Vehicle</h2>
                        <div className="dashboard-card" style={{ maxWidth: '600px', cursor: 'default' }}>
                            <div className="card-accent" style={{ background: 'var(--accent)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    borderRadius: '12px',
                                    color: 'var(--accent)'
                                }}>
                                    <Truck size={32} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{myVehicle.name}</h3>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{myVehicle.type}</p>
                                </div>
                                <div style={{
                                    marginLeft: 'auto',
                                    padding: '0.4rem 1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    color: 'var(--text-primary)'
                                }}>
                                    {myVehicle.status}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Battery / Fuel</p>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{myVehicle.battery?.toFixed(0)}%</div>
                                    <div style={{ width: '100%', height: '4px', background: '#333', marginTop: '8px', borderRadius: '2px' }}>
                                        <div style={{
                                            width: `${myVehicle.battery}%`,
                                            height: '100%',
                                            background: myVehicle.battery < 20 ? 'red' : 'green',
                                            borderRadius: '2px'
                                        }} />
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current location</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${myVehicle.latitude || 0},${myVehicle.longitude || 0}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                                        className="hover:text-blue-400"
                                    >
                                        <MapPin size={16} color="var(--error)" />
                                        <span style={{ fontFamily: 'monospace' }}>
                                            {myVehicle.latitude?.toFixed(4) || "0.0000"}, {myVehicle.longitude?.toFixed(4) || "0.0000"}
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '1rem' }}>Statistics</h2>
                <div className="dashboard-grid">
                    {!loading && stats.map((stat, index) => (
                        <div key={index} className="dashboard-card">
                            <div className="card-accent" style={{ background: stat.color }} />
                            <div className="card-icon" style={{ color: stat.color }}>{stat.icon}</div>
                            <h3 className="card-title">{stat.title}</h3>
                            <p className="card-desc">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
