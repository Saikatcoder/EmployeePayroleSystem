import nodemailer from "nodemailer";
// export const sendEmail = async ({ email, subject, message }) => {
  
 
//   await transpoter.sendMail(options);
// };
import dotenv from 'dotenv';
dotenv.config();


export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

  