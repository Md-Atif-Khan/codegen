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
    const isProd = process.env.NODE_ENV === 'production';
    const domain = isProd
      ? process.env.COOKIE_DOMAIN
      : 'localhost';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,            
      sameSite: isProd ? 'None' : 'Lax', 
      domain,
    });
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
