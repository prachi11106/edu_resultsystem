import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// Default seed users with bcrypt hashed passwords ('password123')
// Hash for 'password123': generated with bcrypt salt 10
const DEFAULT_PASSWORD_HASH = '$2a$10$MOArm/se7zGvGxIeXxHEFOfPWeHDRP4bEoqsbRS.yD/mMD.eIeKP.';

const INITIAL_FALLBACK_USERS = [
  {
    _id: 'usr-admin-001',
    name: 'Dr. Rajesh Verma',
    email: 'admin@anksetu.edu',
    password: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    organization: 'Delhi Public International Academy',
    phone: '+91 98111 22334',
    status: 'active',
    schoolId: 'SCH-1001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'usr-teacher-001',
    name: 'Aarav Sharma',
    email: 'teacher@anksetu.edu',
    password: DEFAULT_PASSWORD_HASH,
    role: 'teacher',
    organization: 'Delhi Public International Academy',
    phone: '+91 98765 43210',
    status: 'active',
    schoolId: 'SCH-1001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to read users from JSON file
const readUsersFromFile = () => {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_FALLBACK_USERS, null, 2), 'utf-8');
    return [...INITIAL_FALLBACK_USERS];
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...INITIAL_FALLBACK_USERS];
  } catch (err) {
    console.warn('[userService] Error reading users.json, reinitializing fallback:', err.message);
    fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_FALLBACK_USERS, null, 2), 'utf-8');
    return [...INITIAL_FALLBACK_USERS];
  }
};

// Helper to save users to JSON file
const writeUsersToFile = (users) => {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

export const userService = {
  // Hash a password securely with bcrypt
  async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
  },

  // Verify password with bcrypt
  async verifyPassword(user, enteredPassword) {
    if (!user || !user.password) return false;
    return await bcrypt.compare(enteredPassword, user.password);
  },

  // Find user by clean email
  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      try {
        const dbUser = await User.findOne({ email: cleanEmail });
        if (dbUser) return dbUser;
      } catch (err) {
        console.warn('[userService] DB findUserByEmail error:', err.message);
      }
    }

    // Check JSON fallback store
    const fileUsers = readUsersFromFile();
    const found = fileUsers.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (!found) return null;

    // Return object with matchPassword method for compatibility
    return {
      ...found,
      matchPassword: async (pwd) => await bcrypt.compare(pwd, found.password),
    };
  },

  // Find user by ID
  async findUserById(id) {
    if (isDbConnected()) {
      try {
        const dbUser = await User.findById(id).select('-password');
        if (dbUser) return dbUser;
      } catch (err) {
        console.warn('[userService] DB findUserById error:', err.message);
      }
    }

    const fileUsers = readUsersFromFile();
    const found = fileUsers.find((u) => u._id === id || u.id === id);
    if (!found) return null;

    const { password, ...safeUser } = found;
    return safeUser;
  },

  // Find user by hashed reset token
  async findUserByResetToken(hashedToken) {
    const now = Date.now();

    if (isDbConnected()) {
      try {
        const dbUser = await User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpire: { $gt: now },
        });
        if (dbUser) return dbUser;
      } catch (err) {
        console.warn('[userService] DB findUserByResetToken error:', err.message);
      }
    }

    const fileUsers = readUsersFromFile();
    const found = fileUsers.find(
      (u) =>
        u.resetPasswordToken === hashedToken &&
        u.resetPasswordExpire &&
        new Date(u.resetPasswordExpire).getTime() > now
    );

    if (!found) return null;
    return {
      ...found,
      save: async () => {
        // Will be updated via updateUser
      },
    };
  },

  // Create a new user (with bcrypt password hashing)
  async createUser({ name, email, password, role = 'teacher', organization = 'Delhi Public International Academy', phone = '', status = 'active', schoolId = 'SCH-1001' }) {
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Securely hash password
    const hashedPassword = await this.hashPassword(password);

    // Save to DB if connected
    let savedUser = null;
    if (isDbConnected()) {
      try {
        savedUser = await User.create({
          name: name.trim(),
          email: cleanEmail,
          password, // Mongoose pre-save hook will hash this, or if already hashed it checks isModified
          role,
          organization: organization.trim(),
          phone: phone.trim(),
          status,
          schoolId,
        });
      } catch (err) {
        console.warn('[userService] DB createUser error, falling back to file:', err.message);
      }
    }

    // Always also persist to fallback users.json
    const fileUsers = readUsersFromFile();
    const newFileUser = {
      _id: savedUser ? savedUser._id.toString() : `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role,
      organization: organization.trim(),
      phone: phone.trim(),
      status,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fileUsers.push(newFileUser);
    writeUsersToFile(fileUsers);

    return savedUser || newFileUser;
  },

  // Update a user by ID
  async updateUser(id, updates) {
    if (isDbConnected()) {
      try {
        await User.findByIdAndUpdate(id, updates, { new: true });
      } catch (err) {
        console.warn('[userService] DB updateUser error:', err.message);
      }
    }

    const fileUsers = readUsersFromFile();
    const index = fileUsers.findIndex((u) => u._id === id || u.id === id);
    if (index !== -1) {
      fileUsers[index] = {
        ...fileUsers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeUsersToFile(fileUsers);
      return fileUsers[index];
    }
    return null;
  },

  // Update password and clear reset token
  async resetUserPassword(userId, newPlainPassword) {
    const hashedPassword = await this.hashPassword(newPlainPassword);

    if (isDbConnected()) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.password = newPlainPassword; // Pre-save hook will hash
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          await user.save();
        }
      } catch (err) {
        console.warn('[userService] DB resetUserPassword error:', err.message);
      }
    }

    const fileUsers = readUsersFromFile();
    const index = fileUsers.findIndex((u) => u._id === userId || u.id === userId);
    if (index !== -1) {
      fileUsers[index].password = hashedPassword;
      fileUsers[index].resetPasswordToken = null;
      fileUsers[index].resetPasswordExpire = null;
      fileUsers[index].updatedAt = new Date().toISOString();
      writeUsersToFile(fileUsers);
      return true;
    }
    return false;
  },

  // Get all users (excluding passwords)
  async getAllUsers() {
    if (isDbConnected()) {
      try {
        return await User.find().select('-password').sort({ createdAt: -1 });
      } catch (err) {
        console.warn('[userService] DB getAllUsers error:', err.message);
      }
    }

    const fileUsers = readUsersFromFile();
    return fileUsers.map(({ password, ...u }) => u);
  },
};

export default userService;
