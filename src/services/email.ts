import nodemailer from "nodemailer";

const password = process.env.MAIL_PASSWORD;
const email = process.env.MAIL_USER;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});
