import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected, isMemoryFallbackEnabled } from './config/db.js';


import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import User from './models/User.js';
import Student from './models/Student.js';
import { initialStudents, initialResults, defaultSubjects } from './utils/seedData.js';
import Result from './models/Result.js';
import Subject from './models/Subject.js';
import Settings from './models/Settings.js';

dotenv.config();

const app = express();

// Enable CORS & Body Parser
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB().then(async (isConnected) => {
  if (isConnected) {
    try {
      const studentCount = await Student.countDocuments();
      if (studentCount === 0) {
        console.log('[Server Startup] Database empty. Auto-populating initial demo dataset...');
        await User.create([
          { name: 'Aarav Sharma', email: 'teacher@anksetu.edu', password: 'password123', role: 'teacher' },
          { name: 'Dr. Rajesh Verma', email: 'admin@anksetu.edu', password: 'password123', role: 'admin' },
        ]);
        await Student.insertMany(initialStudents);
        await Result.insertMany(initialResults);
        await Subject.insertMany(defaultSubjects);
        await Settings.create({
          schoolName: 'Delhi Public International Academy',
          schoolAddress: 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308',
          schoolPhone: '+91 120 4567 890',
          academicSession: '2025-26',
        });
        console.log('[Server Startup] Demo dataset populated successfully!');
      }
    } catch (err) {
      console.warn('[Server Startup] Auto-seed warning:', err.message);
    }
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const connected = isDbConnected();
  const fallbackEnabled = isMemoryFallbackEnabled();

  res.json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
    memoryFallback: fallbackEnabled,
    appName: 'AnkSetu School Result Management & AI Performance Analysis Engine',
    timestamp: new Date().toISOString(),
  });
});


// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred',
  });
});

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AnkSetu Backend API server running on port ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${PORT} is already in use by another process.`);
    console.error(`[Server Solution] Please terminate the process running on port ${PORT} or change PORT in server/.env`);
    process.exit(1);
  } else {
    console.error('[Server Error]', err);
  }
});

