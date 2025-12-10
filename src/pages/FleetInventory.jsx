import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { vehicleService } from '../services/vehicleService';
import { Truck, Battery, MapPin, Zap, Plus, X, Edit2, Trash2, Cpu } from 'lucide-react';
import '../styles/dashboard.css';

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
        }, 2000); // Update every 2 seconds

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Use': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Needs Service': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Fleet Inventory</h1>
                        <p>Real-time vehicle telemetry & management</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2"
                        onClick={openAddModal}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.8rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                        <Plus size={20} /> Add Vehicle
                    </button>
                </header>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading Fleet Data...</div>
                ) : (
                    <div className="dashboard-grid">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="dashboard-card relative group">
                                <div className={`card-accent ${getStatusColor(vehicle.status).split(' ')[1].replace('text-', 'bg-')}`}
                                    style={{ height: '4px', position: 'absolute', top: 0, left: 0, right: 0 }} />

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg bg-gray-800 text-white">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{vehicle.name}</h3>
                                            <span className="text-sm text-gray-400">{vehicle.type}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
                                        {vehicle.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-md">
                                        <Zap size={18} className="text-yellow-400" />
                                        <div>
                                            <span className="text-xs text-gray-400 block">Battery</span>
                                            <span className="font-mono text-white">{vehicle.battery.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-md">
                                        <Cpu size={18} className="text-cyan-400" />
                                        <div>
                                            <span className="text-xs text-gray-400 block">Speed</span>
                                            <span className="font-mono text-white">{vehicle.speed.toFixed(0)} km/h</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 p-2 rounded text-xs mb-4">
                                    <MapPin size={14} className="text-red-400" />
                                    <span className="font-mono">
                                        {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
                                    </span>
                                </div>

                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(vehicle)} className="p-2 hover:text-blue-400 text-gray-500 transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(vehicle.id)} className="p-2 hover:text-red-400 text-gray-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1a1c23] border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Vehicle Name</label>
                                    <input type="text" required
                                        className="w-full bg-black/20 border border-gray-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                                        value={currentVehicle.name}
                                        onChange={e => setCurrentVehicle({ ...currentVehicle, name: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Type</label>
                                        <select className="w-full bg-black/20 border border-gray-700 rounded p-2 text-white outline-none"
                                            value={currentVehicle.type}
                                            onChange={e => setCurrentVehicle({ ...currentVehicle, type: e.target.value })}>
                                            <option value="Truck">Truck</option>
                                            <option value="Van">Van</option>
                                            <option value="Scooter">Scooter</option>
                                            <option value="Car">Car</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Status</label>
                                        <select className="w-full bg-black/20 border border-gray-700 rounded p-2 text-white outline-none"
                                            value={currentVehicle.status}
                                            onChange={e => setCurrentVehicle({ ...currentVehicle, status: e.target.value })}>
                                            <option value="Idle">Idle</option>
                                            <option value="In Use">In Use</option>
                                            <option value="Needs Service">Needs Service</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800">
                                        Cancel
                                    </button>
                                    <button type="submit"
                                        className="flex-1 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700">
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
