import { Router } from 'express';
import { register, login, getProfile, logout } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;
