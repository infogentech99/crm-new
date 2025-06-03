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
const check = (res,req,next) =>{
  next();
}
router.use(protect);

router.route('/').get(getUsers);

router.use(authorize('superadmin'));

router.route('/').post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.get('/:id/activities', check, getUserActivities);

export default router;
