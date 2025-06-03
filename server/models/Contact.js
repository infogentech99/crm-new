import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String },
  phone:     { type: String },
  company:   String,
  jobTitle:  String,
  address:   String,
  city:      String,
  state:     String,
  country:   String,
  zipCode:   String,
  website:   String,
  linkedIn:  String,
  source:    String,
  industry:  String,
  notes:     String,
}, { timestamps: true });

const Contact = mongoose.model('Contact', ContactSchema);
export default Contact;
