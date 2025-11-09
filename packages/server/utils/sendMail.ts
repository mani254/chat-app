import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

async function sendMail({ subject, html, to }: { subject: string; html: string; to: string }) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SIB_API_KEY,
      },
    });

    const mailOptions = {
      from: '"Chat - app" <manikantadev254@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export default sendMail;
