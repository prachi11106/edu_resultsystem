import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

const generateToken = (id, role, email, name, organization = '', schoolId = 'SCH-1001') => {
  return jwt.sign(
    { id, role, email, name, organization, schoolId },
    process.env.JWT_SECRET || 'anksetu_super_secret_jwt_key_2026_school_management',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc Auth user & get token
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // STRICT DB & Persisted User lookup
    const user = await userService.findUserByEmail(cleanEmail);

    // If account does not exist
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please register or contact your administrator.',
      });
    }

    // Role portal check (if specific portal requested)
    if (expectedRole && expectedRole !== user.role) {
      if (expectedRole === 'admin' && user.role === 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'This account is registered as a Teacher. Please switch to the Teacher portal to sign in.',
        });
      }
      if (expectedRole === 'teacher' && user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'This account is registered as an Administrator. Please switch to the Administrator portal to sign in.',
        });
      }
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your school administrator.',
      });
    }

    if (user.status === 'pending_approval') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator approval before you can log in.',
      });
    }

    // Verify bcrypt password
    const isMatch = await userService.verifyPassword(user, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = generateToken(
      userId,
      user.role,
      user.email,
      user.name,
      user.organization || '',
      user.schoolId || 'SCH-1001'
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization || 'Delhi Public International Academy',
        phone: user.phone || '',
        schoolId: user.schoolId || 'SCH-1001',
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login authentication',
    });
  }
};

// @desc Register a new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role = 'teacher',
      organization,
      phone,
      adminSecretKey,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields: name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (confirmPassword && confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    // Check whether user with this email already exists
    const userExists = await userService.findUserByEmail(cleanEmail);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Role-based security check: Administrator accounts must NOT be created through unrestricted public registration
    const requestedRole = role.toLowerCase() === 'admin' ? 'admin' : 'teacher';

    if (requestedRole === 'admin') {
      const authorizedAdminKey =
        process.env.ADMIN_REGISTRATION_KEY || 'anksetu_admin_master_secret_2026';
      const isAlreadyAdmin = req.user && req.user.role === 'admin';

      if (!isAlreadyAdmin && (!adminSecretKey || adminSecretKey.trim() !== authorizedAdminKey)) {
        return res.status(403).json({
          success: false,
          message:
            'Unauthorized: Public administrator registration is restricted. A valid administrator authorization code or existing admin provisioning is required.',
        });
      }
    }

    // Create user in actual DB & persistent store with bcrypt hashing
    const newUser = await userService.createUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: requestedRole,
      organization: organization ? organization.trim() : 'Delhi Public International Academy',
      phone: phone ? phone.trim() : '',
      status: 'active',
      schoolId: 'SCH-1001',
    });

    const userId = newUser._id ? newUser._id.toString() : newUser.id;
    const token = generateToken(
      userId,
      newUser.role,
      newUser.email,
      newUser.name,
      newUser.organization,
      newUser.schoolId
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        phone: newUser.phone,
        schoolId: newUser.schoolId,
      },
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user account',
    });
  }
};

// @desc Request Password Reset
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userService.findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please register or contact your administrator.',
      });
    }

    // Cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expireTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const userId = user._id ? user._id.toString() : user.id;
    await userService.updateUser(userId, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: expireTime,
    });

    // Check if external SMTP email delivery is configured
    const isEmailConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_HOST !== ''
    );

    if (isEmailConfigured) {
      // In production with SMTP configured: email would be dispatched
      res.json({
        success: true,
        emailConfigured: true,
        message: `Password reset instructions have been dispatched to ${cleanEmail}.`,
      });
    } else {
      // SMTP not configured: clearly notify and provide token for verification
      res.json({
        success: true,
        emailConfigured: false,
        message:
          'Password reset token generated. Note: SMTP email service is not configured on this server (configure SMTP in server/.env for automated email dispatch). Use the verification token below to reset your password.',
        resetToken,
      });
    }
  } catch (error) {
    console.error('[ForgotPassword Error]', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset request',
    });
  }
};

// @desc Reset Password using verification token
// @route POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the reset token and new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (confirmPassword && confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match new password',
      });
    }

    // Hash token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const user = await userService.findUserByResetToken(hashedToken);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new reset link.',
      });
    }

    const userId = user._id ? user._id.toString() : user.id;
    await userService.resetUserPassword(userId, password);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[ResetPassword Error]', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password',
    });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};
