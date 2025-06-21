// File: server/routes/userRoutes.js

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

// Middleware: if not superadmin, redirect them
const redirectIfNotSuperadmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    // this will send a 302 redirect to your front-end at /dashboard
    return res.redirect('/dashboard');
  }
  next();
};

// All /api/users routes need a valid token
router.use(protect);

// GET /api/users  
// • superadmin → getUsers()
// • others      → HTTP 302 → /dashboard
router.get(
  '/',
  redirectIfNotSuperadmin,
  getUsers
);

// POST /api/users       — superadmin only (403 otherwise)
router.post(
  '/',
  authorize(['superadmin']),
  createUser
);

// GET/PUT/DELETE /api/users/:id — superadmin only
router
  .route('/:id')
  .all(authorize(['superadmin']))
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// GET /api/users/:id/activities — superadmin only
router.get(
  '/:id/activities',
  authorize(['superadmin']),
  getUserActivities
);

export default router;
