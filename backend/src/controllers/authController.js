import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const COEP_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@coeptech\.ac\.in$/;

/**
 * Helper to generate a signed JWT for an authenticated user.
 * Expires in 24 hours.
 */
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );
};

/**
 * Helper to return a safe user profile without sensitive fields.
 */
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @desc    Register a new student
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const rawName = req.body.name || req.body.fullName;
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!rawName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required.',
        },
      });
    }

    // 2. Normalize inputs
    const trimmedName = rawName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Domain validation (@coeptech.ac.in)
    if (!COEP_EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Only official college email addresses (@coeptech.ac.in) are permitted.',
        error: {
          code: 'INVALID_EMAIL_DOMAIN',
          message: 'Only official college email addresses (@coeptech.ac.in) are permitted.',
        },
      });
    }

    // 4. Password minimum length check
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 6 characters long.',
        },
      });
    }

    // 5. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A student account with this email already exists.',
        error: {
          code: 'CONFLICT',
          message: 'A student account with this email already exists.',
        },
      });
    }

    // 6. Hash password with bcrypt salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Persist user with enforced default role 'student' (ignore client role input)
    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
    });

    // 8. Generate 24h JWT
    const token = generateToken(newUser._id, newUser.role);

    // 9. Return HTTP 201 with token and safe sanitized user object
    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    // Pass duplicate-key error or others to centralized error handler
    return next(error);
  }
};

/**
 * @desc    Login student
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required.',
        },
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user and explicitly select password (since select: false in schema)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // 4. Constant-time comparison or uniform 401 response to prevent user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    // 5. Generate 24h JWT
    const token = generateToken(user._id, user.role);

    // 6. Return response with token and sanitized user
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get currently logged in student profile
 * @route   GET /api/v1/auth/me
 * @access  Private (Requires JWT token)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to access this resource.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    return next(error);
  }
};
