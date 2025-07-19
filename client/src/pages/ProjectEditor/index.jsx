import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaFileAlt, FaSave, FaSpinner, FaArrowLeft, FaCode, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toaster';
import { customErrorMessage } from '../../utils/error';
import './style.css';

const ProjectEditor = () => {
  const [project, setProject] = useState({ name: '', description: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalProject, setOriginalProject] = useState({ name: '', description: '', content: '' });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/projects/${id}`);
      const { name, description, content } = response.data;
      const projectData = { name, description, content };
      setProject(projectData);
      setOriginalProject(projectData);
    } catch (error) {
      showErrorToast(customErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const updatedProject = { ...project, [e.target.name]: e.target.value };
    setProject(updatedProject);
    
    // Check if there are changes
    const hasChanges = JSON.stringify(updatedProject) !== JSON.stringify(originalProject);
    setHasChanges(hasChanges);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving || !hasChanges) return;
    
    try {
      setIsSaving(true);
      await api.put(`/projects/${id}`, project);
      setOriginalProject(project);
      setHasChanges(false);
      showSuccessToast('Project details updated successfully');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      showErrorToast('Failed to update project details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="editor-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <FaSpinner className="spinner" />
          </div>
          <p className="loading-text">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Background Elements */}
      <div className="editor-background-pattern"></div>
      <div className="editor-background-glow"></div>
      
      {/* Header Section */}
      <div className="editor-header">
        <button onClick={handleGoBack} className="back-button">
          <FaArrowLeft /> Back to Dashboard
        </button>
        <div className="header-content">
          <div className="header-icon">
            <FaEdit />
          </div>
          <h1 className="page-title">Edit Project</h1>
          <p className="page-subtitle">Update your project details and configuration</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-content">
        <div className="editor-form-container">
          <form onSubmit={handleSubmit} className="editor-form">
            {/* Project Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <FaFileAlt className="label-icon" />
                Project Name
              </label>
              <div className="input-wrapper">
                {/* <div className="input-icon">
                  <FaFileAlt />
                </div> */}
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={project.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="form-input"
                />
                {hasChanges && (
                  <div className="input-status changed">
                    <FaEdit />
                  </div>
                )}
              </div>
            </div>

            {/* Project Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <FaCode className="label-icon" />
                Project Description
              </label>
              <div className="input-wrapper">
                {/* <div className="textarea-icon">
                  <FaCode />
                </div> */}
                <textarea
                  id="description"
                  name="description"
                  value={project.description}
                  onChange={handleChange}
                  placeholder="Describe your project's purpose and goals..."
                  rows="5"
                  className="form-textarea"
                />
                {hasChanges && (
                  <div className="input-status changed">
                    <FaEdit />
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="submit-section">
              <button 
                type="submit" 
                className={`save-button ${isSaving ? 'saving' : ''} ${!hasChanges ? 'no-changes' : ''}`}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="spinner" />
                    Saving Changes...
                  </>
                ) : hasChanges ? (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                ) : (
                  <>
                    <FaCheck />
                    All Changes Saved
                  </>
                )}
              </button>
              
              {hasChanges && (
                <p className="changes-note">
                  You have unsaved changes
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
