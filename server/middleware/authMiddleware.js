import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'anksetu_super_secret_jwt_key_2026_school_management'
      );

      // Fetch user from DB or persistent store
      const user = await userService.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('[Auth Middleware] Invalid/Expired Token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, no authentication token provided',
  });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
