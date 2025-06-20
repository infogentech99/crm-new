import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName:   String, // Changed from 'company' to 'companyName'
  jobTitle:  String,
  description: String, // Removed as it's now part of notes
  position:  String, // Removed as it's mapped to jobTitle
  address:   String,
  city:      String,
  state:     String,
  country:   String,
  zipCode:   String,
  website:   String,
  linkedIn:  String,
  source:    { type: String, enum: ['Website','Referral','LinkedIn','Cold Call','Other'], default: 'Website' },
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
