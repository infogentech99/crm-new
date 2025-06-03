import express from 'express';
import SendUserEmail from '../controllers/sendUseremailController.js';
const router = express.Router();
router.post('/send-email', SendUserEmail);
export default router;