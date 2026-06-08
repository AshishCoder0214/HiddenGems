import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { registerSchema, loginSchema } from '../middleware/validationSchemas.js';

const router = express.Router();

router.post('/auth/register', validate(registerSchema), registerUser);
router.post('/auth/login', validate(loginSchema), loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
