import express from 'express';
import { register, login, getUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getUser);


export default router;
