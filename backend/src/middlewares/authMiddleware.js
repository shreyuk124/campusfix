import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Protect Middleware
 * Intercepts Bearer token from authorization header, validates it, and attaches req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. No token provided.',
      },
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretjwtkey_campusfix_dev'
    );

    // Look up user in database (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The user belonging to this token no longer exists.',
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token. Please log in again.',
      },
    });
  }
};

/**
 * Role-based Access Control Guard (e.g. restrictTo('staff', 'admin'))
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Role '${req.user?.role || 'anonymous'}' is not authorized to access this resource.`,
        },
      });
    }
    next();
  };
};

/**
 * Optional Auth Middleware
 * If a valid Bearer token is provided, attaches req.user without rejecting unauthenticated requests
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretjwtkey_campusfix_dev'
    );
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch {
    // Continue unauthenticated if token is invalid or expired
  }
  next();
};

export default protect;
