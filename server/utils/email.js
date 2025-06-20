import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "infogentech99@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html  }) => {
  await transporter.sendMail({
    from: "infogentech99@gmail.com",
    to,
    subject,
    html,
  });
};