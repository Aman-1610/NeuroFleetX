import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Edit2, Plus, X, Save, Briefcase, Maximize2, Phone, Shield, Truck, CreditCard, Navigation, Eye, EyeOff } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Helper wrapper component moved outside to prevent re-mounts
const ProfileCardWrapper = ({ isFullPage, overlayStyle, onClose, children }) => {
    if (isFullPage) {
        return <div className="profile-full-page-container" style={overlayStyle}> {children} </div>;
    }
    return <div className="profile-card-overlay" onClick={onClose}> {children} </div>;
};

// Fix for default Leaflet marker icon missing in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Helper component to recenter map when location changes
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 15);
        }
    }, [center, map]);
    return null;
};

const ProfileCard = ({ user, onClose, onUpdate, isFullPage = false }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('contact'); // contact, identity, address, vehicle, member
    const [currentLocation, setCurrentLocation] = useState(null); // { lat, lng }
    const [showSensitive, setShowSensitive] = useState({}); // { aadhaar: boolean, pan: boolean ... }

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        address: '',
        aadhaarNumber: '',
        panNumber: '',
        drivingLicenseNumber: '',
        vehicleInformation: '',
        memberDetails: '',
        preferences: 'Highways preferred, Avoid tolls',
        locations: ['New York HQ', 'Boston Warehouse'],
        customFields: []
    });

    useEffect(() => {
        if (user) {
            let parsedLocations = ['New York HQ', 'Boston Warehouse'];
            if (user.locations) {
                try {
                    parsedLocations = typeof user.locations === 'string' ? JSON.parse(user.locations) : user.locations;
                } catch (e) {
                    parsedLocations = typeof user.locations === 'string' ? user.locations.split(',') : [user.locations];
                }
            }

            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                mobileNumber: user.mobileNumber || '',
                address: user.address || '',
                aadhaarNumber: user.aadhaarNumber || '',
                panNumber: user.panNumber || '',
                drivingLicenseNumber: user.drivingLicenseNumber || '',
                vehicleInformation: user.vehicleInformation || '',
                memberDetails: user.memberDetails || '',
                preferences: user.preferences || 'Highways preferred, Avoid tolls',
                locations: Array.isArray(parsedLocations) ? parsedLocations : []
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSensitive = (field) => {
        setShowSensitive(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const formatSensitive = (value = '', field) => {
        if (!value) return '';
        if (isEditing || showSensitive[field]) return value;
        if (value.length <= 4) return value;
        return 'X'.repeat(value.length - 4) + value.slice(-4);
    };

    const handleSave = () => {
        setIsEditing(false);
        if (onUpdate) onUpdate(formData);
    };

    // Helper component to recenter map when location changes
    // Moved outside to prevent re-creation on render
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCurrentLocation(pos);
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    alert("Could not get current location.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };


    // --- Tab Content Renderers ---

    const renderContact = () => (
        <div className="profile-section">
            <h4 className="section-title">Contact Information</h4>
            <div className="form-group">
                <label>Email</label>
                <div className="info-text">{formData.email}</div>
            </div>
            <div className="form-group">
                <label>Mobile Number</label>
                {isEditing ? (
                    <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="input-field-sm" placeholder="+91 XXXXX XXXXX" />
                ) : (
                    <div className="info-text">{formData.mobileNumber || 'Not provided'}</div>
                )}
            </div>
        </div>
    );

    const renderIdentity = () => (
        <div className="profile-section">
            <h4 className="section-title">Identity & Verification</h4>

            {['aadhaarNumber', 'panNumber', 'drivingLicenseNumber'].map(field => {
                const label = field === 'aadhaarNumber' ? 'Aadhaar Number' : field === 'panNumber' ? 'PAN Number' : 'Driving License';
                return (
                    <div className="form-group" key={field}>
                        <label>{label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isEditing ? (
                                <input type="text" name={field} value={formData[field]} onChange={handleChange} className="input-field-sm" />
                            ) : (
                                <div className="info-text monospace">{formatSensitive(formData[field], field)}</div>
                            )}
                            {!isEditing && formData[field] && (
                                <button type="button" onClick={() => toggleSensitive(field)} className="btn-icon-sm">
                                    {showSensitive[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderAddress = () => (
        <div className="profile-section">
            <h4 className="section-title">Address & Location</h4>
            <div className="form-group">
                <label>Full Address</label>
                {isEditing ? (
                    <textarea name="address" value={formData.address} onChange={handleChange} className="input-field-sm" rows={3} />
                ) : (
                    <div className="info-text">{formData.address || 'Not provided'}</div>
                )}
            </div>

            {/* OpenStreetMap Integration (Leaflet) */}
            <div className="map-container" style={{ marginTop: '1rem', height: '300px', borderRadius: '8px', overflow: 'hidden', background: '#f0f0f0', border: '1px solid var(--glass-border)' }}>
                <MapContainer
                    center={currentLocation || { lat: 20.5937, lng: 78.9629 }} // Default to India
                    zoom={currentLocation ? 15 : 5}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {currentLocation && (
                        <>
                            <Marker position={currentLocation}>
                                <Popup>Your Current Location</Popup>
                            </Marker>
                            <RecenterMap center={currentLocation} />
                        </>
                    )}
                </MapContainer>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="button" onClick={getCurrentLocation} className="btn btn-outline btn-sm">
                    <Navigation size={16} /> Get Current Location
                </button>
            </div>
        </div>
    );

    const [assignedVehicle, setAssignedVehicle] = useState(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const v = await vehicleService.getMyVehicle();
                setAssignedVehicle(v);
            } catch (e) {
                console.error("Failed to fetch vehicle", e);
            }
        }
        fetchVehicle();
    }, []);

    const renderVehicle = () => (
        <div className="profile-section">
            <h4 className="section-title">Vehicle Information</h4>

            {assignedVehicle ? (
                <div className="assigned-vehicle-card" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
                    <h5 style={{ marginTop: 0, marginBottom: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={18} /> Assigned Fleet Vehicle
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                        <div><strong>Vehicle Name:</strong> <br /> {assignedVehicle.name}</div>
                        <div><strong>Type:</strong> <br /> {assignedVehicle.type}</div>
                        <div><strong>Status:</strong> <br />
                            <span style={{
                                color: assignedVehicle.status === 'In Use' ? 'var(--success)' : 'var(--warning)',
                                fontWeight: 'bold'
                            }}>
                                {assignedVehicle.status}
                            </span>
                        </div>
                        <div><strong>Battery:</strong> <br /> {assignedVehicle.battery}%</div>
                    </div>
                </div>
            ) : (
                <div className="info-text" style={{ marginBottom: '1.5rem', fontStyle: 'italic', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    No fleet vehicle currently assigned.
                </div>
            )}

            <div className="form-group">
                <label>Additional Details (Notes)</label>
                {isEditing ? (
                    <textarea name="vehicleInformation" value={formData.vehicleInformation} onChange={handleChange} className="input-field-sm" rows={4} placeholder="Personal vehicle notes..." />
                ) : (
                    <div className="info-text">{formData.vehicleInformation || 'No additional details provided'}</div>
                )}
            </div>
        </div>
    );

    const renderMember = () => (
        <div className="profile-section">
            <h4 className="section-title">Member Details</h4>
            <div className="form-group">
                <label>Membership Status / Info</label>
                {isEditing ? (
                    <textarea name="memberDetails" value={formData.memberDetails} onChange={handleChange} className="input-field-sm" rows={3} />
                ) : (
                    <div className="info-text">{formData.memberDetails || 'Standard Member'}</div>
                )}
            </div>
        </div>
    );

    // --- Layout ---

    const containerStyle = isFullPage ? {
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        margin: '2rem auto',
        minHeight: '80vh',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column'
    } : {};

    const overlayStyle = isFullPage ? {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'var(--bg-primary)',
        zIndex: 50,
        overflowY: 'auto',
        padding: '2rem'
    } : {};



    return (
        <ProfileCardWrapper isFullPage={isFullPage} overlayStyle={overlayStyle} onClose={onClose}>
            <div
                className={isFullPage ? "profile-card-full" : "profile-card-floating"}
                onClick={e => e.stopPropagation()}
                style={isFullPage ? containerStyle : {}}
            >
                <div className="profile-card-header">
                    <h3>NeuroFleetX Profile</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!isFullPage && (
                            <button className="close-btn" onClick={() => navigate('/profile')} title="Expand to full page">
                                <Maximize2 size={20} />
                            </button>
                        )}
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="profile-main-content" style={{ display: 'flex', flexDirection: isFullPage ? 'row' : 'column', flex: 1, overflow: 'hidden' }}>

                    {/* Sidebar / Tabs */}
                    <div className="profile-sidebar" style={{
                        width: isFullPage ? '250px' : '100%',
                        borderRight: isFullPage ? '1px solid var(--border-color)' : 'none',
                        borderBottom: isFullPage ? 'none' : '1px solid var(--border-color)',
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        overflowX: 'auto' // for mobile scroll horizontal
                    }}>
                        <div className="profile-avatar-small" style={{ textAlign: 'center', marginBottom: '1.5rem', display: isFullPage ? 'block' : 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: isFullPage ? '0 auto 10px' : '0' }}>
                                <User size={30} color="white" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0 }}>{formData.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.role}</span>
                            </div>
                        </div>

                        <div className="profile-tabs" style={{ display: 'flex', flexDirection: isFullPage ? 'column' : 'row', gap: '0.5rem' }}>
                            <button className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}><Phone size={16} /> Contact</button>
                            <button className={`tab-btn ${activeTab === 'identity' ? 'active' : ''}`} onClick={() => setActiveTab('identity')}><Shield size={16} /> Identity</button>
                            <button className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}><MapPin size={16} /> Address</button>
                            <button className={`tab-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}><Truck size={16} /> Vehicle</button>
                            <button className={`tab-btn ${activeTab === 'member' ? 'active' : ''}`} onClick={() => setActiveTab('member')}><CreditCard size={16} /> Membership</button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="profile-content-area" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                        {activeTab === 'contact' && renderContact()}
                        {activeTab === 'identity' && renderIdentity()}
                        {activeTab === 'address' && renderAddress()}
                        {activeTab === 'vehicle' && renderVehicle()}
                        {activeTab === 'member' && renderMember()}
                    </div>
                </div>

                <div className="profile-card-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your data is secure.</div>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm">Cancel</button>
                            <button onClick={handleSave} className="btn btn-primary btn-sm"><Save size={16} /> Save Changes</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm"><Edit2 size={16} /> Edit Profile</button>
                    )}
                </div>
            </div>
        </ProfileCardWrapper>
    );
};

export default ProfileCard;
