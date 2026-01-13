import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { dashboardService } from '../../services/services';

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await dashboardService.getAdminBookings();
                const mapped = res.data.map(b => ({
                    id: b.id,
                    user: 'User ' + b.id,
                    vehicle: 'Vehicle',
                    status: b.status,
                    date: b.startTime,
                    price: b.price
                }));
                setBookings(mapped);
            } catch (e) {
                console.error("Failed to fetch bookings", e);
            }
        };
        fetchBookings();
    }, []);

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <h1 className="gradient-text">Global Bookings</h1>

                <div className="module3-container">
                    {bookings.map(booking => (
                        <div key={booking.id} className="module3-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>#{booking.id}</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{booking.user} • {booking.vehicle}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>₹{booking.price}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminBookingsPage;
