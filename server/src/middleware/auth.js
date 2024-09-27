import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    }
    next(error);
  }
};

export default authMiddleware;