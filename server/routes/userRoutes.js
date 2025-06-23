

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
  getUsers
);

router.post(
  '/',
  authorize(['superadmin']),
  createUser
);

router
  .route('/:id')
  .all(authorize(['superadmin']))
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);
router.get(
  '/:id/activities',
  authorize(['superadmin']),
  getUserActivities
);

export default router;
