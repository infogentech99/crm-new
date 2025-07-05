import mongoose from 'mongoose';
import Counter from './Counter.js';

const QuotationSchema = new mongoose.Schema({
  _id: { type: String },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  projectId: { type: String, required: false }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  totals: {
    taxable: Number,
    igst: Number,
    total: Number
  }
}, { timestamps: true });

QuotationSchema.pre('save', async function (next) {
  const quotation = this;
  if (quotation.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'quotation' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    quotation._id = `QT${String(counter.seq).padStart(3, '0')}`; 
  }
  next();
});

const Quotation = mongoose.model('Quotation', QuotationSchema);
export default Quotation;
