import mongoose from 'mongoose';

const QuotationSchema = new mongoose.Schema({
  lead:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  items:      [{ description: String, unitPrice: Number, quantity: Number }],
  terms:      String,
  fileUrl:    String,
  status:     { type: String, enum: ['quotation_submitted','quotation_rejected','quotation_approved'], default: 'quotation_submitted' }
}, { timestamps: true });

const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
export default Quotation;
