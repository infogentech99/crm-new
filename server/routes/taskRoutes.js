import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import authorize

const router = express.Router();

router
  .route('/')
  .get(protect, authorize(['superadmin','admin', 'manager', 'employee']), getAllTasks) // Add authorize
  .post(protect, authorize(['superadmin','admin', 'manager', 'employee']), createTask); // Add authorize

router
  .route('/:id')
  .get(protect, authorize(['superadmin','admin', 'manager', 'employee']), getTask) // Add authorize
  .put(protect, authorize(['superadmin','admin', 'manager']), updateTask) // Add authorize
  .patch(protect, authorize(['superadmin','admin', 'manager']), updateTask) // Add authorize
  .delete(protect, authorize(['superadmin','admin', 'manager']), deleteTask); // Add authorize

export default router;
