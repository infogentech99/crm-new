import nodemailer from "nodemailer";

export default async function SendUserEmail(req, res) {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "example@gmail.com",  // Replace with your company email
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "example@gmail.com", // Replace with your company email
      to,
      subject,
      html: `<p>${body.replace(/\n/g, "<br>")}</p>`,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
