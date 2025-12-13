import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { vehicleService } from '../services/vehicleService';
import { userService } from '../services/services';
import { Truck, MapPin, Zap, Plus, X, Edit2, Trash2, Gauge, User } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/fleet.css';

const FleetInventory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState({
        name: '',
        type: 'Truck',
        status: 'Idle',
        driver: null
    });

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            updateTelemetry();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [vehiclesData, driversData] = await Promise.all([
                vehicleService.getVehicles(),
                userService.getDrivers()
            ]);
            setVehicles(vehiclesData);
            setDrivers(driversData.data); // Assuming response structure
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const reloadVehicles = async () => {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
    };

    const updateTelemetry = () => {
        setVehicles(prevVehicles => vehicleService.simulateTelemetry(prevVehicles));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        let savedVehicle;
        if (isEditing) {
            savedVehicle = await vehicleService.updateVehicle(currentVehicle.id, currentVehicle);
        } else {
            savedVehicle = await vehicleService.addVehicle(currentVehicle);
        }

        // Handle driver assignment separately if selected
        if (currentVehicle.driverId) {
            await vehicleService.assignDriver(savedVehicle.id, currentVehicle.driverId);
        }

        setShowModal(false);
        reloadVehicles();
        resetForm();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this vehicle?")) {
            await vehicleService.deleteVehicle(id);
            reloadVehicles();
        }
    };

    const resetForm = () => {
        setCurrentVehicle({ name: '', type: 'Truck', status: 'Idle', driverId: '' });
        setIsEditing(false);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setIsEditing(true);
        setCurrentVehicle({
            ...vehicle,
            driverId: vehicle.driver?.id || ''
        });
        setShowModal(true);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'In Use': return 'status-in-use';
            case 'Needs Service': return 'status-service';
            default: return 'status-idle';
        }
    };

    return (
        <div className="dashboard-layout fleet-inventory-page">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Fleet Inventory</h1>
                        <p>Real-time vehicle telemetry & management</p>
                    </div>
                    <button className="add-btn" onClick={openAddModal}>
                        <Plus size={20} /> Add Vehicle
                    </button>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        Loading Fleet Data...
                    </div>
                ) : (
                    <div className="fleet-grid">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="fleet-card">
                                <div className={`card-accent ${getStatusClass(vehicle.status)}`}
                                    style={{ height: '4px', position: 'absolute', top: 0, left: 0, right: 0, background: 'currentColor' }} />

                                <div className="card-top">
                                    <div className="vehicle-info">
                                        <div className="icon-box">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="vehicle-name">{vehicle.name}</h3>
                                            <span className="vehicle-type">{vehicle.type}</span>
                                        </div>
                                    </div>
                                    <span className={`status-chip ${getStatusClass(vehicle.status)}`}>
                                        {vehicle.status}
                                    </span>
                                </div>

                                {/* Driver Info */}
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <User size={16} />
                                    <span>{vehicle.driver ? vehicle.driver.name : 'No Driver Assigned'}</span>
                                </div>

                                <div className="telemetry-grid">
                                    <div className="telemetry-item">
                                        <Zap size={18} className="text-yellow" />
                                        <div className="telemetry-value-box" style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span className="telemetry-label">Battery</span>
                                                <span className="telemetry-value" style={{ fontSize: '0.85rem' }}>{vehicle.battery?.toFixed(0)}%</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div className="progress-bar-fill"
                                                    style={{
                                                        width: `${vehicle.battery}%`,
                                                        background: vehicle.battery < 20 ? 'var(--error)' : (vehicle.battery < 50 ? 'var(--warning)' : 'var(--success)')
                                                    }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="telemetry-item">
                                        <Gauge size={18} className="text-cyan" />
                                        <div className="telemetry-value-box">
                                            <span className="telemetry-label">Speed</span>
                                            <span className="telemetry-value">{vehicle.speed?.toFixed(0) || 0} km/h</span>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${vehicle.latitude || vehicle.location?.lat || 0},${vehicle.longitude || vehicle.location?.lng || 0}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="location-strip"
                                    title="View on Google Maps"
                                >
                                    <MapPin size={14} className="text-red" />
                                    <span>
                                        {(vehicle.latitude || vehicle.location?.lat || 0).toFixed(4)}, {(vehicle.longitude || vehicle.location?.lng || 0).toFixed(4)}
                                    </span>
                                </a>

                                <div className="card-actions">
                                    <button onClick={() => openEditModal(vehicle)} className="action-btn" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(vehicle.id)} className="action-btn" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                                    {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="close-btn">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSave}>
                                <div className="input-group">
                                    <label>Vehicle Name</label>
                                    <input type="text" required
                                        className="input-field"
                                        value={currentVehicle.name}
                                        onChange={e => setCurrentVehicle({ ...currentVehicle, name: e.target.value })} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Type</label>
                                        <select className="input-field"
                                            value={currentVehicle.type}
                                            onChange={e => setCurrentVehicle({ ...currentVehicle, type: e.target.value })}>
                                            <option value="Truck">Truck</option>
                                            <option value="Van">Van</option>
                                            <option value="Scooter">Scooter</option>
                                            <option value="Car">Car</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Status</label>
                                        <select className="input-field"
                                            value={currentVehicle.status}
                                            onChange={e => setCurrentVehicle({ ...currentVehicle, status: e.target.value })}>
                                            <option value="Idle">Idle</option>
                                            <option value="In Use">In Use</option>
                                            <option value="Needs Service">Needs Service</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Assigned Driver</label>
                                    <select className="input-field"
                                        value={currentVehicle.driverId || ''}
                                        onChange={e => setCurrentVehicle({ ...currentVehicle, driverId: e.target.value })}>
                                        <option value="">-- Select Driver --</option>
                                        {drivers && drivers.map(driver => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name} ({driver.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        {isEditing ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FleetInventory;
