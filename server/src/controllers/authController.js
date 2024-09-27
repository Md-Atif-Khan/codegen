import * as authService from '../services/authService.js';

export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    await authService.signup(username, password);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { token, user } = await authService.login(username, password);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' ? true : false });
    res.json({ message: 'Logged in successfully', user });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUser(req.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
