import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = ({ navigate }) => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
