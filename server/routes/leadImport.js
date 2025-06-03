import express from 'express';
import multer from 'multer';
import csv from 'csvtojson';
import Lead from '../models/Lead.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/import',
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    try {
      const rows = await csv({ trim: true, ignoreEmpty: true })
        .fromString(req.file.buffer.toString('utf-8'));

      const docs = [];
      rows.forEach((r, idx) => {
        const rawEmail = r.email?.trim();
        if (!rawEmail) {
          console.warn(`Skipping row ${idx + 1}: missing or empty email`, r);
          return;
        }



        docs.push({
          name: r.name?.trim() || '',
          email: rawEmail.toLowerCase(),
          phone: r.phone?.trim() || '',
          company: r.company?.trim() || '',
          jobTitle: r.jobTitle?.trim() || '',
          address: r.address?.trim() || '',
          city: r.city?.trim() || '',
          state: r.state?.trim() || '',
          country: r.country?.trim() || '',
          zipCode: r.zipCode?.trim() || '',
          website: r.website?.trim() || '',
          linkedIn: r.linkedIn?.trim() || '',
          source: ['Website', 'Referral', 'LinkedIn', 'Cold Call'].includes(r.source)
            ? r.source
            : undefined,
          industry: ['IT', 'Retail', 'Manufacturing', 'Other'].includes(r.industry)
            ? r.industry
            : undefined,
          notes: r.notes?.trim() || '',
          status: r.status?.trim() || undefined,
          denialReason: r.denialReason?.trim() || '',
        });
      });

      if (!docs.length) {
        return res.status(400).json({ message: 'No valid rows to import' });
      }

      const inserted = await Lead.insertMany(docs, { ordered: false });

      return res.json({
        message: `Imported ${inserted.length} leads successfully.`,
        insertedCount: inserted.length,
      });
    } catch (err) {
      console.error('Lead import error:', err);
      return res
        .status(500)
        .json({ message: 'Import failed', error: err.message });
    }
  }
);

export default router;
