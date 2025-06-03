import Contact from '../models/Contact.js';

export const createContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

// Get All Contacts
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    next(err);
  }
};

// Get Single Contact
export const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

// Update Contact
export const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

// Delete Contact
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
};
