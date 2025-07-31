import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
} from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import {
  authRateLimit,
  passwordResetRateLimit,
  emailVerificationRateLimit,
} from '../middleware/rateLimit';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/forgot-password', passwordResetRateLimit, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);
router.post(
  '/resend-verification',
  authenticateToken,
  emailVerificationRateLimit,
  resendVerificationEmail
);

export default router;
