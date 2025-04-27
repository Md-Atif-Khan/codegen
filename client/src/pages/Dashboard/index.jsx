import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { showErrorToast, showSuccessToast } from '../../utils/toaster';
import { customErrorMessage } from '../../utils/error';
import './style.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    }
    catch (error) {
      showErrorToast(customErrorMessage(error));
    }
  };

  const deleteProject = async (id) => {
    toast.info(
      <div className="delete-dialog">
        <p className="delete-text">Are you sure you want to delete this project?</p>
        <div className="dialog-buttons">
          <button
            className="confirm-delete"
            onClick={async () => {
              try {
                await api.delete(`/projects/${id}`);
                fetchProjects();
                showSuccessToast('Project deleted successfully');
              } catch (error) {
                showErrorToast(customErrorMessage(error));
              }
            }}
          >
            Yes, Delete
          </button>
          <button
            className="cancel-delete"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        closeButton: false
      }
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Your Projects</h1>
        <Link to="/project/new" className="create-button">
          Create New Project
        </Link>
        <ul className="projects-list">
          {projects.map((project) => (
            <li key={project._id} className="project-item">
              <div className="project-content">
                <Link to={`/project/${project._id}`} className="project-link">
                  {project.name}
                </Link>
                <div className="project-actions">
                  <Link to={`/project/${project._id}/edit`} className="edit-button">
                    Edit Info
                  </Link>
                  <button onClick={() => deleteProject(project._id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;