import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react'
import { loginUser } from '../services/services'
import { setToken, setUser } from '../utils/authUtils'
import '../styles/auth.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await loginUser({ email, password })
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
      setError(err.response?.data || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Shield size={32} color="white" />
          </div>
          <h1 className="auth-title">NeuroFleetX</h1>
          <p className="auth-subtitle">Sign in to continue</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>


          <div className="input-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="name@company.com"
                style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing in...' : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
