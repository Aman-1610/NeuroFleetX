import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, ShieldCheck, Building, FileText } from 'lucide-react'
import { registerUser } from '../services/services'
import { setToken, setUser } from '../utils/authUtils'
import '../styles/auth.css'

const CustomDropdown = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="input-field"
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          border: isOpen ? '1px solid var(--secondary)' : '1px solid var(--glass-border)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{selectedOption.icon}</span>
          {selectedOption.label}
        </span>
        <span style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          background: '#1e293b', // solid dark color to cover
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: value === option.value ? 'var(--secondary)' : 'transparent',
                color: value === option.value ? 'white' : 'var(--text-primary)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { if (value !== option.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if (value !== option.value) e.currentTarget.style.background = 'transparent' }}
            >
              <span>{option.icon}</span>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    companyName: '',
    licenseNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const checkPasswordStrength = (pass) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    setPasswordStrength(score)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (passwordStrength < 3) {
      setError('Password is too weak')
      setLoading(false)
      return
    }

    try {
      const response = await registerUser(formData)
      // Backend returns flat object: { token, name, email, role, ... }
      const { token, ...user } = response.data

      setToken(token)
      setUser(user)

      // Redirect based on role
      switch (user.role) {
        case 'ADMIN': navigate('/admin-dashboard'); break;
        case 'FLEET_MANAGER': navigate('/manager-dashboard'); break;
        case 'DRIVER': navigate('/driver-dashboard'); break;
        case 'CUSTOMER': navigate('/customer-dashboard'); break;
        default: navigate('/customer-dashboard');
      }
    } catch (err) {
      setError(err.response?.data || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-icon" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--accent))' }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join NeuroFleetX today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Role Selection Custom Dropdown */}
          <div className="input-group" style={{ zIndex: 10 }}>
            <label style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Role</label>
            <CustomDropdown
              options={[
                { label: 'Customer', value: 'CUSTOMER', icon: '👤' },
                { label: 'Driver', value: 'DRIVER', icon: '🚗' },
                { label: 'Fleet Manager', value: 'FLEET_MANAGER', icon: '🏢' },
                { label: 'Admin', value: 'ADMIN', icon: '🛡️' }
              ]}
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
            />
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="name@company.com"
                style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          {/* Conditional Fields */}
          {(formData.role === 'FLEET_MANAGER' || formData.role === 'DRIVER') && (
            <div className="animate-fade-in" style={{ marginTop: '1rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                {formData.role === 'FLEET_MANAGER' ? 'Fleet Manager' : 'Driver'} Details
              </h3>

              {formData.role === 'FLEET_MANAGER' && (
                <div className="input-group">
                  <label>Company Name <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Building size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Acme Logistics"
                      style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.role === 'DRIVER' && (
                <div className="input-group">
                  <label>License Number <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="DL-123456789"
                      style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                required
              />
            </div>
            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    height: '4px', flex: 1, borderRadius: '2px',
                    background: i <= passwordStrength
                      ? (passwordStrength < 3 ? 'var(--warning)' : 'var(--success)')
                      : 'rgba(255,255,255,0.1)'
                  }} />
                ))}
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>Get Started <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
