import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import leadImportRoutes from './routes/leadImport.js';
import meetingRoutes from './routes/meetingRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import newQuotationRoutes from './routes/newQuotationRoutes.js';
import BillRoutes from './routes/billRoutes.js';
import EmailRoutes from './routes/emailRoutes.js';
import EmailUserRoutes from './routes/EmailUserRoutes.js';

connectDB();

const app = express();
app.use(express.json({ limit: '50mb' }));
const allowedOrigins = [
  process.env.DEV_CLIENT || 'http://localhost:3000',
  process.env.PROD_CLIENT || 'https://crm.globallysolution.com',
  'https://crm.globallysolution.com'
];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     callback(new Error(`CORS policy: Origin ${origin} not allowed`));
//   },
//   credentials: true,
// }));

app.use(cors({
  origin: 'http://localhost:3000',   // your React app’s URL
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true
}));


app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'server', 'uploads'))
);
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/leads', leadImportRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quotations', newQuotationRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/bills', BillRoutes);
app.use('/api', EmailRoutes);
app.use('/api', EmailUserRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
});

