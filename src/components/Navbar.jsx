import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Shield } from 'lucide-react';
import { removeToken, removeUser, getUser, setUser } from '../utils/authUtils';
import ProfileCard from './ProfileCard';
import { userService } from '../services/services';
import '../styles/dashboard.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [showProfile, setShowProfile] = useState(false);

    const handleLogout = (e) => {
        e.stopPropagation();
        removeToken();
        removeUser();
        navigate('/login');
    };

    const handleUpdateProfile = async (updatedData) => {
        try {
            // Convert locations array to string for backend if needed, or keep as array if backend handles it
            // Backend expects 'locations' as string (JSON or comma-separated)
            const payload = {
                ...updatedData,
                locations: JSON.stringify(updatedData.locations)
            };

            const response = await userService.updateProfile(payload);
            const updatedUser = response.data;

            // Update local storage and state
            setUser(updatedUser);
            // Force re-render or update user state if needed (Navbar uses getUser() directly which reads from localStorage, 
            // but React won't re-render unless state changes. Ideally Navbar should use a context or state)
            window.location.reload(); // Simple way to refresh for now
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-brand">
                    <Shield size={24} className="text-primary" />
                    <span>NeuroFleetX</span>
                </div>

                {user && (
                    <div className="nav-user">
                        <div
                            className="nav-profile-trigger"
                            onClick={() => setShowProfile(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                        >
                            <div className="nav-user-info">
                                <div style={{ fontWeight: 600 }}>{user.name}</div>
                                <div className="nav-role">{user.role}</div>
                            </div>
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%',
                                background: 'var(--bg-card)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <User size={20} />
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem', marginLeft: '0.5rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </nav>
            {showProfile && (
                <ProfileCard
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUpdate={handleUpdateProfile}
                />
            )}
        </>
    );
};

export default Navbar;
