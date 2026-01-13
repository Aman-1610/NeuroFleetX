import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { IndianRupee, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import apiClient from '../services/apiClient';
import '../styles/dashboard.css';

const ExpensesPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await apiClient.get('/bookings/my');
                // Completed trips only for expenses
                const completed = response.data.filter(b => b.status === 'COMPLETED');
                setBookings(completed.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));

                const total = completed.reduce((sum, b) => sum + (b.price || 0), 0);
                setTotalSpent(total);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 className="module3-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        <IndianRupee className="text-accent" size={32} /> Financial Overview
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track your spending and savings.</p>
                </header>

                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                            <TrendingDown size={32} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)' }}>Total Spent</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{totalSpent}</div>
                        </div>
                    </div>
                    {/* Placeholder for Savings */}
                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)' }}>Amount Saved</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹0</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Coming Soon</div>
                        </div>
                    </div>
                </div>

                <h2 style={{ marginBottom: '1.5rem' }}>Transaction History</h2>
                {loading ? (
                    <div className="flex-center" style={{ height: '200px' }}><div className="spinner"></div></div>
                ) : bookings.length === 0 ? (
                    <div className="glass-panel flex-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>No transactions found.</div>
                ) : (
                    <div className="glass-panel" style={{ padding: '0' }}>
                        {bookings.map((b, i) => (
                            <div key={b.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1.5rem',
                                borderBottom: i !== bookings.length - 1 ? '1px solid var(--glass-border)' : 'none'
                            }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                                        <CheckCircle size={20} color="var(--success)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: '600' }}>Trip to {b.dropLocation.split(',')[0]}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(b.startTime)} • {b.vehicle?.name}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>- ₹{b.price}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpensesPage;
