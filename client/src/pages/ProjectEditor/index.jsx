import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toaster';
import { customErrorMessage } from '../../utils/error';
import './style.css';

const ProjectEditor = () => {
  const [project, setProject] = useState({ name: '', description: '', content: '' });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      const { name, description, content } = response.data; // Destructure the data
      setProject({ name, description, content });
    } catch (error) {
      showErrorToast(customErrorMessage(error));
    }
  };

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, project);
      navigate('/dashboard');
      showSuccessToast('Project details updated successfully');
    } catch (error) {
      showErrorToast('Failed to update project details');
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-content">
        <div className="editor-form-container">
          <h2 className="editor-title">Edit Project</h2>
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Project Name:
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={project.name}
                onChange={handleChange}
                placeholder="Enter project name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Project Description:
              </label>
              <textarea
                id="description"
                name="description"
                value={project.description}
                onChange={handleChange}
                placeholder="Enter project description"
                rows="4"
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
