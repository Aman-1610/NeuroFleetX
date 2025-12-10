import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Mail, User } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        preferences: '',
        locations: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
            <button
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                style={{ marginBottom: '2rem' }}
            >
                <ArrowLeft size={18} /> Back
            </button>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--primary)'
                    }}>
                        <User size={40} color="var(--primary)" />
                    </div>
                    <div>
                        <h2>My Profile</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage your account settings</p>
                    </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                name="name"
                                className="input-field"
                                style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Travel Preferences</label>
                        <textarea
                            name="preferences"
                            className="input-field"
                            style={{ width: '100%', minHeight: '80px', boxSizing: 'border-box' }}
                            value={formData.preferences}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label>Saved Locations</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                            <textarea
                                name="locations"
                                className="input-field"
                                style={{ width: '100%', minHeight: '80px', paddingLeft: '40px', boxSizing: 'border-box' }}
                                value={formData.locations}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button className="btn btn-primary">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
