import React, { useState } from 'react';

export const ProjectCard = ({ project, onViewDetails }) => {
  const imageUrl = project.projectImages && project.projectImages.length > 0 
    ? project.projectImages[0]
    : null;

  return (
    <div className="card">
      {imageUrl && (
        <div
          style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '5px', marginBottom: '10px', cursor: 'pointer' }}
          onClick={() => onViewDetails(project._id)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') onViewDetails(project._id); }}
        >
          <img 
            src={imageUrl} 
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <h3>{project.title}</h3>
      <p className="category"><strong>Category:</strong> {project.category}</p>
      <p><strong>Budget:</strong> ${project.budget}</p>
      <p className="description">{project.description.substring(0, 100)}...</p>
      <div className="skills">
        {project.skills && project.skills.map((skill, idx) => (
          <span key={idx} className="badge">{skill}</span>
        ))}
      </div>
      <p><strong>Status:</strong> <span className="badge">{project.status}</span></p>
      <p><strong>Bids:</strong> {project.bids ? project.bids.length : 0}</p>
      <button className="btn btn-primary" onClick={() => onViewDetails(project._id)}>
        View Details
      </button>
    </div>
  );
};

export const ProjectForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    category: '',
    budget: '',
    budgetType: 'fixed',
    skills: '',
    deadline: '',
  });
  const [projectImages, setProjectImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()),
      projectImages: projectImages
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Project Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter project title"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Describe your project in detail"
        />
      </div>

      <div className="form-group">
        <label>Project Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          placeholder="Upload project images"
        />
        <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
          You can upload up to 10 images (JPEG, PNG, GIF, WebP). Max 5MB each.
        </small>
        {imagePreview.length > 0 && (
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {imagePreview.map((preview, idx) => (
              <img
                key={idx}
                src={preview}
                alt={`Preview ${idx}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          <option value="Construction">Construction</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Painting">Painting</option>
          <option value="Roofing">Roofing</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Budget</label>
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          required
          placeholder="Enter budget"
        />
      </div>

      <div className="form-group">
        <label>Budget Type</label>
        <select
          name="budgetType"
          value={formData.budgetType}
          onChange={handleChange}
        >
          <option value="fixed">Fixed</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>

      <div className="form-group">
        <label>Required Skills (comma-separated)</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="React, Node.js, MongoDB"
        />
      </div>

      <div className="form-group">
        <label>Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {initialData ? 'Update Project' : 'Post Project'}
      </button>
    </form>
  );
};
