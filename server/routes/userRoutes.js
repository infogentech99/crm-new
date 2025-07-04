import express from 'express';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserActivities      
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.use(protect);

router.get(
  '/',
  authorize('accounts', 'superadmin','salesperson','admin'),
  getUsers
);

router.post(
  '/',
  authorize('superadmin', 'accounts'),
  createUser
);

router.get(
  '/:id',
  authorize('accounts', 'superadmin'),
  getUserById
);

router.put(
  '/:id',
  authorize('superadmin'),
  updateUser
);

router.delete(
  '/:id',
  authorize('superadmin'),
  deleteUser
);

router.get(
  '/:id/activities',
  authorize('accounts', 'superadmin'),
  getUserActivities
);

export default router;
