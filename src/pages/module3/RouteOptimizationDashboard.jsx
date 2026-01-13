import React, { useState } from 'react';
import RoutePlanningPage from './RoutePlanningPage';
import LoadOptimizationPage from './LoadOptimizationPage';
import { Map, Truck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import '../../styles/module3.css';
import '../../styles/dashboard.css';

const RouteOptimizationDashboard = () => {
    const [activeTab, setActiveTab] = useState('routing');

    return (
        <div className="dashboard-layout">
            <Navbar />

            <div className="dashboard-container">
                <div className="module-tabs">
                    <button
                        onClick={() => setActiveTab('routing')}
                        className={`module-tab-btn ${activeTab === 'routing' ? 'active' : ''}`}
                    >
                        <Map size={18} /> Route Planning
                    </button>
                    <button
                        onClick={() => setActiveTab('load')}
                        className={`module-tab-btn ${activeTab === 'load' ? 'active' : ''}`}
                    >
                        <Truck size={18} /> Load Optimization
                    </button>
                </div>

                <div className="module-content">
                    {activeTab === 'routing' && (
                        <div className="animate-fade-in">
                            <RoutePlanningPage />
                        </div>
                    )}
                    {activeTab === 'load' && (
                        <div className="animate-fade-in">
                            <LoadOptimizationPage />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RouteOptimizationDashboard;
