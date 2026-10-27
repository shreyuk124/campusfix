import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * RegistrationChallenge Schema
 * Short-lived challenge collection for institutional email OTP registration.
 * Expired challenges are automatically purged by MongoDB via TTL index.
 */
const registrationChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    studentId: {
      type: String,
      trim: true,
      default: null,
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    lastResendAt: {
      type: Date,
      default: Date.now,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    clientIp: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// MongoDB TTL index: automatically purges documents when expiresAt is reached
registrationChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Helper to compute HMAC-SHA256 of OTP using server-side secret
 */
export const hashOtp = (otp) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'campusfix_otp_secret_fallback';
  return crypto.createHmac('sha256', secret).update(String(otp).trim()).digest('hex');
};

/**
 * Helper to verify an entered OTP against a stored HMAC hash using timing-safe comparison
 */
export const verifyOtpHash = (enteredOtp, storedHash) => {
  if (!enteredOtp || !storedHash) return false;
  const enteredHash = hashOtp(enteredOtp);
  if (enteredHash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(enteredHash, 'utf8'),
    Buffer.from(storedHash, 'utf8')
  );
};

/**
 * Instance method: Check if challenge has expired
 */
registrationChallengeSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

/**
 * Instance method: Check if resend cooldown has elapsed (60 seconds)
 */
registrationChallengeSchema.methods.canResend = function (cooldownMs = 60000) {
  if (!this.lastResendAt) return true;
  return Date.now() - new Date(this.lastResendAt).getTime() >= cooldownMs;
};

/**
 * Instance method: Remaining cooldown seconds before resend is allowed
 */
registrationChallengeSchema.methods.getRemainingCooldownSeconds = function (cooldownMs = 60000) {
  if (!this.lastResendAt) return 0;
  const elapsed = Date.now() - new Date(this.lastResendAt).getTime();
  const remaining = Math.max(0, Math.ceil((cooldownMs - elapsed) / 1000));
  return remaining;
};

export const RegistrationChallenge =
  mongoose.models.RegistrationChallenge ||
  mongoose.model('RegistrationChallenge', registrationChallengeSchema);

export default RegistrationChallenge;
