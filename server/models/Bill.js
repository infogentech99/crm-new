import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  description: String,
  hsnCode: String,
  amount: Number,
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
