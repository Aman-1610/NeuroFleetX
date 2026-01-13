import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { IndianRupee, TrendingUp, DollarSign } from 'lucide-react';

import { dashboardService } from '../../services/services';

const AdminRevenuePage = () => {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await dashboardService.getAdminMetrics();
                setMetrics(res.data);
            } catch (e) {
                console.error("Failed to fetch revenue metrics", e);
            }
        };
        fetchMetrics();
    }, []);

    const parseAmount = (str) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    };

    const revenue = parseAmount(metrics?.totalRevenue);
    const trips = parseAmount(metrics?.completedTrips);
    const avgTrip = trips > 0 ? (revenue / trips).toFixed(0) : 0;

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <h1 className="gradient-text">Revenue Analytics</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                    <div className="dashboard-card">
                        <h3 className="card-title">Total Revenue</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            {metrics?.totalRevenue || '₹0'}
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Based on {metrics?.completedTrips || 0} completed trips</p>
                    </div>

                    <div className="dashboard-card">
                        <h3 className="card-title">Pending Payouts</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>₹0</div>
                        <p style={{ color: 'var(--text-secondary)' }}>All payouts settled</p>
                    </div>

                    <div className="dashboard-card">
                        <h3 className="card-title">Avg. Trip Value</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{avgTrip}</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ marginTop: '2rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Detailed Revenue Key Metrics Chart will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenuePage;
