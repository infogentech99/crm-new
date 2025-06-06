import { IncomingForm } from 'formidable';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    const toField = Array.isArray(fields.to) ? fields.to.join(',') : fields.to;
    const subjectField = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
    const bodyField = Array.isArray(fields.body) ? fields.body[0] : fields.body;

    const fileList = Array.isArray(files.attachments)
      ? files.attachments
      : files.attachments
        ? [files.attachments]
        : [];

    const attachments = fileList.map((file) => ({
      filename: file.originalFilename,
      path: file.filepath,
      contentType: file.mimetype,
    }));

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "infogentech99@gmail.com", 
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: "infogentech99@gmail.com",
        to: toField,
        subject: subjectField,
        html: bodyField,
        attachments,
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
      console.error('Email send error:', err);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });
}
