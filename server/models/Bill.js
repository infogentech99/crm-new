import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  description: String,
  hsnCode:     String,
  amount:      Number,
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);
