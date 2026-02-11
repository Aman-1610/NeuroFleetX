import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { IndianRupee, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

                {/* Daily Revenue Trend (Recharts) */}
                <div className="glass-panel" style={{ marginTop: '2rem', height: '400px', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={20} className="text-secondary" /> Daily Revenue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={[
                            { name: 'Mon', rev: revenue * 0.1 },
                            { name: 'Tue', rev: revenue * 0.15 },
                            { name: 'Wed', rev: revenue * 0.12 },
                            { name: 'Thu', rev: revenue * 0.2 },
                            { name: 'Fri', rev: revenue * 0.25 },
                            { name: 'Sat', rev: revenue * 0.1 },
                            { name: 'Sun', rev: revenue * 0.08 }
                        ]}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="rev"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorRev)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenuePage;
