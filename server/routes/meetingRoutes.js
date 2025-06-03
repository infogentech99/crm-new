import express from 'express';
import {
  getAllMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meetingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllMeetings)
  .post(createMeeting);

router
  .route('/:id')
  .get(getMeeting)
  .put(updateMeeting)
  .patch(updateMeeting)
  .delete(deleteMeeting);


export default router;
