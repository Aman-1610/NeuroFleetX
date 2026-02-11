import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { Truck, Package, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import '../../styles/module3.css';

const LoadOptimizationPage = () => {
    const [tasks, setTasks] = useState([
        { id: 'T001', weight: 50.0, priority: 'HIGH', address: 'Connaught Place' },
        { id: 'T002', weight: 120.0, priority: 'NORMAL', address: 'Lajpat Nagar' },
        { id: 'T003', weight: 200.0, priority: 'HIGH', address: 'Gurgaon Cyber City' },
        { id: 'T004', weight: 30.0, priority: 'NORMAL', address: 'Noida Sec 18' },
        { id: 'T005', weight: 80.0, priority: 'NORMAL', address: 'Dwarka' },
        { id: 'T006', weight: 15.0, priority: 'HIGH', address: 'Saket' },
        { id: 'T007', weight: 300.0, priority: 'NORMAL', address: 'Okhla Ind. Area' }
    ]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleOptimize = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/routes/optimize-load', {
                tasks: tasks.map(t => ({ id: t.id, weight: t.weight, priority: t.priority }))
            });
            setAssignments(response.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="module3-page">
            <div className="module3-header">
                <h1 className="module3-title">
                    <Truck className="text-secondary" /> AI Load Balancer
                </h1>
                <p className="module3-subtitle">Distributes delivery assignments to fleet vehicles using AI to maximize efficiency and prevent overloading.</p>
            </div>

            <div className="module3-container">
                {/* Pending Tasks */}
                <div className="module3-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={20} className="text-accent" /> Pending Deliveries
                    </h2>

                    <div className="task-list custom-scrollbar">
                        {tasks.map(task => (
                            <div key={task.id} className="task-item">
                                <div>
                                    <div className="task-id">{task.id}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{task.address}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>{task.weight} kg</div>
                                    <span className={`priority-tag ${task.priority === 'HIGH' ? 'priority-high' : 'priority-normal'}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleOptimize}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem', background: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                        {loading ? 'Processing...' : <><Activity size={18} /> Optimize Fleet Load</>}
                    </button>
                </div>

                {/* Results */}
                <div style={{ padding: '0 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="section-title" style={{ margin: 0, border: 'none' }}>
                            Optimization Results
                        </h2>
                        {assignments.length > 0 && <span className="tag-eco route-tag">Optimization Complete</span>}
                    </div>

                    {assignments.length === 0 ? (
                        <div style={{
                            height: '300px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-lg)',
                            color: 'var(--text-secondary)', background: 'var(--glass-bg)'
                        }}>
                            <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No active assignments.</p>
                            <p style={{ fontSize: '0.9rem' }}>Run optimization to distribute load.</p>
                        </div>
                    ) : (
                        <div className="results-grid animate-fade-in">
                            {assignments.map(assign => (
                                <div key={assign.vehicleId} className="vehicle-load-card">
                                    <div style={{ position: 'absolute', right: '-20px', top: '-10px', opacity: 0.05, transform: 'rotate(15deg)' }}>
                                        <Truck size={120} />
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{assign.vehicleName || `Vehicle #${assign.vehicleId}`}</h3>
                                                <div className={`load-status ${assign.status === 'Overloaded' ? 'status-overloaded' :
                                                    assign.status === 'Underloaded' ? 'status-underloaded' : 'status-balanced'
                                                    }`}>
                                                    {assign.status === 'Overloaded' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                                    {assign.status}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{assign.totalLoad} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kg</span></div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Load</div>
                                            </div>
                                        </div>

                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Assigned Manifest</div>
                                            <div className="manifest-list">
                                                {assign.assignedTaskIds && assign.assignedTaskIds.map(tid => (
                                                    <span key={tid} className="manifest-item">
                                                        <Package size={10} style={{ display: 'inline', marginRight: '4px' }} /> {tid}
                                                    </span>
                                                ))}
                                                {(!assign.assignedTaskIds || assign.assignedTaskIds.length === 0) && (
                                                    <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>No items assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadOptimizationPage;
