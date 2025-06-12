import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phone:     { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company:   String,
  jobTitle:  String,
  description: String,
  position:  String,
  address:   String,
  city:      String,
  state:     String,
  country:   String,
  zipCode:   String,
  website:   String,
  linkedIn:  String,
  source:    { type: String, enum: ['Website','Referral','LinkedIn','Cold Call'], default: 'Website' },
  industry:  { type: String, enum: ['IT','Retail','Manufacturing','Other'], default: 'Other' },
  notes: [
  {
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
    }
  }
],

  status:    {
    type: String,
    enum: [
      'pending_approval','denied','approved',
      'quotation_submitted','quotation_rejected','quotation_approved',
      'invoice_issued','invoice_accepted','completed',  'processing_payments', 
      'new','contacted','qualified','lost'
    ],
    default: 'pending_approval'
  },
  gstin: { type: String},
  bestTimeToCall: { type: String },
  callResponse:  { type: String, enum: ["Picked", "Not Response", "Talk to later"], default: 'Picked' },
  denialReason: String,
  remark: { type: String },
  transactions: [
  {
    type: Object, 
    default: []
  }
],
projects: [
  {
    type: Object, 
    default: []
  }
],

}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export default Lead;
