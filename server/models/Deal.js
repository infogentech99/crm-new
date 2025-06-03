import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  value:  { type: Number },
  status: { type: String, default: 'open' },
  lead:   { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }
}, { timestamps: true });

export default mongoose.model('Deal', dealSchema);