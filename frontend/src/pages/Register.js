import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Register = ({ navigate }) => {
  const { register } = useContext(AuthContext);
  const [step, setStep] = useState('registration'); // 'registration', 'mfa-verification'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'freelancer',
    enableMFA: false,
  });
  const [mfaCode, setMfaCode] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        enableMFA: formData.enableMFA
      });

      if (response.data.requiresMFA) {
        // MFA is required
        setUserId(response.data.userId);
        setStep('mfa-verification');
      } else {
        // No MFA, direct login
        await register(formData.name, formData.email, formData.password, formData.userType);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-mfa-registration', {
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

  const goBackToRegistration = () => {
    setStep('registration');
    setMfaCode('');
    setError('');
  };

  if (step === 'mfa-verification') {
    return (
      <div className="container" style={{ marginTop: '40px' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleMFAVerification}>
            <h2>Verify Your Email</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              We've sent a verification code to <strong>{formData.email}</strong>. Please enter the code below.
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
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={goBackToRegistration}
              disabled={loading}
            >
              Back to Registration
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
          <h2>Create Account</h2>
          {error && <div className="error" style={{ marginBottom: '20px', color: '#e74c3c' }}>{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>

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
              placeholder="Create a password"
            />
            <small style={{ color: '#999', display: 'block', marginTop: '5px' }}>
              Minimum 6 characters
            </small>
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 0 }}>
              <input
                type="checkbox"
                name="enableMFA"
                checked={formData.enableMFA}
                onChange={handleChange}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              <span>
                <strong>Enable 2FA (Two-Factor Authentication)</strong>
                <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                  Protect your account with email verification codes
                </small>
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            Already have an account? <button type="button" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: '#667eea', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
