import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Package, Clock, MessageSquare, MapPin, IndianRupee, Heart, Plus } from 'lucide-react';
import { dashboardService } from '../services/services';
import '../styles/dashboard.css';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Customer Dashboard Loaded');
        const fetchMetrics = async () => {
            try {
                const response = await dashboardService.getCustomerMetrics();
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
        { title: "Active Bookings", value: metrics?.activeBookings, icon: <Clock size={24} />, color: 'var(--primary)' },
        { title: "Total Trips", value: metrics?.totalTrips, icon: <MapPin size={24} />, color: 'var(--secondary)' },
        { title: "Total Spent", value: metrics?.totalSpent, icon: <IndianRupee size={24} />, color: 'var(--error)' },
        { title: "Amount Saved", value: metrics?.amountSaved, icon: <IndianRupee size={24} />, color: 'var(--success)' },
        { title: "Upcoming Trips", value: metrics?.upcomingTrips, icon: <Package size={24} />, color: 'var(--warning)' },
        { title: "Favorite Routes", value: metrics?.favoriteRoutes, icon: <Heart size={24} />, color: 'var(--accent)' },
    ];

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Customer Dashboard</h1>
                        <p>Track your shipments and orders</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/booking')}>
                        <Plus size={20} /> Book New Ride
                    </button>
                </header>

                <div className="dashboard-grid">
                    {!loading && stats.map((stat, index) => (
                        <div
                            key={index}
                            className="dashboard-card"
                            onClick={() => {
                                if (stat.title === 'Active Bookings') navigate('/tracking');
                                if (stat.title === 'Total Trips') navigate('/history');
                                if (stat.title === 'Total Spent') navigate('/expenses');
                                if (stat.title === 'Amount Saved') navigate('/expenses');
                                if (stat.title === 'Upcoming Trips') navigate('/upcoming');
                                if (stat.title === 'Favorite Routes') navigate('/favorites');
                            }}
                            style={{ cursor: 'pointer' }}
                        >
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

export default CustomerDashboard;
