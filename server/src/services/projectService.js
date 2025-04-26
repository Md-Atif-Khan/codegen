import Project from '../models/Project.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

export const getProjects = async (userId) => {
  return await Project.find({ user: userId });
};

export const createProject = async (userId, projectData) => {
  const project = new Project({
    name: projectData.name,
    description: projectData.description,
    classStructure: projectData.classStructure,
    code: projectData.code,
    user: userId,
  });
  return await project.save();
};


export const getProject = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, user: userId });
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  return project;
};

export const updateProject = async (projectId, userId, projectData) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, user: userId },
    { $set: projectData },
    { new: true, runValidators: true }
  );
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  return project;
};
export const deleteProject = async (projectId, userId) => {
  const project = await Project.findOneAndDelete({ _id: projectId, user: userId });
  if (!project) {
    throw new NotFoundError('Project not found');
  }
};
