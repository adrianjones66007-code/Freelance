import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProjectCard } from '../components/ProjectComponents';

const Home = ({ navigate }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (queryParams = {}) => {
    try {
      const response = await axios.get('/api/projects', { params: queryParams });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchProjects(filters);
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading projects...</p></div>;
  }

  return (
    <div>
      <section className="hero container">
        <h1>Find Your Next Project</h1>
        <p>Browse thousands of projects and connect with clients</p>
        <button className="btn btn-secondary" onClick={() => navigate('/post-project')}>
          Post a Project
        </button>
      </section>

      <div className="container">
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
          <h3>Filter Projects</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                <option value="Construction">Construction</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Painting">Painting</option>
                <option value="Roofing">Roofing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Min Budget</label>
              <input
                type="number"
                name="minBudget"
                value={filters.minBudget}
                onChange={handleFilterChange}
                placeholder="$"
              />
            </div>

            <div className="form-group">
              <label>Max Budget</label>
              <input
                type="number"
                name="maxBudget"
                value={filters.maxBudget}
                onChange={handleFilterChange}
                placeholder="$"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <h2>Available Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <p>No projects found. Try adjusting your filters.</p>
        ) : (
          <div className="grid">
            {projects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onViewDetails={(projectId) => navigate(`/project/${projectId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
