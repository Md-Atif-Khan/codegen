import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDatabase from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import aiRoutes from "./src/routes/aiRoutes.js"
import errorHandler from './src/middleware/errorHandler.js';
import logger from './src/middleware/logger.js';
import { NotFoundError } from './src/utils/errors.js';

dotenv.config();
const app = express();

// Middleware
app.use(logger);
app.use(cors({ 
  origin: process.env.CLIENT_URL,  
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDatabase();
 
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes)

// Health check (used by uptime pingers; HEAD * kept for the same reason)
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});
app.head('*', (req, res) => {
  res.status(200).end();
});

// The client is deployed separately (Vercel), so the server does not serve
// client/dist. Any route not matched above is a 404.
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Error handler middleware (general errors)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
