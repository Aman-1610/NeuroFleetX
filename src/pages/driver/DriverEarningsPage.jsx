import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { IndianRupee, TrendingUp, DollarSign, Wallet } from 'lucide-react';

const DriverEarningsPage = () => {
    // Mock Data
    const earnings = [
        { id: 1, date: '2025-05-10', amount: 750, trips: 3, tips: 50 },
        { id: 2, date: '2025-05-09', amount: 1200, trips: 5, tips: 100 },
        { id: 3, date: '2025-05-08', amount: 950, trips: 4, tips: 20 },
    ];

    const totalEarnings = earnings.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <h1 className="gradient-text" style={{ marginBottom: '2rem' }}>Earnings & Payouts</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid var(--success)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--success)' }}>Total Earnings</span>
                            <Wallet size={20} color="var(--success)" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹{totalEarnings}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>+12% from last week</div>
                    </div>
                </div>

                <h2 style={{ marginBottom: '1rem' }}>Transaction History</h2>
                <div className="glass-panel">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Trips</th>
                                <th style={{ padding: '1rem' }}>Tips</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.map(e => (
                                <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(e.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{e.trips}</td>
                                    <td style={{ padding: '1rem' }}>₹{e.tips}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>₹{e.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DriverEarningsPage;
