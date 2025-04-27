import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { showSuccessToast } from '../../utils/toaster';
import './style.css';

const CreateProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      var classStructure;
      var code;
      const response = await api.post('/projects', { name, description, classStructure, code });
      showSuccessToast('Project created successfully');
      navigate(`/project/${response.data._id}`, {state: { projectId: response.data._id }});

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      showErrorToast(`Error creating project: ${errorMessage}`);
    }
  };

  return (
    <div className="create-project-container">
      <div className="header-container">
        <h2 className="project-title">Create New Project</h2>
      </div>

      <div className="form-container">
        <div className="form-box">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Project Name
              </label>
              <div className="input-container">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Project Description
              </label>
              <div className="input-container">
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                ></textarea>
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="submit-button">
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
