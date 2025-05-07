// src/utils/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'expressodontreply@gmail.com',
    pass: 'hboj qwyk gzlg mgdj'
  }
});

export function sendResetEmail(to, password) {
    const mailOptions = {
      from: 'expressodontreply@gmail.com',
      to,
      subject: '🔐 Your new Expresso password',
      text: `Hi!\n\nHere is your new password: ${password}\nYou can update it anytime from your personal area on the Expresso website.\n\n⚠️ This is an automatic message. Please do not reply to this email.`
    };
  
    return transporter.sendMail(mailOptions);
  }
  
