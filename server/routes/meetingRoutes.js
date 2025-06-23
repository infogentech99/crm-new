import express from 'express';
import {
  getAllMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meetingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Import authorize

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('superadmin','admin', 'salesperson', 'employee'), getAllMeetings) // Add authorize
  .post(protect, authorize('superadmin','admin', 'salesperson', 'employee'), createMeeting); // Add authorize

router
  .route('/:id')
  .get(protect, authorize('superadmin','admin', 'salesperson', 'employee'), getMeeting) // Add authorize
  .put(protect, authorize('superadmin','admin', 'salesperson'), updateMeeting) // Add authorize
  .patch(protect, authorize('superadmin','admin', 'salesperson'), updateMeeting) // Add authorize
  .delete(protect, authorize('superadmin','admin', 'salesperson'), deleteMeeting); // Add authorize

export default router;
