import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Register = ({ navigate }) => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'freelancer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the AuthContext register function
      await register(formData.name, formData.email, formData.password, formData.userType);
      // Navigate after successful registration
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
