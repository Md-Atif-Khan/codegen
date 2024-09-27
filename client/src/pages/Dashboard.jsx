import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      const statusCode = error.response?.data?.statusCode || 500;
      switch (statusCode) {
        case 400:
          toast.error(`Bad Request: ${errorMessage}`);
          break;
        case 401:
          toast.error(`Unauthorized: ${errorMessage}`);
          break;
        case 404:
          toast.error(`Not Found: ${errorMessage}`);
          break;
        default:
          toast.error(`Error: ${errorMessage}`);
      }
    }
  };

  const deleteProject = async (id) => {
    toast.info(
      <div className="text-center">
        <p className="text-lg font-semibold mb-4">Are you sure you want to delete this project?</p>
        <div className="flex justify-center space-x-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1"
            onClick={async () => {
              try {
                await api.delete(`/projects/${id}`);
                fetchProjects();
                toast.success('Project deleted successfully', {
                  position: "top-right",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              } catch (error) {
                const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
                const statusCode = error.response?.data?.statusCode || 500;
                console.error('Error deleting project:', error);
                switch (statusCode) {
                  case 400:
                    toast.error(`Bad Request: ${errorMessage}`);
                    break;
                  case 401:
                    toast.error(`Unauthorized: ${errorMessage}`);
                    break;
                  case 404:
                    toast.error(`Not Found: ${errorMessage}`);
                    break;
                  default:
                    toast.error(`Error: ${errorMessage}`);
                }
              }
            }}
          >
            Yes, Delete
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1"
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
        closeButton: false,
        className: "bg-white text-gray-800 p-6 rounded-lg shadow-xl border-t-4 border-indigo-500",
      }
    );
  }

  // const deleteProject = async (id) => {
  //   if (!window.confirm('Are you sure you want to delete this project?')) return;
  //   try {
  //     await api.delete(`/projects/${id}`);
  //     fetchProjects();
  //     toast.success('Project deleted successfully');
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
  //     const statusCode = error.response?.data?.statusCode || 500;
  //     console.error('Error deleting project:', error);
  //     switch (statusCode) {
  //       case 400:
  //         toast.error(`Bad Request: ${errorMessage}`);
  //         break;
  //       case 401:
  //         toast.error(`Unauthorized: ${errorMessage}`);
  //         break;
  //       case 404:
  //         toast.error(`Not Found: ${errorMessage}`);
  //         break;
  //       default:
  //         toast.error(`Error: ${errorMessage}`);
  //     }
  //   }
  // };


  return (
    <div className="pt-20 min-h-screen bg-gray-120 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Projects</h1>
        <Link to="/project/new" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6">
          Create New Project
        </Link>
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {projects.map((project) => (
            <li key={project._id} className="p-[2px] px-[0.5px] border-b border-gray-200 last:border-b-0">
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <Link to={`/project/${project._id}`} className="text-lg font-medium text-indigo-600 hover:text-indigo-900">
                  {project.name}
                </Link>
                <div className="flex space-x-2">
                  <Link to={`/project/${project._id}/edit`} className="text-sm bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Edit Info
                  </Link>
                  <button onClick={() => deleteProject(project._id)} className="text-sm bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Dashboard;