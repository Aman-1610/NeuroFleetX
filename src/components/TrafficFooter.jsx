import React from 'react';
import '../styles/animations.css';
import carSide from '../assets/car_side.png';

const TrafficFooter = () => {
    return (
        <div className="traffic-footer-container">
            <div className="road-strip">
                {/* Road Markings are handled in CSS ::after */}
            </div>
            <div className="car-container-glass">
                {/* <div className="glass-card-tag">On the move</div> */}
                <img src={carSide} alt="Moving Car" className="moving-car" />
            </div>
        </div>
    );
};

export default TrafficFooter;
