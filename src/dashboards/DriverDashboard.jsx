import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Map, Calendar, CheckCircle, IndianRupee, Star, Navigation } from 'lucide-react';
import { dashboardService } from '../services/services';
import '../styles/dashboard.css';

const DriverDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await dashboardService.getDriverMetrics();
                setMetrics(response.data);
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
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
