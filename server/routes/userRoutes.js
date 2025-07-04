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
  authorize( 'superadmin','salesperson','admin'),
  getUsers
);

router.post(
  '/',
  authorize('superadmin'),
  createUser
);

router.get(
  '/:id',
  authorize( 'superadmin'),
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
  authorize( 'superadmin'),
  getUserActivities
);

export default router;
