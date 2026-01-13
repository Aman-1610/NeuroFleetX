import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import apiClient from '../../services/apiClient';
import { Users, User, Trash2, Edit } from 'lucide-react';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await apiClient.get('/dashboard/admin/users');
                // res.data = [{ id, name, email, role }]
                // we need to add 'status' if not present (backend DTO doesn't have it yet, default to active)
                const mapped = res.data.map(u => ({
                    ...u,
                    status: 'ACTIVE' // Mock status for now as DB doesn't track online status easily yet
                }));
                setUsers(mapped);
            } catch (e) {
                console.error("Failed to fetch users", e);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = filter === 'ALL' ? users : users.filter(u => u.role === filter);

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h1 className="gradient-text">User Management</h1>
                    <div>
                        <select
                            style={{ padding: '0.5rem', background: '#333', color: 'white', borderRadius: '4px', border: '1px solid #444' }}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="CUSTOMER">Customers</option>
                            <option value="DRIVER">Drivers</option>
                            <option value="FLEET_MANAGER">Fleet Managers</option>
                        </select>
                    </div>
                </div>

                <div className="glass-panel">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><User size={16} /></div>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`status-badge ${user.role === 'FLEET_MANAGER' ? 'status-in_maintenance' : (user.role === 'DRIVER' ? 'status-confirmed' : 'status-completed')}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: user.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)' }}>{user.status}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="icon-btn" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}><Edit size={18} /></button>
                                        <button className="icon-btn" style={{ color: 'var(--error)' }}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
