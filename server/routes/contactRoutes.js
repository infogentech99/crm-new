import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact
} from '../controllers/contactController.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getContacts)
  .post(createContact);

router
  .route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

export default router;
