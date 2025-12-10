import React from 'react';
import carIso from '../assets/car_iso.png';

const LoadingScreen = () => {
    return (
        <div className="loading-screen-container">
            <div className="loading-card">
                <img src={carIso} alt="Loading..." className="loading-car-3d" />
                <h2 className="loading-text">NeuroFleetX</h2>
                <p className="loading-subtext">Optimizing your fleet...</p>
                <div className="loading-progress-bar">
                    <div className="loading-progress-fill"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
