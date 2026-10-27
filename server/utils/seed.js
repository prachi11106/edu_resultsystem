import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Result from '../models/Result.js';
import Settings from '../models/Settings.js';
import { initialStudents, initialResults, defaultSubjects } from './seedData.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/anksetu';
    await mongoose.connect(mongoUri);

    console.log('[Seed Engine] Clearing existing records...');
    await User.deleteMany();
    await Student.deleteMany();
    await Subject.deleteMany();
    await Result.deleteMany();
    await Settings.deleteMany();

    console.log('[Seed Engine] Creating default users...');
    const teacherUser = new User({
      name: 'Aarav Sharma',
      email: 'teacher@anksetu.edu',
      password: 'password123',
      role: 'teacher',
      schoolId: 'SCH-1001',
    });

    const adminUser = new User({
      name: 'Dr. Rajesh Verma',
      email: 'admin@anksetu.edu',
      password: 'password123',
      role: 'admin',
      schoolId: 'SCH-1001',
    });

    await teacherUser.save();
    await adminUser.save();

    console.log('[Seed Engine] Creating default subjects...');
    await Subject.insertMany(defaultSubjects);

    console.log('[Seed Engine] Creating 10 demo students...');
    await Student.insertMany(initialStudents);

    console.log('[Seed Engine] Creating sample results...');
    await Result.insertMany(initialResults);

    console.log('[Seed Engine] Initializing default school settings...');
    await Settings.create({
      schoolName: 'Delhi Public International Academy',
      schoolLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&h=150&fit=crop&crop=faces',
      schoolAddress: 'Knowledge Park III, Institutional Area, Greater Noida, UP - 201308',
      schoolPhone: '+91 120 4567 890',
      schoolEmail: 'info@dpia.edu.in',
      academicSession: '2025-26',
      defaultPassMarkPercentage: 33,
      subjectPassMark: 33,
    });

    console.log('[Seed Engine] Successfully seeded AnkSetu database!');
  } catch (error) {
    console.error('[Seed Error]', error);
  }
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => mongoose.connection.close());
}
