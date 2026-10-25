// TEMP: Development-only authentication adapter for Part 4 testing.
// NOTE: When Member 1 lands authMiddleware.js, delete this file and swap in the real JWT auth.

import crypto from 'crypto';

const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Development middleware to populate req.user from headers when running in non-production.
 * In production, header-based role spoofing is strictly prohibited.
 */
export const tempAuth = (req, res, next) => {
  // If already authenticated by another middleware, preserve it
  if (req.user) {
    return next();
  }

  // Disallow header-based authentication in production environment
  if (process.env.NODE_ENV === 'production') {
    return next();
  }

  const roleHeader = req.headers['x-user-role'];
  const userIdHeader = req.headers['x-user-id'];

  // Role can only be 'student' or 'admin'. Defaults to 'student' to fail closed.
  const role = roleHeader === 'admin' ? 'admin' : 'student';

  const userId =
    userIdHeader && isValidObjectId(userIdHeader)
      ? userIdHeader
      : crypto.randomBytes(12).toString('hex');

  req.user = {
    _id: userId,
    role,
  };

  next();
};

/**
 * Route guard enforcing administrator role.
 * Responds with 403 Forbidden if the user is a student or not an admin.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied. Administrator role required.',
      },
    });
  }

  next();
};
