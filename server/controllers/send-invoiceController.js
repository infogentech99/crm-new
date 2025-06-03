import nodemailer from "nodemailer";

export default async function downloadEmail(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { pdfBase64, customerEmail, invoiceId ,clientName } = req.body;

 

  if (!pdfBase64 || !customerEmail) {
    return res.status(400).json({ error: "Missing PDF or email" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "example@gmail.com", // Replace company email
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `example@gmail.com`, // Replace company email
      to: customerEmail,
      subject: `Invoice - ${invoiceId}`,
      html: `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  Dear ${clientName || "Customer"},
</p>

<p style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  Please find your invoice attached with this email. If you have any questions or require further assistance, feel free to get in touch with us.
</p>

<p style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  Thank you for choosing <strong>InfoGenTech Softwares LLP</strong>.
</p>

<p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; margin-top: 20px;">
  Best regards,<br/>
  <strong>InfoGenTech Team</strong><br/>
  <a href="https://infogentech.com" style="color: #0d6efd; text-decoration: none;">www.infogentech.com</a><br/>
  Email: <a href="mailto:example@infogentech.com" style="color: #0d6efd;">example@infogentech.com</a><br/>
  Phone: +91 000000000000
</p>
`,
      attachments: [
        {
          filename: `invoice-${invoiceId}.pdf`,
          content: pdfBase64.split("base64,")[1],
          encoding: "base64",
        },
      ],
    });

    res.status(200).json({ message: "Email sent" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Email send failed" });
  }
}
