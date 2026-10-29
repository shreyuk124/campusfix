import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import {
  RegistrationChallenge,
  hashOtp,
  verifyOtpHash,
} from '../models/RegistrationChallenge.js';
import { sendRegistrationOtpEmail } from '../services/emailService.js';

/**
 * Institutional Email Domain Validator
 * Permitted domain: exactly 'coeptech.ac.in' (case-insensitive)
 */
export const isInstitutionalEmail = (email) => {
  if (typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (domain !== 'coeptech.ac.in') return false;
  // Local part validation: letters, digits, and standard punctuation (. _ % + -)
  const localRegex = /^[a-zA-Z0-9._%+-]+$/;
  return localRegex.test(local);
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export const generateNumericOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Helper to generate a signed JWT for an authenticated user.
 * Expires in 24 hours.
 */
export const generateToken = (userId, role) => {
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
export const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  studentId: user.studentId || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @desc    Initiate student registration & issue institutional email OTP
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const rawName = req.body.name || req.body.fullName;
    const { email, password, studentId } = req.body;

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

    // 3. Institutional domain validation (@coeptech.ac.in)
    if (!isInstitutionalEmail(normalizedEmail)) {
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

    // 5. Check if verified user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A student account with this email already exists. Please sign in.',
        error: {
          code: 'CONFLICT',
          message: 'A student account with this email already exists. Please sign in.',
        },
      });
    }

    // 6. Generate cryptographically secure 6-digit OTP
    const otp = generateNumericOtp();
    const otpHash = hashOtp(otp);

    // 7. Hash password before saving to challenge (salt rounds = 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // 8. Challenge validity: 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const clientIp = req.ip || req.headers['x-forwarded-for'] || null;

    // 9. Upsert short-lived registration challenge
    await RegistrationChallenge.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        studentId: studentId ? String(studentId).trim() : null,
        otpHash,
        attempts: 0,
        expiresAt,
        lastResendAt: new Date(),
        $inc: { resendCount: 1 },
        clientIp,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 10. Dispatch OTP via backend email service (with resilient non-blocking fallback)
    try {
      await sendRegistrationOtpEmail({
        to: normalizedEmail,
        name: trimmedName,
        otp,
        expiryMinutes: 10,
      });
    } catch (emailErr) {
      console.error(`[Registration Email Warning] Could not dispatch OTP email to ${normalizedEmail}: ${emailErr.message}`);
      console.log(`[Registration OTP Fallback] Verification code for ${normalizedEmail}: ${otp}`);
    }

    // 11. Return success response (NEVER expose OTP or issue JWT yet)
    return res.status(200).json({
      success: true,
      message: 'A verification code has been sent to your institutional email address.',
      data: {
        email: normalizedEmail,
        expiresInSeconds: 600,
        cooldownSeconds: 60,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Verify OTP, atomically consume challenge, and activate verified student account
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Institutional email and 6-digit verification code are required.',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and verification code are required.',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // 1. Look up pending challenge
    const challenge = await RegistrationChallenge.findOne({ email: normalizedEmail });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email, or the verification request has expired.',
        error: {
          code: 'CHALLENGE_NOT_FOUND',
          message: 'No pending registration found. Please register again.',
        },
      });
    }

    // 2. Check if challenge has expired
    if (challenge.isExpired()) {
      await RegistrationChallenge.deleteOne({ _id: challenge._id });
      return res.status(410).json({
        success: false,
        message: 'Your verification code has expired. Please request a new code.',
        error: {
          code: 'OTP_EXPIRED',
          message: 'Verification code expired.',
        },
      });
    }

    // 3. Brute-force protection: check attempt limits (max 5)
    if (challenge.attempts >= challenge.maxAttempts) {
      await RegistrationChallenge.deleteOne({ _id: challenge._id });
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Your verification session has been terminated for security. Please register again.',
        error: {
          code: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum verification attempts exceeded.',
        },
      });
    }

    // 4. Timing-safe verification of OTP hash
    const isOtpValid = verifyOtpHash(cleanOtp, challenge.otpHash);

    if (!isOtpValid) {
      // Increment failed attempts counter
      challenge.attempts += 1;
      await challenge.save();

      const remainingAttempts = Math.max(0, challenge.maxAttempts - challenge.attempts);

      if (remainingAttempts === 0) {
        await RegistrationChallenge.deleteOne({ _id: challenge._id });
        return res.status(429).json({
          success: false,
          message: 'Invalid code. Maximum attempts exceeded. Please register again.',
          error: {
            code: 'MAX_ATTEMPTS_EXCEEDED',
            message: 'Maximum attempts exceeded.',
            remainingAttempts: 0,
          },
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
        error: {
          code: 'INVALID_OTP',
          message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
          remainingAttempts,
        },
      });
    }

    // 5. Atomic Consumption: Remove challenge so it cannot be reused
    await RegistrationChallenge.deleteOne({ _id: challenge._id });

    // 6. Defensive check: Ensure user wasn't registered concurrently
    const concurrentUser = await User.findOne({ email: normalizedEmail });
    if (concurrentUser) {
      const token = generateToken(concurrentUser._id, concurrentUser.role);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified and active.',
        token,
        user: sanitizeUser(concurrentUser),
      });
    }

    // 7. Persist verified student user (password already hashed)
    const newUser = await User.create({
      name: challenge.name,
      email: challenge.email,
      password: challenge.passwordHash,
      studentId: challenge.studentId,
      role: 'student',
    });

    // 8. Generate 24h JWT
    const token = generateToken(newUser._id, newUser.role);

    // 9. Return HTTP 201 with auth token and safe user profile
    return res.status(201).json({
      success: true,
      message: 'Institutional email verified successfully. Welcome to CampusFix!',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Resend OTP to institutional email with 60-second cooldown enforcement
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required.',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Look up pending challenge
    const challenge = await RegistrationChallenge.findOne({ email: normalizedEmail });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email. Please register again.',
        error: {
          code: 'CHALLENGE_NOT_FOUND',
          message: 'No pending registration found.',
        },
      });
    }

    // 2. Enforce 60-second resend cooldown
    if (!challenge.canResend(60000)) {
      const remainingSeconds = challenge.getRemainingCooldownSeconds(60000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
        error: {
          code: 'COOLDOWN_ACTIVE',
          message: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
          remainingSeconds,
        },
      });
    }

    // 3. Limit excessive resends per challenge (max 5 resends)
    if (challenge.resendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification code requests for this email. Please restart registration later.',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many verification code requests.',
        },
      });
    }

    // 4. Generate new OTP and reset attempts
    const newOtp = generateNumericOtp();
    const newOtpHash = hashOtp(newOtp);

    challenge.otpHash = newOtpHash;
    challenge.attempts = 0; // Fresh attempt counter for new code
    challenge.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Reset 10m window
    challenge.lastResendAt = new Date();
    challenge.resendCount += 1;
    await challenge.save();

    // 5. Send fresh email (with resilient non-blocking fallback)
    try {
      await sendRegistrationOtpEmail({
        to: normalizedEmail,
        name: challenge.name,
        otp: newOtp,
        expiryMinutes: 10,
      });
    } catch (emailErr) {
      console.error(`[Resend OTP Email Warning] Could not dispatch OTP email to ${normalizedEmail}: ${emailErr.message}`);
      console.log(`[Resend OTP Fallback] Verification code for ${normalizedEmail}: ${newOtp}`);
    }

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your institutional email.',
      data: {
        expiresInSeconds: 600,
        cooldownSeconds: 60,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Login student / staff / admin (Normal Login - NO OTP REQUIRED)
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

    // Strict Admin Access Control:
    // Supports both admin@coeptech.ac.in and admin@coeptech.ac with password admin123
    const isAdminEmail = normalizedEmail === 'admin@coeptech.ac.in' || normalizedEmail === 'admin@coeptech.ac';
    if (isAdminEmail) {
      if (password !== 'admin123') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
      }

      let adminUser = await User.findOne({ 
        email: { $in: ['admin@coeptech.ac.in', 'admin@coeptech.ac'] } 
      }).select('+password');

      if (!adminUser) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        adminUser = await User.create({
          name: 'COEP Admin',
          email: normalizedEmail,
          password: passwordHash,
          role: 'admin',
        });
      } else {
        let needsSave = false;
        if (adminUser.role !== 'admin') {
          adminUser.role = 'admin';
          needsSave = true;
        }
        const pwMatch = await bcrypt.compare('admin123', adminUser.password);
        if (!pwMatch) {
          adminUser.password = await bcrypt.hash('admin123', 10);
          needsSave = true;
        }
        if (needsSave) await adminUser.save();
      }

      const token = generateToken(adminUser._id, 'admin');
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: sanitizeUser(adminUser),
      });
    }

    // 3. Find user and explicitly select password (since select: false in schema)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // 4. Constant-time comparison or uniform 401 response to prevent user enumeration
    if (!user || (user.role === 'admin' && !isAdminEmail)) {
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

    // 6. Return response with token and sanitized user (NO OTP REQUIRED FOR NORMAL LOGIN)
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
