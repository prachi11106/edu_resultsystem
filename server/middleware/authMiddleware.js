import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anksetu_super_secret_jwt_key_2026_school_management');

      // Attach user from database if DB available, otherwise attached decoded user payload
      try {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        } else {
          req.user = decoded;
        }
      } catch {
        req.user = decoded;
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware] Invalid Token:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  // Demo / fallback mode for development testing if authorization header is absent or mock token used
  if (process.env.NODE_ENV === 'development' && req.headers['x-demo-user']) {
    req.user = {
      id: 'demo-teacher-01',
      name: 'Demo Teacher',
      email: 'teacher@anksetu.edu',
      role: req.headers['x-demo-role'] || 'teacher',
    };
    return next();
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no authentication token provided' });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
