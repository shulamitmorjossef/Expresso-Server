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
  export function sendOrderConfirmationEmail(to, orderId) {
    const mailOptions = {
      from: 'expressodontreply@gmail.com',
      to,
      subject: `🧾 Expresso Order Confirmation #${orderId}`,
      text: `Hi!\n\nThank you for your order!\nYour order number is: ${orderId}.\n\nWe will process and ship your order as soon as possible.\n\nEnjoy your coffee ☕\n\n⚠️ This is an automatic message. Please do not reply.`
    };
  
    return transporter.sendMail(mailOptions);
  }
  
