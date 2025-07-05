import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    invoice: {
      type: String,
      ref: 'Invoice',
      required: true
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId :{
      type: String,
    },
     projectId :{
      type: String,
    },
    projectTitle: {
      type: String,
    },
    method: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Other'],
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },

     createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;
