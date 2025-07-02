import { IncomingForm } from 'formidable';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = new IncomingForm();

  form.parse(req, async (err, fields) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'Failed to parse form data' });
    }

    const pdfBase64 = Array.isArray(fields.pdfBase64) ? fields.pdfBase64[0] : fields.pdfBase64;
    const customerEmail = Array.isArray(fields.customerEmail) ? fields.customerEmail[0] : fields.customerEmail;
    const invoiceId = Array.isArray(fields.invoiceId) ? fields.invoiceId[0] : fields.invoiceId;
    const clientName = Array.isArray(fields.clientName) ? fields.clientName[0] : fields.clientName;

    if (!pdfBase64 || !customerEmail || !invoiceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'infogentech99@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });


      await transporter.sendMail({
        from: 'infogentech99@gmail.com',
        to: customerEmail,
        subject: `Invoice - ${invoiceId}`,
        html: `
          <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            Dear ${clientName || 'Customer'},
          </p>
          <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            Please find your invoice attached. Thank you for choosing <strong>InfoGenTech Softwares LLP</strong>.
          </p>
          <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            Regards,<br/>InfoGenTech Team<br/>
            <a href="https://infogentech.com" style="color: #0d6efd;">www.infogentech.com</a>
          </p>
        `,
        attachments: [
          {
            filename: `invoice-${invoiceId}.pdf`,
            content: pdfBase64.split('base64,')[1],
            encoding: 'base64',
          },
        ],
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Email sending failed' });
    }
  });
}
