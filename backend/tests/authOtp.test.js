/**
 * backend/tests/authOtp.test.js
 * 
 * Comprehensive Unit and Integration Tests for:
 * - Institutional Email Domain Validation (@coeptech.ac.in)
 * - Cryptographic OTP Generation & HMAC Hashing
 * - Registration Challenge Lifecycle, Expiry & Cooldown
 * - Brute-Force & Attempt Limit Enforcement
 * - 60-Second Resend Cooldown
 * - Single-Use OTP & Replay Defense
 * - Zero Token Leakage Before Verification
 * - Account Creation & JWT Authentication Post-Verification
 * - Unchanged Normal Login Without OTP
 * - Full Controller Flow Mocks (Register, Verify, Resend, Login)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  isInstitutionalEmail,
  generateNumericOtp,
  generateToken,
  sanitizeUser,
  register,
  verifyEmail,
  resendOtp,
  login,
} from '../src/controllers/authController.js';
import {
  RegistrationChallenge,
  hashOtp,
  verifyOtpHash,
} from '../src/models/RegistrationChallenge.js';
import { User } from '../src/models/User.js';
import { mockMailInbox, clearMockMailInbox } from '../src/services/emailService.js';

// Setup environment secrets for test execution
process.env.JWT_SECRET = 'test_jwt_secret_campusfix_2026';
process.env.OTP_SECRET = 'test_otp_secret_campusfix_2026';
process.env.NODE_ENV = 'test';

// Mock Express Request & Response helper
function createMockHttp(reqOverrides = {}) {
  const req = {
    body: {},
    query: {},
    params: {},
    headers: {},
    ip: '127.0.0.1',
    ...reqOverrides,
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return { req, res };
}

describe('1. Institutional Email Validation (@coeptech.ac.in)', () => {
  it('accepts valid institutional email addresses', () => {
    assert.equal(isInstitutionalEmail('student@coeptech.ac.in'), true);
    assert.equal(isInstitutionalEmail('Student.Name@coeptech.ac.in'), true);
    assert.equal(isInstitutionalEmail('shimbress25.comp@coeptech.ac.in'), true);
    assert.equal(isInstitutionalEmail('alex+tag@coeptech.ac.in'), true);
  });

  it('rejects external or unapproved email domains', () => {
    assert.equal(isInstitutionalEmail('student@gmail.com'), false);
    assert.equal(isInstitutionalEmail('student@yahoo.co.in'), false);
    assert.equal(isInstitutionalEmail('student@coep.ac.in'), false); // Strict @coeptech.ac.in requirement
  });

  it('rejects domain spoofing, subdomain attacks and suffix manipulation', () => {
    assert.equal(isInstitutionalEmail('student@fakecoeptech.ac.in'), false);
    assert.equal(isInstitutionalEmail('student@coeptech.ac.in.attacker.com'), false);
    assert.equal(isInstitutionalEmail('student@attacker-coeptech.ac.in'), false);
    assert.equal(isInstitutionalEmail('@coeptech.ac.in'), false);
  });

  it('rejects non-string and malformed inputs', () => {
    assert.equal(isInstitutionalEmail(''), false);
    assert.equal(isInstitutionalEmail(null), false);
    assert.equal(isInstitutionalEmail(undefined), false);
    assert.equal(isInstitutionalEmail(12345), false);
    assert.equal(isInstitutionalEmail('invalid-string-without-at'), false);
  });
});

describe('2. Secure OTP Generation and HMAC Verification', () => {
  it('generates a 6-digit numeric OTP', () => {
    for (let i = 0; i < 50; i++) {
      const otp = generateNumericOtp();
      assert.equal(typeof otp, 'string');
      assert.equal(otp.length, 6);
      assert.match(otp, /^\d{6}$/);
      const num = parseInt(otp, 10);
      assert.ok(num >= 100000 && num <= 999999);
    }
  });

  it('verifies correct OTP with timing-safe HMAC comparison', () => {
    const otp = '839201';
    const storedHash = hashOtp(otp);

    assert.equal(verifyOtpHash(otp, storedHash), true);
    assert.equal(verifyOtpHash('839202', storedHash), false);
    assert.equal(verifyOtpHash('000000', storedHash), false);
    assert.equal(verifyOtpHash('', storedHash), false);
    assert.equal(verifyOtpHash(null, storedHash), false);
  });

  it('produces distinct HMAC hashes for distinct OTPs', () => {
    const hash1 = hashOtp('111111');
    const hash2 = hashOtp('111112');
    assert.notEqual(hash1, hash2);
  });
});

describe('3. Registration Challenge Model Logic', () => {
  it('detects expiration correctly', () => {
    const unexpired = {
      expiresAt: new Date(Date.now() + 600000), // +10m
      isExpired() {
        return new Date() > this.expiresAt;
      },
    };
    assert.equal(unexpired.isExpired(), false);

    const expired = {
      expiresAt: new Date(Date.now() - 1000), // -1s
      isExpired() {
        return new Date() > this.expiresAt;
      },
    };
    assert.equal(expired.isExpired(), true);
  });

  it('enforces 60-second cooldown on resend attempts', () => {
    const now = Date.now();
    const challengeUnderCooldown = {
      lastResendAt: new Date(now - 30000), // 30s ago
      canResend(cd = 60000) {
        return Date.now() - new Date(this.lastResendAt).getTime() >= cd;
      },
      getRemainingCooldownSeconds(cd = 60000) {
        const elapsed = Date.now() - new Date(this.lastResendAt).getTime();
        return Math.max(0, Math.ceil((cd - elapsed) / 1000));
      },
    };

    assert.equal(challengeUnderCooldown.canResend(), false);
    assert.ok(challengeUnderCooldown.getRemainingCooldownSeconds() > 0);

    const challengeReadyForResend = {
      lastResendAt: new Date(now - 65000), // 65s ago
      canResend(cd = 60000) {
        return Date.now() - new Date(this.lastResendAt).getTime() >= cd;
      },
      getRemainingCooldownSeconds(cd = 60000) {
        const elapsed = Date.now() - new Date(this.lastResendAt).getTime();
        return Math.max(0, Math.ceil((cd - elapsed) / 1000));
      },
    };

    assert.equal(challengeReadyForResend.canResend(), true);
    assert.equal(challengeReadyForResend.getRemainingCooldownSeconds(), 0);
  });
});

describe('4. Email Service & Delivery Isolation', () => {
  beforeEach(() => {
    clearMockMailInbox();
  });

  it('records outgoing registration email in mock transport without real network dispatch', async () => {
    const { sendRegistrationOtpEmail } = await import('../src/services/emailService.js');

    const result = await sendRegistrationOtpEmail({
      to: 'priya.sharma@coeptech.ac.in',
      name: 'Priya Sharma',
      otp: '729104',
      expiryMinutes: 10,
    });

    assert.equal(result.success, true);
    assert.equal(mockMailInbox.length, 1);
    assert.equal(mockMailInbox[0].to, 'priya.sharma@coeptech.ac.in');
    assert.match(mockMailInbox[0].subject, /729104/);
    assert.match(mockMailInbox[0].html, /729104/);
    assert.match(mockMailInbox[0].text, /729104/);
  });
});

describe('5. JWT Tokens & User Sanitization', () => {
  it('generates valid 24h JWT containing user id and role', () => {
    const token = generateToken('usr-12345', 'student');
    assert.ok(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(decoded.id, 'usr-12345');
    assert.equal(decoded.role, 'student');
    assert.ok(decoded.exp > decoded.iat);
  });

  it('sanitizes user profile and strips password hash', () => {
    const rawUser = {
      _id: '67b001a1c928410294827102',
      name: 'Priya Sharma',
      email: 'priya.sharma@coeptech.ac.in',
      password: '$2b$10$e7pQ5iH0...secretpasswordhash',
      role: 'student',
      studentId: '112103045',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitized = sanitizeUser(rawUser);
    assert.equal(sanitized._id, rawUser._id);
    assert.equal(sanitized.name, rawUser.name);
    assert.equal(sanitized.email, rawUser.email);
    assert.equal(sanitized.role, 'student');
    assert.equal(sanitized.studentId, '112103045');
    assert.equal(sanitized.password, undefined); // Never expose password
  });
});

describe('6. Controller Flow: Register Endpoint', () => {
  beforeEach(() => {
    clearMockMailInbox();
  });

  it('rejects registration with missing required fields (400)', async () => {
    const { req, res } = createMockHttp({ body: { name: 'Alex' } });
    await register(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /required/i);
  });

  it('rejects registration with non-institutional email domain (400)', async () => {
    const { req, res } = createMockHttp({
      body: {
        name: 'Alex Sharma',
        email: 'alex@gmail.com',
        password: 'Password123!',
      },
    });
    await register(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /coeptech\.ac\.in/i);
  });

  it('rejects registration with short password (400)', async () => {
    const { req, res } = createMockHttp({
      body: {
        name: 'Alex Sharma',
        email: 'alex.sharma@coeptech.ac.in',
        password: '123',
      },
    });
    await register(req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /at least 6 characters/i);
  });

  it('rejects registration when user already exists (409)', async () => {
    const originalFindOne = User.findOne;
    User.findOne = async () => ({ _id: 'usr-existing-01', email: 'existing@coeptech.ac.in' });

    try {
      const { req, res } = createMockHttp({
        body: {
          name: 'Existing User',
          email: 'existing@coeptech.ac.in',
          password: 'Password123!',
        },
      });
      await register(req, res, () => {});
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already exists/i);
    } finally {
      User.findOne = originalFindOne;
    }
  });

  it('successfully creates registration challenge and dispatches OTP email without returning OTP or JWT', async () => {
    const originalUserFindOne = User.findOne;
    const originalChallengeFindOneAndUpdate = RegistrationChallenge.findOneAndUpdate;

    let upsertPayload = null;
    User.findOne = async () => null;
    RegistrationChallenge.findOneAndUpdate = async (filter, update) => {
      upsertPayload = update;
      return { email: filter.email };
    };

    try {
      const { req, res } = createMockHttp({
        body: {
          name: 'Sarthak Shimbre',
          email: 'shimbress25.comp@coeptech.ac.in',
          password: 'SecurePassword123!',
          studentId: '112103099',
        },
      });

      await register(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.token, undefined); // ZERO token leakage before verification
      assert.equal(res.body.otp, undefined); // ZERO OTP leakage in response
      assert.equal(res.body.data.email, 'shimbress25.comp@coeptech.ac.in');
      assert.equal(res.body.data.expiresInSeconds, 600);
      assert.equal(res.body.data.cooldownSeconds, 60);

      // Verify email was dispatched in mock transport
      assert.equal(mockMailInbox.length, 1);
      assert.equal(mockMailInbox[0].to, 'shimbress25.comp@coeptech.ac.in');

      // Verify challenge password was securely hashed (not plaintext)
      assert.notEqual(upsertPayload.passwordHash, 'SecurePassword123!');
      assert.ok(upsertPayload.passwordHash.startsWith('$2'));
      assert.equal(upsertPayload.studentId, '112103099');
    } finally {
      User.findOne = originalUserFindOne;
      RegistrationChallenge.findOneAndUpdate = originalChallengeFindOneAndUpdate;
    }
  });
});

describe('7. Controller Flow: Verify Email & Account Activation', () => {
  it('rejects verification if challenge is not found (404)', async () => {
    const originalFindOne = RegistrationChallenge.findOne;
    RegistrationChallenge.findOne = async () => null;

    try {
      const { req, res } = createMockHttp({
        body: { email: 'unknown@coeptech.ac.in', otp: '123456' },
      });
      await verifyEmail(req, res, () => {});
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /No pending registration/i);
    } finally {
      RegistrationChallenge.findOne = originalFindOne;
    }
  });

  it('rejects verification if challenge has expired (410)', async () => {
    const originalFindOne = RegistrationChallenge.findOne;
    const originalDeleteOne = RegistrationChallenge.deleteOne;

    let deleted = false;
    RegistrationChallenge.findOne = async () => ({
      _id: 'ch-expired-01',
      isExpired: () => true,
    });
    RegistrationChallenge.deleteOne = async () => { deleted = true; };

    try {
      const { req, res } = createMockHttp({
        body: { email: 'expired@coeptech.ac.in', otp: '123456' },
      });
      await verifyEmail(req, res, () => {});
      assert.equal(res.statusCode, 410);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /expired/i);
      assert.equal(deleted, true);
    } finally {
      RegistrationChallenge.findOne = originalFindOne;
      RegistrationChallenge.deleteOne = originalDeleteOne;
    }
  });

  it('decrements remaining attempts on incorrect OTP and denies access (400)', async () => {
    const originalFindOne = RegistrationChallenge.findOne;

    const mockChallenge = {
      _id: 'ch-attempt-01',
      email: 'test@coeptech.ac.in',
      otpHash: hashOtp('999999'),
      attempts: 1,
      maxAttempts: 5,
      isExpired: () => false,
      save: async function () {},
    };

    RegistrationChallenge.findOne = async () => mockChallenge;

    try {
      const { req, res } = createMockHttp({
        body: { email: 'test@coeptech.ac.in', otp: '000000' },
      });
      await verifyEmail(req, res, () => {});
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(mockChallenge.attempts, 2);
      assert.match(res.body.message, /3 attempt\(s\) remaining/i);
    } finally {
      RegistrationChallenge.findOne = originalFindOne;
    }
  });

  it('locks out and deletes challenge after 5 failed attempts (429)', async () => {
    const originalFindOne = RegistrationChallenge.findOne;
    const originalDeleteOne = RegistrationChallenge.deleteOne;

    let challengeDeleted = false;
    const mockChallenge = {
      _id: 'ch-bruteforce-01',
      email: 'brute@coeptech.ac.in',
      otpHash: hashOtp('999999'),
      attempts: 4,
      maxAttempts: 5,
      isExpired: () => false,
      save: async function () {},
    };

    RegistrationChallenge.findOne = async () => mockChallenge;
    RegistrationChallenge.deleteOne = async () => { challengeDeleted = true; };

    try {
      const { req, res } = createMockHttp({
        body: { email: 'brute@coeptech.ac.in', otp: '000000' },
      });
      await verifyEmail(req, res, () => {});
      assert.equal(res.statusCode, 429);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Maximum attempts exceeded/i);
      assert.equal(challengeDeleted, true);
    } finally {
      RegistrationChallenge.findOne = originalFindOne;
      RegistrationChallenge.deleteOne = originalDeleteOne;
    }
  });

  it('successfully verifies OTP, deletes challenge atomically, and creates verified student with 24h JWT (201)', async () => {
    const originalChallengeFindOne = RegistrationChallenge.findOne;
    const originalChallengeDeleteOne = RegistrationChallenge.deleteOne;
    const originalUserFindOne = User.findOne;
    const originalUserCreate = User.create;

    let challengePurged = false;
    let userCreatedPayload = null;

    const correctOtp = '654321';
    const mockChallenge = {
      _id: 'ch-success-01',
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@coeptech.ac.in',
      passwordHash: '$2b$10$hashedpwstringexample',
      studentId: '112103112',
      otpHash: hashOtp(correctOtp),
      attempts: 0,
      maxAttempts: 5,
      isExpired: () => false,
    };

    RegistrationChallenge.findOne = async () => mockChallenge;
    RegistrationChallenge.deleteOne = async () => { challengePurged = true; };
    User.findOne = async () => null; // No duplicate user
    User.create = async (payload) => {
      userCreatedPayload = payload;
      return {
        _id: 'usr-new-student-88',
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    };

    try {
      const { req, res } = createMockHttp({
        body: {
          email: 'rohan.deshmukh@coeptech.ac.in',
          otp: correctOtp,
        },
      });

      await verifyEmail(req, res, () => {});

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(challengePurged, true); // Atomic single-use consumption
      assert.ok(res.body.token); // Signed JWT issued
      assert.equal(res.body.user.email, 'rohan.deshmukh@coeptech.ac.in');
      assert.equal(res.body.user.role, 'student');
      assert.equal(userCreatedPayload.password, '$2b$10$hashedpwstringexample');

      // Verify JWT claims
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      assert.equal(decoded.id, 'usr-new-student-88');
      assert.equal(decoded.role, 'student');
    } finally {
      RegistrationChallenge.findOne = originalChallengeFindOne;
      RegistrationChallenge.deleteOne = originalChallengeDeleteOne;
      User.findOne = originalUserFindOne;
      User.create = originalUserCreate;
    }
  });
});

describe('8. Controller Flow: Resend OTP & Cooldown Enforcement', () => {
  beforeEach(() => {
    clearMockMailInbox();
  });

  it('rejects resend if cooldown is active (429)', async () => {
    const originalFindOne = RegistrationChallenge.findOne;
    const mockChallenge = {
      email: 'active@coeptech.ac.in',
      canResend: () => false,
      getRemainingCooldownSeconds: () => 42,
    };

    RegistrationChallenge.findOne = async () => mockChallenge;

    try {
      const { req, res } = createMockHttp({
        body: { email: 'active@coeptech.ac.in' },
      });
      await resendOtp(req, res, () => {});
      assert.equal(res.statusCode, 429);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /42 seconds/);
    } finally {
      RegistrationChallenge.findOne = originalFindOne;
    }
  });

  it('permits resend after cooldown, issues new OTP, resets attempts, and updates timestamp', async () => {
    const originalFindOne = RegistrationChallenge.findOne;

    let saved = false;
    const mockChallenge = {
      name: 'Tanvi Joshi',
      email: 'tanvi.joshi@coeptech.ac.in',
      otpHash: hashOtp('111111'),
      attempts: 3,
      resendCount: 1,
      canResend: () => true,
      save: async function () { saved = true; },
    };

    RegistrationChallenge.findOne = async () => mockChallenge;

    try {
      const { req, res } = createMockHttp({
        body: { email: 'tanvi.joshi@coeptech.ac.in' },
      });

      await resendOtp(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(saved, true);
      assert.equal(mockChallenge.attempts, 0); // Reset attempts counter
      assert.equal(mockChallenge.resendCount, 2);

      // Verify email was sent with new OTP
      assert.equal(mockMailInbox.length, 1);
      assert.equal(mockMailInbox[0].to, 'tanvi.joshi@coeptech.ac.in');
    } finally {
      RegistrationChallenge.findOne = originalFindOne;
    }
  });
});

describe('9. Normal Login: Zero OTP Requirement Preserved', () => {
  it('allows verified student to log in directly with email & password without triggering OTP', async () => {
    const originalFindOne = User.findOne;
    const plainPassword = 'StudentPassword123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const mockUser = {
      _id: 'usr-verified-419',
      name: 'Alex Sharma',
      email: 'alex.sharma@coeptech.ac.in',
      password: passwordHash,
      role: 'student',
      comparePassword: async (candidate) => bcrypt.compare(candidate, passwordHash),
    };

    User.findOne = () => ({
      select: async () => mockUser,
    });

    try {
      clearMockMailInbox();
      const { req, res } = createMockHttp({
        body: {
          email: 'alex.sharma@coeptech.ac.in',
          password: plainPassword,
        },
      });

      await login(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token); // Direct JWT issued
      assert.equal(res.body.user.email, 'alex.sharma@coeptech.ac.in');
      assert.equal(mockMailInbox.length, 0); // CRITICAL: NO OTP email sent on normal login!
    } finally {
      User.findOne = originalFindOne;
    }
  });
});
