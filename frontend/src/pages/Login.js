import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = ({ navigate }) => {
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState('login'); // 'login', 'mfa-verification'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [mfaCode, setMfaCode] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.requiresMFA) {
        // MFA is required
        setUserId(response.data.userId);
        setStep('mfa-verification');
      } else {
        // No MFA, direct login
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-mfa-login', {
        userId,
        code: mfaCode
      });

      // Store token
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    setStep('login');
    setMfaCode('');
    setError('');
  };

  if (step === 'mfa-verification') {
    return (
      <div className="container" style={{ marginTop: '40px' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleMFAVerification}>
            <h2>Verify Your Identity</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              We've sent a verification code to <strong>{formData.email}</strong>. Please enter the code below to complete login.
            </p>
            
            {error && <div className="error" style={{ marginBottom: '20px', color: '#e74c3c' }}>{error}</div>}

            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                required
                style={{
                  fontSize: '24px',
                  letterSpacing: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              />
              <small style={{ color: '#999', display: 'block', marginTop: '10px' }}>
                Enter the 6-digit code (expires in 10 minutes)
              </small>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }} disabled={loading || mfaCode.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={goBackToLogin}
              disabled={loading}
            >
              Back to Login
            </button>

            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
              Didn't receive the code? Check your spam folder or try again later.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <div className="error" style={{ marginBottom: '20px', color: '#e74c3c' }}>{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Your password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            Don't have an account? <button type="button" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ color: '#667eea', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Sign up</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
