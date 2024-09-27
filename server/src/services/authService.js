import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import { validatePassword } from './validatePassword.js';

export const signup = async (username, password) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new BadRequestError('Username already exists');
  }
  validatePassword(password);
  const user = new User({ username, password });
  await user.save();
  return user;
};

export const login = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  return { token, user: { id: user._id, username: user.username } };
};

export const getUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  return user;
};