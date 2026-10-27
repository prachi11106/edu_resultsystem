import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role, email, name) => {
  return jwt.sign(
    { id, role, email, name },
    process.env.JWT_SECRET || 'anksetu_super_secret_jwt_key_2026_school_management',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc Auth user & get token
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Try DB lookup
    let user;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {
      console.warn('[Auth Controller] DB lookup error:', e.message);
    }

    // Fallback demo users if DB is empty or unpopulated
    if (!user) {
      if (cleanEmail === 'teacher@anksetu.edu' && (password === 'password123' || password === 'teacher123')) {
        const token = generateToken('demo-teacher-01', 'teacher', 'teacher@anksetu.edu', 'Aarav Sharma');
        return res.json({
          success: true,
          token,
          user: {
            id: 'demo-teacher-01',
            name: 'Aarav Sharma (Teacher)',
            email: 'teacher@anksetu.edu',
            role: 'teacher',
            schoolId: 'SCH-1001',
          },
        });
      }

      if (cleanEmail === 'admin@anksetu.edu' && (password === 'password123' || password === 'admin123')) {
        const token = generateToken('demo-admin-01', 'admin', 'admin@anksetu.edu', 'Dr. Rajesh Verma');
        return res.json({
          success: true,
          token,
          user: {
            id: 'demo-admin-01',
            name: 'Dr. Rajesh Verma (Principal/Admin)',
            email: 'admin@anksetu.edu',
            role: 'admin',
            schoolId: 'SCH-1001',
          },
        });
      }

      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role, user.email, user.name);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: 'Server error during login authentication' });
  }
};

// @desc Register a new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please complete all required user fields' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: role || 'teacher',
    });

    const token = generateToken(user._id, user.role, user.email, user.name);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create user account' });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};
