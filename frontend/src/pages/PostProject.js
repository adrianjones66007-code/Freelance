import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ProjectForm } from '../components/ProjectComponents';

const PostProject = ({ navigate }) => {
  const { user, token } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (projectData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('category', projectData.category);
      formData.append('budget', projectData.budget);
      formData.append('budgetType', projectData.budgetType);
      formData.append('deadline', projectData.deadline);
      formData.append('skills', JSON.stringify(projectData.skills));

      // Add images
      if (projectData.projectImages && projectData.projectImages.length > 0) {
        projectData.projectImages.forEach((image) => {
          formData.append('projectImages', image);
        });
      }

      await axios.post('/api/projects', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setSuccess('Project posted successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error posting project');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.userType !== 'client' && user.userType !== 'both')) {
    return (
      <div className="container">
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p>Only clients can post projects. <button type="button" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ color: '#667eea', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Switch to client account</button></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginTop: '40px', maxWidth: '600px', margin: '40px auto 0' }}>
        <h1>Post a New Project</h1>
        {error && <div className="error" style={{ marginBottom: '20px', color: '#e74c3c' }}>{error}</div>}
        {success && <div className="success">{success}</div>}
        <ProjectForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default PostProject;
