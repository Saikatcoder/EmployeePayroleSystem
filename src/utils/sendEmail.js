import nodemailer from "nodemailer";

import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (options)=>{
    const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const mailoptions = {
  from: process.env.SMTP_MAIL,
  to: options.email,
  subject: options.subject,
  html: options.html,
};

  try {
  await transporter.sendMail(mailoptions);
  console.log("Email sent successfully");
} catch (error) {
  console.error("Email send failed:", error);
  throw error;
}


}



