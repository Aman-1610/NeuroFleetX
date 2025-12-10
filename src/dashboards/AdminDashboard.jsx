import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Users, Truck, Activity, Settings, IndianRupee, CheckCircle, BarChart2 } from 'lucide-react';
import { dashboardService } from '../services/services';
import '../styles/dashboard.css';

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
        { title: 'Total Users', value: metrics?.totalUsers, icon: <Users size={24} />, color: 'var(--primary)' },
        { title: 'Total Fleets', value: metrics?.totalFleets, icon: <Truck size={24} />, color: 'var(--secondary)' },
        { title: 'Total Bookings', value: metrics?.totalBookings, icon: <Activity size={24} />, color: 'var(--accent)' },
        { title: 'Active Users', value: metrics?.activeUsers, icon: <Users size={24} />, color: 'var(--success)' },
        { title: 'Completed Trips', value: metrics?.completedTrips, icon: <CheckCircle size={24} />, color: 'var(--warning)' },
        { title: 'Total Revenue', value: metrics?.totalRevenue, icon: <IndianRupee size={24} />, color: 'var(--error)' },
    ];

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Admin Dashboard</h1>
                        <p>System overview and management</p>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {stats.map((stat, index) => (
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

export default AdminDashboard;
