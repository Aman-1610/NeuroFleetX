import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { vehicleService } from '../services/vehicleService';
import { Truck, MapPin, Zap, Plus, X, Edit2, Trash2, Gauge } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/fleet.css';

const FleetInventory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState({
        name: '',
        type: 'Truck',
        status: 'Idle',
    });

    useEffect(() => {
        loadVehicles();
        const interval = setInterval(() => {
            updateTelemetry();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const loadVehicles = async () => {
        try {
            const data = await vehicleService.getVehicles();
            setVehicles(data);
        } catch (error) {
            console.error("Failed to load vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const updateTelemetry = () => {
        const updated = vehicleService.simulateTelemetry();
        setVehicles(updated);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await vehicleService.updateVehicle(currentVehicle.id, currentVehicle);
        } else {
            await vehicleService.addVehicle(currentVehicle);
        }
        setShowModal(false);
        loadVehicles();
        setCurrentVehicle({ name: '', type: 'Truck', status: 'Idle' });
        setIsEditing(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this vehicle?")) {
            await vehicleService.deleteVehicle(id);
            loadVehicles();
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentVehicle({ name: '', type: 'Truck', status: 'Idle' });
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setIsEditing(true);
        setCurrentVehicle(vehicle);
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

                                <div className="telemetry-grid">
                                    <div className="telemetry-item">
                                        <Zap size={18} className="text-yellow" />
                                        <div className="telemetry-value-box">
                                            <span className="telemetry-label">Battery</span>
                                            <span className="telemetry-value">{vehicle.battery?.toFixed(0) || 0}%</span>
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

                                <div className="location-strip">
                                    <MapPin size={14} className="text-red" />
                                    <span>
                                        {vehicle.location?.lat?.toFixed(4)}, {vehicle.location?.lng?.toFixed(4)}
                                    </span>
                                </div>

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
