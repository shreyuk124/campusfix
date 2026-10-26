import { Router } from 'express';
import {
  register,
  verifyEmail,
  resendOtp,
  login,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', login);

// Protected Authentication Endpoints
router.get('/me', protect, getMe);

export default router;
