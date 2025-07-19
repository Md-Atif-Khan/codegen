import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaFileAlt, FaLanguage, FaRocket, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toaster';
import './style.css';

const CreateProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const languageOptions = [
    { value: 'cpp', label: 'C++', icon: '⚡', description: 'High-performance system programming' },
    { value: 'java', label: 'Java', icon: '☕', description: 'Enterprise and cross-platform development' },
    { value: 'python', label: 'Python', icon: '🐍', description: 'Rapid development and AI/ML' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      var classStructure;
      var code;
      const response = await api.post('/projects', { name, description, language, classStructure, code });
      showSuccessToast('Project created successfully');
      navigate(`/project/${response.data._id}`, {state: { projectId: response.data._id }});

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      showErrorToast(`Error creating project: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="create-project-container">
      {/* Background Elements */}
      <div className="background-pattern"></div>
      <div className="background-glow"></div>
      
      {/* Header */}
      <div className="header-section">
        <button onClick={handleGoBack} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <div className="header-content">
          <div className="header-icon">
            <FaCode />
          </div>
          <h1 className="page-title">Create New Project</h1>
          <p className="page-subtitle">Build your next amazing application with OOP principles</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="form-section">
        <div className="form-card">
          <form className="project-form" onSubmit={handleSubmit}>
            {/* Project Name */}
            <div className="input-group">
              <label htmlFor="name" className="input-label">
                <FaFileAlt className="label-icon" />
                Project Name
              </label>
              <div className="input-wrapper">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Project"
                />
              </div>
            </div>

            {/* Project Description */}
            <div className="input-group">
              <label htmlFor="description" className="input-label">
                <FaFileAlt className="label-icon" />
                Project Description
              </label>
              <div className="input-wrapper">
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your project does and its main objectives..."
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="input-group">
              <label className="input-label">
                <FaLanguage className="label-icon" />
                Programming Language
              </label>
              <div className="language-grid">
                {languageOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={`language-option ${language === option.value ? 'selected' : ''}`}
                    onClick={() => setLanguage(option.value)}
                  >
                    <div className="language-icon">{option.icon}</div>
                    <div className="language-details">
                      <h3 className="language-name">{option.label}</h3>
                      <p className="language-description">{option.description}</p>
                    </div>
                    <div className="language-radio">
                      <input
                        type="radio"
                        name="language"
                        value={option.value}
                        checked={language === option.value}
                        onChange={(e) => setLanguage(e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button 
                type="submit" 
                className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <FaRocket />
                    Create Project
                  </>
                )}
              </button>
              <p className="submit-note">
                Your project will be created with the selected language and OOP structure.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
