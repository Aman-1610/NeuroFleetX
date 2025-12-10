import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import '../styles/auth.css';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div className="auth-icon" style={{ background: 'var(--warning)' }}>
                    <AlertTriangle size={32} color="white" />
                </div>
                <h1 className="auth-title">Access Denied</h1>
                <p className="auth-subtitle">You do not have permission to view this page.</p>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate(-1)}
                    style={{ marginTop: '2rem' }}
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
