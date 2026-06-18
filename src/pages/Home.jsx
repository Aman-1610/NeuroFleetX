import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Cpu, Gauge, Zap, TrendingUp, 
  MapPin, Activity, HelpCircle, LogIn, UserPlus, LogOut, LayoutDashboard 
} from 'lucide-react';
import { isAuthenticated, getUser, getUserRole, clearAuth } from '../utils/authUtils';
import carIso from '../assets/car_iso.png';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Interactive Simulator States
  const [speed, setSpeed] = useState(75);
  const [payload, setPayload] = useState(2500);
  const [logs, setLogs] = useState([
    { time: '01:34:02', text: 'Telemetry link established.', type: 'info' },
    { time: '01:34:15', text: 'Calibrating AI load balance...', type: 'info' },
    { time: '01:34:30', text: 'System ready.', type: 'info' }
  ]);

  // Ref for the 3D card tilt effect
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setCurrentUser(getUser());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update Telemetry Logs dynamically based on sliders
  useEffect(() => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    let newLog = null;

    if (speed > 130) {
      newLog = { time: timeStr, text: `WARNING: High Speed Alert! Speed exceeded 130 km/h.`, type: 'warn' };
    } else if (payload > 8500) {
      newLog = { time: timeStr, text: `CRITICAL: Overload hazard. Payload exceeded 8.5 tons.`, type: 'crit' };
    } else {
      newLog = { time: timeStr, text: `Telemetry updated: Spd ${speed} km/h | Load ${payload} kg`, type: 'info' };
    }

    setLogs(prev => [newLog, ...prev.slice(0, 3)]);
  }, [speed, payload]);

  // Interactive 3D Card Hover Tilt Handler
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates around center (0,0)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; // Max 12 degrees
    const rotateY = ((x - centerX) / centerX) * 12;  // Max 12 degrees

    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
  };

  // Log out action
  const handleLogout = () => {
    clearAuth();
    setIsAuth(false);
    setCurrentUser(null);
    navigate('/');
  };

  // Redirect to corresponding dashboard
  const handleDashboardRedirect = () => {
    const role = getUserRole();
    switch (role) {
      case 'ADMIN': navigate('/admin-dashboard'); break;
      case 'FLEET_MANAGER': navigate('/manager-dashboard'); break;
      case 'DRIVER': navigate('/driver-dashboard'); break;
      case 'CUSTOMER': navigate('/customer-dashboard'); break;
      default: navigate('/customer-dashboard');
    }
  };

  // Simulator Analytics Computations
  const getFuelRate = () => {
    const baseRate = 8.0;
    const speedFactor = Math.pow(speed - 60, 2) * 0.002;
    const loadFactor = payload * 0.0012;
    return (baseRate + Math.max(0, speedFactor) + loadFactor).toFixed(1);
  };

  const getStatusText = () => {
    if (payload > 8000) return 'DANGER: OVERLOAD';
    if (speed > 120 || payload > 6000) return 'HIGH FUEL USAGE';
    if (speed >= 60 && speed <= 90 && payload < 4000) return 'ECO MODE OPTIMAL';
    return 'STANDARD RENTAL';
  };

  const getStatusClass = () => {
    const status = getStatusText();
    if (status.includes('DANGER')) return 'error';
    if (status.includes('HIGH')) return 'warning';
    return '';
  };

  return (
    <div className="home-container">
      
      {/* Navigation */}
      <nav className={`home-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <span><Zap size={18} /></span> NeuroFleetX
          </div>
          
          <div className="nav-actions">
            {isAuth ? (
              <>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Hi, <strong>{currentUser?.name || 'User'}</strong> ({currentUser?.role})
                </span>
                <button className="btn btn-secondary" onClick={handleDashboardRedirect}>
                  <LayoutDashboard size={16} /> Console
                </button>
                <button className="btn btn-primary" style={{ background: 'var(--error)', boxShadow: 'none' }} onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  <LogIn size={16} /> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <UserPlus size={16} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="grid-overlay"></div>
        
        <div className="hero-badge">
          <ShieldCheck size={14} /> AI-Optimized Fleet Telematics
        </div>
        
        <h1 className="hero-title-large">
          Urban Mobility <span className="gradient-text-blue">Optimized</span>.<br />
          Fleet Management <span className="gradient-text-purple">Reimagined</span>.
        </h1>
        
        <p className="hero-description">
          A high-performance enterprise solution for route analytics, real-time vehicle dispatch, and automated telemetry tracking.
        </p>

        <div className="hero-ctas">
          {isAuth ? (
            <button className="btn btn-primary" onClick={handleDashboardRedirect}>
              Return to Console <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Explore Platform <ArrowRight size={18} />
              </Link>
              <a href="#simulator" className="btn btn-secondary">
                Try Live Simulator
              </a>
            </>
          )}
        </div>

        {/* 3D Visual Section */}
        <div className="hero-visual-container">
          <div 
            className="visual-3d-card"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
          >
            <div className="visual-3d-glow" />
            <div className="visual-3d-content">
              <div className="visual-left">
                <h3 style={{ color: 'var(--text-accent)', marginBottom: '0.5rem' }}>NeuroFleetX Live Telemetry</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                  Interactive live updates mapped inDelhi NCR. Hover over to explore spatial 3D perspective depth.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--success)' }}>
                    <Activity size={14} /> Live Connections: 24 active
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} /> Main Hub: Delhi NCR, India
                  </div>
                </div>
              </div>
              
              <div className="visual-right">
                <img src={carIso} alt="Isometric Vehicle Visualization" className="iso-car-image" />
                <div className="telemetry-tag-3d tag-speed">120 KM/H</div>
                <div className="telemetry-tag-3d tag-status">GPS LINK OK</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid Section */}
      <section className="features-section">
        <h2 className="section-title-gradient">Robust Ecosystem Features</h2>
        <p className="section-subtitle">
          Engineered to satisfy drivers, passenger clients, dispatch managers, and system administrators alike.
        </p>

        <div className="features-3d-grid">
          
          <div className="feature-3d-card card-blue">
            <div className="feature-icon-container feature-icon-blue">
              <Activity size={24} />
            </div>
            <h3>Real-Time Telemetry</h3>
            <p>
              Instantly monitor vehicle speeds, location coordinates, fuel rates, and safety alerts directly on high-performance maps.
            </p>
            <span className="feature-link">Explore Real-Time Data <ArrowRight size={16} /></span>
          </div>

          <div className="feature-3d-card card-purple">
            <div className="feature-icon-container feature-icon-purple">
              <Cpu size={24} />
            </div>
            <h3>AI Route Optimization</h3>
            <p>
              Reduce delay overheads and route times through machine-learning analytics that calculate dynamic paths in Delhi NCR.
            </p>
            <span className="feature-link">View Optimized Routing <ArrowRight size={16} /></span>
          </div>

          <div className="feature-3d-card card-cyan">
            <div className="feature-icon-container feature-icon-cyan">
              <Gauge size={24} />
            </div>
            <h3>Predictive Maintenance</h3>
            <p>
              Automatically flags engine overheating, high wear, or regular service cycles before breaking down on active routes.
            </p>
            <span className="feature-link">Check Maintenance Center <ArrowRight size={16} /></span>
          </div>

          <div className="feature-3d-card card-blue">
            <div className="feature-icon-container feature-icon-blue">
              <ShieldCheck size={24} />
            </div>
            <h3>Driver Center</h3>
            <p>
              Dedicated dashboard for driver telemetry, shifts tracker, automated performance analysis, and monthly earnings breakdown.
            </p>
            <span className="feature-link">Access Driver Portal <ArrowRight size={16} /></span>
          </div>

          <div className="feature-3d-card card-purple">
            <div className="feature-icon-container feature-icon-purple">
              <MapPin size={24} />
            </div>
            <h3>Passenger Bookings</h3>
            <p>
              User-friendly customer booking engine providing direct vehicle requests, active route tracking, and clear expense billing.
            </p>
            <span className="feature-link">Request a Vehicle <ArrowRight size={16} /></span>
          </div>

          <div className="feature-3d-card card-cyan">
            <div className="feature-icon-container feature-icon-cyan">
              <TrendingUp size={24} />
            </div>
            <h3>Enterprise Analytics</h3>
            <p>
              Provides administrators with CSV report exports, user permissions settings, and full system revenues breakdowns.
            </p>
            <span className="feature-link">Open Analytics Dashboard <ArrowRight size={16} /></span>
          </div>

        </div>
      </section>

      {/* Live Interactive Telemetry Simulator */}
      <section className="simulator-section" id="simulator">
        <div className="simulator-card">
          <div className="simulator-controls">
            <h2>Telemetry Simulator</h2>
            <p>
              Simulate load dynamics and speed variations to see how the NeuroFleetX onboard analytics engine calculates system safety constraints.
            </p>

            <div className="slider-group">
              <div className="slider-label">
                <span>VEHICLE SPEED</span>
                <span>{speed} km/h</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="180" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>PAYLOAD WEIGHT</span>
                <span>{payload} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                value={payload} 
                onChange={(e) => setPayload(Number(e.target.value))}
                className="range-slider"
              />
            </div>
          </div>

          <div className="simulator-display">
            <div className="console-title">
              <span>SYSTEM: ACTIVE</span>
              <span>● LIVE</span>
            </div>

            <div className="console-metrics">
              <div className="console-metric">
                <label>Fuel Consumption</label>
                <value>{getFuelRate()} L/100km</value>
              </div>

              <div className={`console-metric ${getStatusClass()}`}>
                <label>Engine Health Status</label>
                <value style={{ fontSize: '1.1rem' }}>{getStatusText()}</value>
              </div>
            </div>

            <div className="console-log">
              {logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <span>[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}

export default Home;
