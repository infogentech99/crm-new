import mongoose from 'mongoose';
import Counter from './Counter.js'; 

const InvoiceSchema = new mongoose.Schema({
  _id: { type: String }, 
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  totals: {
    taxable: Number,
    igst: Number,
    total: Number
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft'
  },
  projectId: { type: String }, 
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

 InvoiceSchema.pre('save', async function (next) {
  const invoice = this;
  if (invoice.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'invoice' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    invoice._id = `IN${String(counter.seq).padStart(3, '0')}`; 
  }
  next();
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);
export default Invoice;
