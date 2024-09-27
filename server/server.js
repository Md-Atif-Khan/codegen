import express from 'express';
import cors from 'cors';
import path from "path";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDatabase from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import aiRoutes from "./src/routes/aiRoutes.js"
import errorHandler from './src/middleware/errorHandler.js';
import logger from './src/middleware/logger.js';

dotenv.config();
const __dirname = path.resolve();
const app = express();

// Middleware
app.use(logger);
app.use(cors({ origin: process.env.CLIENT_URL,  credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes)
app.use((req, res, next) => { // If no route matches, throw a NotFoundError
  next(new NotFoundError('Route not found')); 
});
app.use(errorHandler);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));