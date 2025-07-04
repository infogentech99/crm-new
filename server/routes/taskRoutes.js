import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatusSummary,
  getTasksDueSummary
} from '../controllers/taskController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Roles allowed across task endpoints
const TASK_ROLES = ['superadmin', 'admin', 'salesperson', 'employee'];

// List and create tasks
router
  .route('/')
  .get(protect, authorize(...TASK_ROLES), getAllTasks)
  .post(protect, authorize(...TASK_ROLES), createTask);

// Summary for tasks due
router.get(
  '/summary/due',
  protect,
  authorize(...TASK_ROLES),
  getTasksDueSummary
);

// Task status summary
router.get(
  '/summary/status',
  protect,
  authorize(...TASK_ROLES),
  getTaskStatusSummary
);

// Individual task operations
router
  .route('/:id')
  .get(protect, authorize(...TASK_ROLES), getTask)
  .put(protect, authorize(...TASK_ROLES), updateTask)
  .patch(protect, authorize(...TASK_ROLES), updateTask)
  .delete(protect, authorize(...TASK_ROLES), deleteTask);

export default router;
